/**
 * Heady Payment System - Stripe Integration
 * 
 * Features:
 * - Stripe payment processing
 * - Subscription management
 * - Webhook handling
 * - Invoice generation
 * - Usage-based billing
 * - Tax calculation
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { HeadyUserAuth } = require('../auth/user-auth');

// Price IDs (create these in Stripe Dashboard)
const PRICES = {
  pro_monthly: 'price_pro_monthly', // $29/month
  pro_yearly: 'price_pro_yearly',   // $290/year (2 months free)
  enterprise_monthly: 'price_enterprise_monthly', // $99/month
  enterprise_yearly: 'price_enterprise_yearly',   // $990/year
  api_credits: 'price_api_credits', // $10 for 10,000 extra calls
  storage_upgrade: 'price_storage_upgrade' // $5 for 10GB extra
};

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  pro: {
    name: 'Pro',
    description: 'For developers and teams',
    prices: {
      monthly: { amount: 2900, currency: 'usd', priceId: PRICES.pro_monthly },
      yearly: { amount: 29000, currency: 'usd', priceId: PRICES.pro_yearly }
    },
    features: [
      'Unlimited chat with HeadyBuddy',
      '10,000 API calls per month',
      '10GB storage',
      'Arena Merge (parallel development)',
      'Priority support',
      'All Heady models'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For organizations with advanced needs',
    prices: {
      monthly: { amount: 9900, currency: 'usd', priceId: PRICES.enterprise_monthly },
      yearly: { amount: 99000, currency: 'usd', priceId: PRICES.enterprise_yearly }
    },
    features: [
      'Everything in Pro',
      'Unlimited API calls',
      '100GB storage',
      'Custom model training',
      'Dedicated support',
      'White-label options',
      'SLA guarantee'
    ]
  }
};

class HeadyPayments {
  constructor(authInstance) {
    this.auth = authInstance;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  // Create checkout session for subscription
  async createSubscriptionCheckout(userId, plan, interval = 'monthly') {
    const user = Array.from(this.auth.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const planConfig = SUBSCRIPTION_PLANS[plan];
    if (!planConfig) {
      throw new Error('Invalid plan');
    }

    const price = planConfig.prices[interval];
    if (!price) {
      throw new Error('Invalid interval');
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: price.priceId,
        quantity: 1
      }],
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      metadata: {
        userId,
        plan,
        interval
      }
    });

    return session;
  }

  // Create checkout session for one-time purchase
  async createOneTimeCheckout(userId, itemType, quantity = 1) {
    const user = Array.from(this.auth.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    let priceId, description;
    switch (itemType) {
      case 'api_credits':
        priceId = PRICES.api_credits;
        description = `10,000 extra API calls`;
        break;
      case 'storage_upgrade':
        priceId = PRICES.storage_upgrade;
        description = `10GB extra storage`;
        break;
      default:
        throw new Error('Invalid item type');
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price: priceId,
        quantity
      }],
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
      metadata: {
        userId,
        itemType,
        quantity: quantity.toString()
      }
    });

    return session;
  }

  // Create customer portal session
  async createCustomerPortalSession(userId) {
    const user = Array.from(this.auth.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get or create Stripe customer
    let customerId = user.metadata.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId }
      });
      customerId = customer.id;
      user.metadata.stripeCustomerId = customerId;
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.FRONTEND_URL}/billing`
    });

    return session;
  }

  // Handle webhook events
  async handleWebhook(rawBody, signature) {
    const event = stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  // Handle successful checkout
  async handleCheckoutCompleted(session) {
    const { userId, plan, interval } = session.metadata;
    const user = Array.from(this.auth.users.values()).find(u => u.id === userId);

    if (!user) return;

    // Update user subscription
    user.subscriptionTier = plan;
    user.subscription = {
      stripeSubscriptionId: session.subscription,
      status: 'active',
      plan,
      interval,
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + (interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
    };

    // Store Stripe customer ID
    if (session.customer) {
      user.metadata.stripeCustomerId = session.customer;
    }

    console.log(`User ${userId} subscribed to ${plan} (${interval})`);
  }

  // Handle successful payment
  async handlePaymentSucceeded(invoice) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const user = Array.from(this.auth.users.values()).find(u =>
      u.metadata.stripeCustomerId === subscription.customer
    );

    if (!user) return;

    // Update subscription period
    user.subscription.currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    // Reset usage for new billing period
    if (user.subscriptionTier !== 'free') {
      user.usage.apiCalls = 0;
      user.usage.storage = 0;
    }

    console.log(`Payment succeeded for user ${user.id}`);
  }

  // Handle failed payment
  async handlePaymentFailed(invoice) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const user = Array.from(this.auth.users.values()).find(u =>
      u.metadata.stripeCustomerId === subscription.customer
    );

    if (!user) return;

    user.subscription.status = 'past_due';
    console.log(`Payment failed for user ${user.id}`);
  }

  // Handle subscription update
  async handleSubscriptionUpdated(subscription) {
    const user = Array.from(this.auth.users.values()).find(u =>
      u.metadata.stripeCustomerId === subscription.customer
    );

    if (!user) return;

    user.subscription.status = subscription.status;
    user.subscription.currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
    user.subscription.currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  }

  // Handle subscription cancellation
  async handleSubscriptionDeleted(subscription) {
    const user = Array.from(this.auth.users.values()).find(u =>
      u.metadata.stripeCustomerId === subscription.customer
    );

    if (!user) return;

    // Downgrade to free tier
    user.subscriptionTier = 'free';
    user.subscription = {
      status: 'canceled',
      canceledAt: new Date().toISOString()
    };

    console.log(`Subscription canceled for user ${user.id}`);
  }

  // Get user's billing info
  async getBillingInfo(userId) {
    const user = Array.from(this.auth.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    let subscription = null;
    if (user.subscription?.stripeSubscriptionId) {
      try {
        subscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
      } catch (error) {
        // Subscription might be deleted
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        subscriptionTier: user.subscriptionTier
      },
      subscription,
      plans: SUBSCRIPTION_PLANS
    };
  }

  // Cancel subscription
  async cancelSubscription(userId, immediate = false) {
    const user = Array.from(this.auth.users.values()).find(u => u.id === userId);
    if (!user || !user.subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription');
    }

    if (immediate) {
      await stripe.subscriptions.del(user.subscription.stripeSubscriptionId);
    } else {
      await stripe.subscriptions.update(user.subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
    }

    return { success: true };
  }

  // Get usage metrics
  getUsageMetrics(userId) {
    const user = Array.from(this.auth.users.values()).find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const tier = this.auth.getSubscriptionInfo(user);

    return {
      current: user.usage || { apiCalls: 0, storage: 0 },
      limits: tier.limits,
      percentages: {
        apiCalls: ((user.usage?.apiCalls || 0) / tier.limits.apiCalls * 100).toFixed(1),
        storage: ((user.usage?.storage || 0) / tier.limits.storage * 100).toFixed(1)
      }
    };
  }
}

module.exports = { HeadyPayments, SUBSCRIPTION_PLANS, PRICES };

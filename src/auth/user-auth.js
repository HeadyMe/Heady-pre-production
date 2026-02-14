/**
 * Heady User Authentication System
 * 
 * Features:
 * - JWT-based authentication
 * - OAuth providers (Google, GitHub)
 * - Email/password with bcrypt
 * - Session management
 * - Role-based access control
 * - Subscription tier validation
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { ScalableCache } = require('../scalable-cache');

// In-memory user store (replace with database in production)
const users = new Map();
const sessions = new Map();
const refreshTokens = new Set();

// Cache for session lookups
const cache = new ScalableCache({ maxSize: 5000, ttlMs: 15 * 60 * 1000, prefix: "auth:" });

// JWT Secrets
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');

// Subscription tiers
const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    limits: { apiCalls: 100, storage: 100, models: ['heady-buddy'] },
    features: ['basic_chat', 'limited_api']
  },
  pro: {
    name: 'Pro',
    limits: { apiCalls: 10000, storage: 10000, models: ['heady-buddy', 'heady-full'] },
    features: ['full_chat', 'api_access', 'priority_support', 'arena_merge']
  },
  enterprise: {
    name: 'Enterprise',
    limits: { apiCalls: 100000, storage: 100000, models: ['*'] },
    features: ['unlimited', 'custom_models', 'dedicated_support', 'white_label']
  }
};

class HeadyUserAuth {
  constructor() {
    this.saltRounds = 12;
  }

  // Generate JWT tokens
  generateTokens(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      tier: user.subscriptionTier,
      roles: user.roles || []
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    refreshTokens.add(refreshToken);

    return { accessToken, refreshToken };
  }

  // Verify access token
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token) {
    try {
      if (!refreshTokens.has(token)) return null;
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (error) {
      refreshTokens.delete(token);
      return null;
    }
  }

  // Hash password
  async hashPassword(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  // Verify password
  async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  // Register new user
  async register(email, password, metadata = {}) {
    if (users.has(email)) {
      throw new Error('User already exists');
    }

    const passwordHash = await this.hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      email,
      passwordHash,
      subscriptionTier: 'free',
      roles: ['user'],
      createdAt: new Date().toISOString(),
      lastLogin: null,
      metadata: {
        name: metadata.name || email.split('@')[0],
        ...metadata
      },
      usage: {
        apiCalls: 0,
        storage: 0
      }
    };

    users.set(email, user);
    return user;
  }

  // Login user
  async login(email, password) {
    const user = users.get(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    user.lastLogin = new Date().toISOString();
    const tokens = this.generateTokens(user);

    // Cache session
    cache.set(`session:${user.id}`, {
      user,
      tokens,
      createdAt: Date.now()
    });

    return { user, tokens };
  }

  // OAuth login (simplified)
  async oauthLogin(provider, profile) {
    const email = profile.email;
    let user = users.get(email);

    if (!user) {
      // Auto-register OAuth users
      user = await this.register(email, crypto.randomBytes(32).toString('hex'), {
        name: profile.name,
        avatar: profile.avatar,
        provider
      });
      user.roles.push('oauth_user');
    }

    user.lastLogin = new Date().toISOString();
    const tokens = this.generateTokens(user);

    cache.set(`session:${user.id}`, {
      user,
      tokens,
      createdAt: Date.now()
    });

    return { user, tokens };
  }

  // Refresh tokens
  async refreshTokens(refreshToken) {
    const decoded = this.verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error('Invalid refresh token');
    }

    const user = Array.from(users.values()).find(u => u.id === decoded.sub);
    if (!user) {
      throw new Error('User not found');
    }

    // Remove old refresh token
    refreshTokens.delete(refreshToken);

    const tokens = this.generateTokens(user);
    cache.set(`session:${user.id}`, {
      user,
      tokens,
      createdAt: Date.now()
    });

    return tokens;
  }

  // Logout
  logout(refreshToken) {
    refreshTokens.delete(refreshToken);
    // Clear cache entries
    cache.clear();
  }

  // Get user from token
  getUserFromToken(accessToken) {
    const decoded = this.verifyAccessToken(accessToken);
    if (!decoded) return null;

    const user = Array.from(users.values()).find(u => u.id === decoded.sub);
    return user;
  }

  // Check subscription limits
  checkSubscriptionLimits(user, action, amount = 1) {
    const tier = SUBSCRIPTION_TIERS[user.subscriptionTier];
    if (!tier) return false;

    switch (action) {
      case 'api_call':
        return user.usage.apiCalls + amount <= tier.limits.apiCalls;
      case 'storage':
        return user.usage.storage + amount <= tier.limits.storage;
      case 'model_access':
        return tier.limits.models.includes('*') || tier.limits.models.includes(amount);
      default:
        return true;
    }
  }

  // Update usage
  updateUsage(userId, action, amount = 1) {
    const user = Array.from(users.values()).find(u => u.id === userId);
    if (!user) return;

    switch (action) {
      case 'api_call':
        user.usage.apiCalls += amount;
        break;
      case 'storage':
        user.usage.storage += amount;
        break;
    }
  }

  // Get subscription info
  getSubscriptionInfo(user) {
    const tier = SUBSCRIPTION_TIERS[user.subscriptionTier];
    return {
      tier: user.subscriptionTier,
      name: tier.name,
      limits: tier.limits,
      features: tier.features,
      usage: user.usage
    };
  }

  // Middleware for Express
  requireAuth() {
    return (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const user = this.getUserFromToken(token);

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      req.user = user;
      next();
    };
  }

  // Require specific subscription tier
  requireTier(minTier) {
    const tierOrder = ['free', 'pro', 'enterprise'];
    const minIndex = tierOrder.indexOf(minTier);

    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const userIndex = tierOrder.indexOf(req.user.subscriptionTier);
      if (userIndex < minIndex) {
        return res.status(403).json({ 
          error: 'Subscription required',
          required: minTier,
          current: req.user.subscriptionTier
        });
      }

      next();
    };
  }

  // Check feature access
  requireFeature(feature) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const tier = SUBSCRIPTION_TIERS[req.user.subscriptionTier];
      if (!tier.features.includes(feature)) {
        return res.status(403).json({ 
          error: 'Feature not available',
          feature,
          tier: req.user.subscriptionTier
        });
      }

      next();
    };
  }
}

module.exports = { HeadyUserAuth, SUBSCRIPTION_TIERS };

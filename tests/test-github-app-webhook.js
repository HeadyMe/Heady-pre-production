const crypto = require('crypto');
const GitHubAppWebhookHandler = require('../src/github-app-webhook-handler');

/**
 * Simple test suite for GitHub App Webhook Handler
 * Run with: node tests/test-github-app-webhook.js
 */

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function createMockRequest(event, payload, secret) {
  const body = payload;
  const bodyString = JSON.stringify(body);
  const signature = 'sha256=' + crypto.createHmac('sha256', secret).update(bodyString).digest('hex');
  
  return {
    headers: {
      'x-github-event': event,
      'x-github-delivery': crypto.randomUUID(),
      'x-hub-signature-256': signature
    },
    body
  };
}

function createMockResponse() {
  let statusCode = 200;
  let responseData = null;
  
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
    getStatus() { return statusCode; },
    getData() { return responseData; }
  };
}

async function runTests() {
  console.log('�� Testing GitHub App Webhook Handler...\n');
  
  const testSecret = 'test-webhook-secret';
  const handler = new GitHubAppWebhookHandler({
    appId: '12345',
    webhookSecret: testSecret,
    privateKey: null
  });
  
  console.log('Test 1: Signature verification');
  const payload1 = JSON.stringify({ action: 'opened', number: 1 });
  const validSignature = 'sha256=' + crypto.createHmac('sha256', testSecret).update(payload1).digest('hex');
  const invalidSignature = 'sha256=' + crypto.createHmac('sha256', 'wrong-secret').update(payload1).digest('hex');
  
  assert(handler.verifySignature(payload1, validSignature), 'Valid signature should pass');
  assert(!handler.verifySignature(payload1, invalidSignature), 'Invalid signature should fail');
  console.log('✅ Signature verification works correctly\n');
  
  console.log('Test 2: Valid webhook handling');
  const req2 = createMockRequest('pull_request', {
    action: 'opened',
    number: 42,
    pull_request: {
      number: 42,
      title: 'Test PR',
      head: { ref: 'feature/test-branch' }
    }
  }, testSecret);
  const res2 = createMockResponse();
  
  await handler.handleWebhook(req2, res2);
  
  assert(res2.getStatus() === 200, 'Should return 200 for valid webhook');
  assert(res2.getData().ok === true, 'Response should have ok: true');
  console.log('✅ Valid webhook processed successfully\n');
  
  console.log('🎉 All basic tests passed!\n');
  console.log('Statistics:', JSON.stringify(handler.getStats(), null, 2));
}

runTests().catch((error) => {
  console.error('❌ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

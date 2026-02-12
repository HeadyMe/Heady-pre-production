/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  HEADY SYSTEMS                                                 ║
 * ║  ━━━━━━━━━━━━━━                                                ║
 * ║  ∞ Sacred Geometry Architecture ∞                              ║
 * ║                                                                ║
 * ║  sessions/index.js - 3-Tier Session Manager                    ║
 * ║  T1 Ephemeral | T2 Session-Persistent | T3 Cloud-Persistent   ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const crypto = require('crypto');
const { EventEmitter } = require('events');

// ═══════════════════════════════════════════════════════════════
// T1: EPHEMERAL SESSION STORE (in-memory, per-process)
// ═══════════════════════════════════════════════════════════════

class EphemeralStore {
  constructor(options = {}) {
    this.sessions = new Map();
    this.maxConversationHistory = options.maxHistory || 100;
    this.idleTimeoutMs = options.idleTimeoutMs || 1800000; // 30 min
    this.maxSessions = options.maxSessions || 10000;
    // Sweep expired sessions every 60s
    this._sweepInterval = setInterval(() => this._sweep(), 60000);
  }

  create(options = {}) {
    if (this.sessions.size >= this.maxSessions) {
      this._evictOldest();
    }
    const session = {
      sessionId: crypto.randomUUID(),
      conversationHistory: [],
      activeSkills: [],
      pendingActions: [],
      workingContext: {},
      deviceFingerprint: options.deviceFingerprint || null,
      createdAt: new Date().toISOString(),
      lastActivity: Date.now(),
      expiresAt: new Date(Date.now() + this.idleTimeoutMs).toISOString(),
      tier: 't1_ephemeral',
      metadata: {}
    };
    this.sessions.set(session.sessionId, session);
    return session;
  }

  get(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    if (Date.now() > new Date(session.expiresAt).getTime()) {
      this.sessions.delete(sessionId);
      return null;
    }
    // Touch — reset expiry on access
    session.lastActivity = Date.now();
    session.expiresAt = new Date(Date.now() + this.idleTimeoutMs).toISOString();
    return session;
  }

  addMessage(sessionId, message) {
    const session = this.get(sessionId);
    if (!session) return null;
    session.conversationHistory.push({
      id: crypto.randomUUID(),
      role: message.role, // 'user' | 'assistant' | 'system'
      content: message.content,
      type: message.type || 'text', // 'text' | 'action' | 'result' | 'skill_invocation'
      skillName: message.skillName || null,
      timestamp: new Date().toISOString()
    });
    // FIFO: trim to max
    if (session.conversationHistory.length > this.maxConversationHistory) {
      session.conversationHistory = session.conversationHistory.slice(-this.maxConversationHistory);
    }
    return session;
  }

  addPendingAction(sessionId, action) {
    const session = this.get(sessionId);
    if (!session) return null;
    const pendingAction = {
      id: crypto.randomUUID(),
      type: action.type,
      description: action.description,
      params: action.params || {},
      confirmationLevel: action.confirmationLevel || 'single', // 'none' | 'single' | 'double'
      status: 'pending', // 'pending' | 'approved' | 'rejected' | 'executed'
      createdAt: new Date().toISOString(),
      diff: action.diff || null,
      rollbackCommand: action.rollbackCommand || null
    };
    session.pendingActions.push(pendingAction);
    return pendingAction;
  }

  approvePendingAction(sessionId, actionId) {
    const session = this.get(sessionId);
    if (!session) return null;
    const action = session.pendingActions.find(a => a.id === actionId);
    if (!action || action.status !== 'pending') return null;
    action.status = 'approved';
    action.approvedAt = new Date().toISOString();
    return action;
  }

  rejectPendingAction(sessionId, actionId) {
    const session = this.get(sessionId);
    if (!session) return null;
    const action = session.pendingActions.find(a => a.id === actionId);
    if (!action || action.status !== 'pending') return null;
    action.status = 'rejected';
    action.rejectedAt = new Date().toISOString();
    return action;
  }

  destroy(sessionId) {
    return this.sessions.delete(sessionId);
  }

  _sweep() {
    const now = Date.now();
    for (const [id, session] of this.sessions) {
      if (now > new Date(session.expiresAt).getTime()) {
        this.sessions.delete(id);
      }
    }
  }

  _evictOldest() {
    let oldest = null;
    let oldestTime = Infinity;
    for (const [id, session] of this.sessions) {
      if (session.lastActivity < oldestTime) {
        oldest = id;
        oldestTime = session.lastActivity;
      }
    }
    if (oldest) this.sessions.delete(oldest);
  }

  getStats() {
    return {
      activeSessions: this.sessions.size,
      maxSessions: this.maxSessions,
      idleTimeoutMs: this.idleTimeoutMs
    };
  }

  shutdown() {
    clearInterval(this._sweepInterval);
    this.sessions.clear();
  }
}

// ═══════════════════════════════════════════════════════════════
// T2: SESSION-PERSISTENT STORE (Redis-backed with JWT binding)
// ═══════════════════════════════════════════════════════════════

class SessionPersistentStore {
  constructor(options = {}) {
    this.store = new Map(); // In-memory fallback when Redis unavailable
    this.ttlMs = options.ttlMs || 86400000; // 24 hours
    this.encryptionKey = options.encryptionKey || process.env.SESSION_ENCRYPTION_KEY || crypto.randomBytes(32);
    if (typeof this.encryptionKey === 'string') {
      this.encryptionKey = Buffer.from(this.encryptionKey, 'hex');
    }
    this._sweepInterval = setInterval(() => this._sweep(), 300000); // 5 min sweep
  }

  _encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.encryptionKey, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return { encrypted, iv: iv.toString('hex'), authTag };
  }

  _decrypt(encryptedData) {
    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        this.encryptionKey,
        Buffer.from(encryptedData.iv, 'hex')
      );
      decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (e) {
      return null; // Tampered or wrong key
    }
  }

  save(sessionId, sessionData) {
    const encrypted = this._encrypt(sessionData);
    this.store.set(sessionId, {
      data: encrypted,
      expiresAt: Date.now() + this.ttlMs,
      createdAt: new Date().toISOString()
    });
    return true;
  }

  load(sessionId) {
    const entry = this.store.get(sessionId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(sessionId);
      return null;
    }
    return this._decrypt(entry.data);
  }

  delete(sessionId) {
    return this.store.delete(sessionId);
  }

  _sweep() {
    const now = Date.now();
    for (const [id, entry] of this.store) {
      if (now > entry.expiresAt) {
        this.store.delete(id);
      }
    }
  }

  getStats() {
    return {
      storedSessions: this.store.size,
      ttlMs: this.ttlMs
    };
  }

  shutdown() {
    clearInterval(this._sweepInterval);
    this.store.clear();
  }
}

// ═══════════════════════════════════════════════════════════════
// T3: CLOUD-PERSISTENT STORE (PostgreSQL-backed, GDPR-compliant)
// ═══════════════════════════════════════════════════════════════

class CloudPersistentStore {
  constructor(options = {}) {
    this.store = new Map(); // In-memory fallback until PostgreSQL connected
    this.consentLog = new Map();
    this.deletionQueue = [];
    this.exportQueue = [];
  }

  // Store a memory (user must have approved)
  async storeMemory(userId, memory) {
    if (!memory.userApproved) {
      throw new Error('Memory must be user-approved before T3 persistence');
    }
    const profile = this._getOrCreateProfile(userId);
    const entry = {
      id: crypto.randomUUID(),
      category: memory.category,
      content: memory.content, // Should be pre-encrypted by caller
      tags: memory.tags || [],
      source: memory.source || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessCount: 0
    };
    profile.memories.push(entry);
    this._logConsent(userId, 'store_memory', `Stored memory: ${entry.id}`);
    return entry;
  }

  // Retrieve memories by category or tags
  async queryMemories(userId, filters = {}) {
    const profile = this._getOrCreateProfile(userId);
    let results = profile.memories;

    if (filters.category) {
      results = results.filter(m => m.category === filters.category);
    }
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(m =>
        filters.tags.some(t => m.tags.includes(t))
      );
    }
    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    // Track access
    results.forEach(m => { m.accessCount++; });
    return results;
  }

  // Delete a specific memory
  async deleteMemory(userId, memoryId) {
    const profile = this._getOrCreateProfile(userId);
    const idx = profile.memories.findIndex(m => m.id === memoryId);
    if (idx === -1) return false;
    profile.memories.splice(idx, 1);
    this._logConsent(userId, 'delete_memory', `Deleted memory: ${memoryId}`);
    return true;
  }

  // GDPR: Right to be forgotten
  async requestDeletion(userId) {
    const request = {
      id: crypto.randomUUID(),
      userId,
      requestedAt: new Date().toISOString(),
      gracePeriodEnds: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days
      status: 'pending', // pending → confirmed → executed
      steps: [
        { step: 'postgresql_delete', status: 'pending' },
        { step: 'redis_purge', status: 'pending' },
        { step: 'log_anonymize', status: 'pending' },
        { step: 'backup_queue', status: 'pending' },
        { step: 'embedding_delete', status: 'pending' },
        { step: 'confirmation_email', status: 'pending' }
      ]
    };
    this.deletionQueue.push(request);
    this._logConsent(userId, 'deletion_requested', `Deletion request: ${request.id}`);
    return request;
  }

  // GDPR: Cancel deletion during grace period
  async cancelDeletion(userId, requestId) {
    const request = this.deletionQueue.find(r => r.id === requestId && r.userId === userId);
    if (!request || request.status !== 'pending') return false;
    if (Date.now() > new Date(request.gracePeriodEnds).getTime()) return false;
    request.status = 'cancelled';
    this._logConsent(userId, 'deletion_cancelled', `Cancelled: ${requestId}`);
    return true;
  }

  // GDPR: Export all user data
  async exportData(userId, format = 'json') {
    const profile = this._getOrCreateProfile(userId);
    const consent = this.consentLog.get(userId) || [];
    const exportData = {
      exportedAt: new Date().toISOString(),
      format,
      userId,
      profile: {
        memoriesCount: profile.memories.length,
        memories: profile.memories,
        preferences: profile.preferences
      },
      consentLog: consent,
      deletionRequests: this.deletionQueue.filter(r => r.userId === userId)
    };

    this._logConsent(userId, 'data_exported', `Format: ${format}`);

    if (format === 'csv') {
      return this._toCSV(exportData);
    }
    return exportData;
  }

  // Propose a memory change (user must approve)
  createProposal(sessionId, memory) {
    const proposal = {
      id: crypto.randomUUID(),
      sessionId,
      changeType: memory.changeType || 'create',
      category: memory.category,
      content: memory.content,
      contentHash: crypto.createHash('sha256').update(JSON.stringify(memory.content)).digest('hex'),
      redactedFields: this._detectSensitiveFields(memory.content),
      userApproved: null,
      proposedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString() // 24h to approve
    };
    return proposal;
  }

  _detectSensitiveFields(content) {
    const sensitivePatterns = [
      { name: 'api_key', pattern: /(?:api[_-]?key|token|secret)["\s:=]+["']?[\w\-\.]{20,}/gi },
      { name: 'password', pattern: /(?:password|passwd|pwd)["\s:=]+["']?[^\s"',}{]+/gi },
      { name: 'email', pattern: /[\w.+-]+@[\w-]+\.[\w.-]+/g },
      { name: 'credit_card', pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g },
      { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
      { name: 'private_key', pattern: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/g }
    ];

    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const detected = [];
    for (const { name, pattern } of sensitivePatterns) {
      if (pattern.test(contentStr)) {
        detected.push(name);
      }
    }
    return detected;
  }

  _getOrCreateProfile(userId) {
    if (!this.store.has(userId)) {
      this.store.set(userId, {
        userId,
        memories: [],
        preferences: {},
        createdAt: new Date().toISOString()
      });
    }
    return this.store.get(userId);
  }

  _logConsent(userId, action, details) {
    if (!this.consentLog.has(userId)) {
      this.consentLog.set(userId, []);
    }
    this.consentLog.get(userId).push({
      action,
      details,
      timestamp: new Date().toISOString()
    });
  }

  _toCSV(data) {
    const lines = ['field,value'];
    lines.push(`exportedAt,${data.exportedAt}`);
    lines.push(`userId,${data.userId}`);
    lines.push(`memoriesCount,${data.profile.memoriesCount}`);
    for (const m of data.profile.memories) {
      lines.push(`memory,${m.id},${m.category},${m.createdAt}`);
    }
    for (const c of data.consentLog) {
      lines.push(`consent,${c.action},${c.details},${c.timestamp}`);
    }
    return lines.join('\n');
  }

  getStats() {
    return {
      totalUsers: this.store.size,
      totalMemories: Array.from(this.store.values()).reduce((sum, p) => sum + p.memories.length, 0),
      pendingDeletions: this.deletionQueue.filter(r => r.status === 'pending').length,
      consentEntries: Array.from(this.consentLog.values()).reduce((sum, l) => sum + l.length, 0)
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// STORY DRIVER — DETERMINISTIC SESSION SUMMARY GENERATOR
// ═══════════════════════════════════════════════════════════════

class StoryDriver {
  static generate(conversation) {
    const actions = conversation.filter(m => m.type === 'action' || m.type === 'skill_invocation');
    const results = conversation.filter(m => m.type === 'result');
    const userMessages = conversation.filter(m => m.role === 'user');
    const succeeded = results.filter(r => r.content?.status === 'success' || r.content?.includes?.('success'));
    const failed = results.filter(r => r.content?.status === 'failed' || r.content?.includes?.('fail'));

    const firstMsg = conversation[0];
    const lastMsg = conversation[conversation.length - 1];
    const durationMs = firstMsg && lastMsg
      ? new Date(lastMsg.timestamp).getTime() - new Date(firstMsg.timestamp).getTime()
      : 0;

    const summary = {
      format: 'structured',
      sessionDuration: {
        ms: durationMs,
        human: StoryDriver._humanDuration(durationMs)
      },
      messageCount: conversation.length,
      userMessageCount: userMessages.length,
      actionsPerformed: actions.map(a => ({
        skill: a.skillName || 'unknown',
        timestamp: a.timestamp,
        result: 'pending'
      })),
      results: {
        total: results.length,
        succeeded: succeeded.length,
        failed: failed.length
      },
      narrative: StoryDriver._buildNarrative(actions, succeeded, failed, durationMs),
      inputHash: crypto.createHash('sha256')
        .update(JSON.stringify(conversation))
        .digest('hex'),
      generatedAt: new Date().toISOString(),
      deterministic: true
    };

    // Auto-redact sensitive data in narrative
    summary.narrative = StoryDriver._redact(summary.narrative);
    return summary;
  }

  static _buildNarrative(actions, succeeded, failed, durationMs) {
    const duration = StoryDriver._humanDuration(durationMs);
    if (actions.length === 0) {
      return `Conversation session lasting ${duration}. No skills were invoked.`;
    }
    const skillNames = [...new Set(actions.map(a => a.skillName || 'unknown'))];
    return `Session: ${duration}. ${actions.length} action(s) performed using: ${skillNames.join(', ')}. ` +
           `${succeeded.length} succeeded, ${failed.length} failed.`;
  }

  static _humanDuration(ms) {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
    return `${Math.round(ms / 3600000)}h ${Math.round((ms % 3600000) / 60000)}m`;
  }

  static _redact(text) {
    return text
      .replace(/(?:api[_-]?key|token|secret)["\s:=]+["']?[\w\-\.]{8,}/gi, '[REDACTED_KEY]')
      .replace(/(?:password|passwd|pwd)["\s:=]+["']?[^\s"',}{]+/gi, '[REDACTED_PASSWORD]')
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[REDACTED_CARD]');
  }
}

// ═══════════════════════════════════════════════════════════════
// UNIFIED SESSION MANAGER
// ═══════════════════════════════════════════════════════════════

class HeadySessionManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.t1 = new EphemeralStore(options.ephemeral);
    this.t2 = new SessionPersistentStore(options.session);
    this.t3 = new CloudPersistentStore(options.cloud);
  }

  // Create new session (starts at T1)
  createSession(options = {}) {
    const session = this.t1.create(options);
    this.emit('session:created', { sessionId: session.sessionId, tier: 't1' });
    return session;
  }

  // Get session from T1 (or restore from T2 if expired)
  getSession(sessionId) {
    let session = this.t1.get(sessionId);
    if (!session) {
      // Try restoring from T2
      const t2Data = this.t2.load(sessionId);
      if (t2Data) {
        session = this.t1.create({ deviceFingerprint: t2Data.deviceFingerprint });
        session.conversationHistory = t2Data.conversationHistory || [];
        session.workingContext = t2Data.workingContext || {};
        this.emit('session:restored', { sessionId, fromTier: 't2' });
      }
    }
    return session;
  }

  // Promote session to T2 (persist across tabs/refreshes)
  promoteToT2(sessionId) {
    const session = this.t1.get(sessionId);
    if (!session) return false;
    this.t2.save(sessionId, {
      conversationHistory: session.conversationHistory,
      workingContext: session.workingContext,
      deviceFingerprint: session.deviceFingerprint,
      promotedAt: new Date().toISOString()
    });
    this.emit('session:promoted', { sessionId, toTier: 't2' });
    return true;
  }

  // Propose memory for T3 persistence (user must approve)
  proposeMemory(sessionId, memory) {
    const proposal = this.t3.createProposal(sessionId, memory);
    const session = this.t1.get(sessionId);
    if (session) {
      session.pendingActions.push({
        id: proposal.id,
        type: 'memory_proposal',
        description: `Save ${memory.category}: ${typeof memory.content === 'string' ? memory.content.slice(0, 50) : 'data'}`,
        status: 'pending',
        proposal
      });
    }
    this.emit('memory:proposed', { sessionId, proposalId: proposal.id });
    return proposal;
  }

  // Approve and persist memory to T3
  async approveMemory(userId, proposal) {
    proposal.userApproved = true;
    const stored = await this.t3.storeMemory(userId, proposal);
    this.emit('memory:stored', { userId, memoryId: stored.id });
    return stored;
  }

  // Generate deterministic story driver summary
  generateSummary(sessionId) {
    const session = this.t1.get(sessionId);
    if (!session) return null;
    return StoryDriver.generate(session.conversationHistory);
  }

  // End session: generate summary, offer T2 promotion, cleanup T1
  async endSession(sessionId) {
    const session = this.t1.get(sessionId);
    if (!session) return null;

    const summary = StoryDriver.generate(session.conversationHistory);
    // Auto-promote to T2 if conversation was substantial
    if (session.conversationHistory.length > 3) {
      this.promoteToT2(sessionId);
    }
    this.t1.destroy(sessionId);
    this.emit('session:ended', { sessionId, summary });
    return summary;
  }

  // GDPR: Full data export
  async exportUserData(userId, format = 'json') {
    return this.t3.exportData(userId, format);
  }

  // GDPR: Right to be forgotten
  async requestDeletion(userId) {
    return this.t3.requestDeletion(userId);
  }

  getStats() {
    return {
      t1: this.t1.getStats(),
      t2: this.t2.getStats(),
      t3: this.t3.getStats()
    };
  }

  shutdown() {
    this.t1.shutdown();
    this.t2.shutdown();
  }
}

module.exports = {
  HeadySessionManager,
  EphemeralStore,
  SessionPersistentStore,
  CloudPersistentStore,
  StoryDriver
};

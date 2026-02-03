/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           HEADY SECRETS MANAGER - Secure Storage             ║
 * ║                                                              ║
 * ║     💖 Made with Love by HeadyConnection & HeadySystems     ║
 * ║                        Team 💖                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 * 
 * ASCII Flow:
 * 
 *     🔑 INPUT          🔐 ENCRYPT         💾 STORE          🌍 INJECT
 *        │                  │                  │                  │
 *        ▼                  ▼                  ▼                  ▼
 *    ┌────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
 *    │ Secret │─────▶│AES-256   │─────▶│ .secrets/│─────▶│  ENV     │
 *    │ Value  │      │GCM       │      │ *.enc    │      │  VARS    │
 *    └────────┘      └──────────┘      └──────────┘      └──────────┘
 *        │                  │                  │                  │
 *        └──────────────────┴──────────────────┴──────────────────┘
 *                              │
 *                              ▼
 *                    ┌──────────────────┐
 *                    │   AUDIT LOG      │
 *                    │ Complete Trail   │
 *                    └──────────────────┘
 * 
 * Features:
 * - AES-256-GCM encryption (military-grade)
 * - Encrypted storage in .secrets/ directory
 * - Environment variable injection
 * - Secure input methods (interactive, file, env, bulk)
 * - Complete audit logging
 * - Secret rotation support
 * - Export/backup capability
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

class SecretsManager {
  constructor(config = {}) {
    this.config = {
      secretsDir: config.secretsDir || path.join(process.cwd(), '.secrets'),
      encryptionKey: config.encryptionKey || process.env.HEADY_ENCRYPTION_KEY,
      algorithm: 'aes-256-gcm',
      auditLog: config.auditLog || path.join(process.cwd(), 'audit_logs', 'secrets_audit.jsonl'),
      ...config
    };

    this.secrets = new Map();
    this.initialized = false;
  }

  /**
   * Initialize secrets manager
   */
  async initialize() {
    // Ensure secrets directory exists
    await fs.mkdir(this.config.secretsDir, { recursive: true });
    
    // Ensure audit log directory exists
    await fs.mkdir(path.dirname(this.config.auditLog), { recursive: true });
    
    // Generate encryption key if not provided
    if (!this.config.encryptionKey) {
      this.config.encryptionKey = crypto.randomBytes(32).toString('hex');
      console.warn('[SECRETS] No encryption key provided, generated temporary key');
      console.warn('[SECRETS] Set HEADY_ENCRYPTION_KEY environment variable for persistence');
    }
    
    this.initialized = true;
    await this.auditLog('secrets_manager_initialized', {});
    
    console.log('[SECRETS] Secrets Manager initialized');
  }

  /**
   * Ingest secret from interactive prompt
   */
  async ingestInteractive(secretName) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve, reject) => {
      rl.question(`Enter value for ${secretName} (hidden): `, async (value) => {
        rl.close();
        
        try {
          await this.storeSecret(secretName, value);
          console.log(`✅ Secret '${secretName}' stored securely`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      
      // Hide input (doesn't work in all terminals)
      if (rl.input.isTTY) {
        rl.input.setRawMode(true);
      }
    });
  }

  /**
   * Ingest secret from file
   */
  async ingestFromFile(secretName, filepath) {
    try {
      const value = await fs.readFile(filepath, 'utf8');
      await this.storeSecret(secretName, value.trim());
      
      await this.auditLog('secret_ingested_from_file', {
        secretName,
        filepath
      });
      
      console.log(`✅ Secret '${secretName}' ingested from file`);
    } catch (err) {
      throw new Error(`Failed to ingest secret from file: ${err.message}`);
    }
  }

  /**
   * Ingest secret from environment variable
   */
  async ingestFromEnv(secretName, envVarName) {
    const value = process.env[envVarName];
    
    if (!value) {
      throw new Error(`Environment variable ${envVarName} not found`);
    }
    
    await this.storeSecret(secretName, value);
    
    await this.auditLog('secret_ingested_from_env', {
      secretName,
      envVarName
    });
    
    console.log(`✅ Secret '${secretName}' ingested from environment`);
  }

  /**
   * Ingest multiple secrets from .env file
   */
  async ingestFromEnvFile(envFilePath) {
    try {
      const content = await fs.readFile(envFilePath, 'utf8');
      const lines = content.split('\n');
      let count = 0;
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          await this.storeSecret(key, value);
          count++;
        }
      }
      
      await this.auditLog('secrets_ingested_from_env_file', {
        filepath: envFilePath,
        count
      });
      
      console.log(`✅ Ingested ${count} secrets from ${envFilePath}`);
      return count;
    } catch (err) {
      throw new Error(`Failed to ingest from .env file: ${err.message}`);
    }
  }

  /**
   * Store secret securely (encrypted)
   */
  async storeSecret(name, value) {
    if (!this.initialized) {
      throw new Error('Secrets Manager not initialized');
    }

    // Encrypt the secret
    const encrypted = this.encrypt(value);
    
    // Store in memory
    this.secrets.set(name, encrypted);
    
    // Persist to disk
    const secretPath = path.join(this.config.secretsDir, `${name}.enc`);
    await fs.writeFile(secretPath, JSON.stringify(encrypted), 'utf8');
    
    await this.auditLog('secret_stored', { secretName: name });
  }

  /**
   * Retrieve secret (decrypted)
   */
  async getSecret(name) {
    // Check memory first
    if (this.secrets.has(name)) {
      const encrypted = this.secrets.get(name);
      return this.decrypt(encrypted);
    }
    
    // Load from disk
    const secretPath = path.join(this.config.secretsDir, `${name}.enc`);
    try {
      const content = await fs.readFile(secretPath, 'utf8');
      const encrypted = JSON.parse(content);
      this.secrets.set(name, encrypted);
      
      return this.decrypt(encrypted);
    } catch (err) {
      throw new Error(`Secret '${name}' not found`);
    }
  }

  /**
   * List all stored secrets (names only)
   */
  async listSecrets() {
    const files = await fs.readdir(this.config.secretsDir);
    return files
      .filter(f => f.endsWith('.enc'))
      .map(f => f.replace('.enc', ''));
  }

  /**
   * Delete secret
   */
  async deleteSecret(name) {
    this.secrets.delete(name);
    
    const secretPath = path.join(this.config.secretsDir, `${name}.enc`);
    try {
      await fs.unlink(secretPath);
      await this.auditLog('secret_deleted', { secretName: name });
      console.log(`✅ Secret '${name}' deleted`);
    } catch (err) {
      throw new Error(`Failed to delete secret: ${err.message}`);
    }
  }

  /**
   * Rotate secret (generate new value)
   */
  async rotateSecret(name, newValue) {
    const oldExists = this.secrets.has(name);
    
    await this.storeSecret(name, newValue);
    
    await this.auditLog('secret_rotated', {
      secretName: name,
      hadPreviousValue: oldExists
    });
    
    console.log(`✅ Secret '${name}' rotated`);
  }

  /**
   * Inject secrets into environment
   */
  async injectIntoEnvironment() {
    const secretNames = await this.listSecrets();
    let count = 0;
    
    for (const name of secretNames) {
      try {
        const value = await this.getSecret(name);
        process.env[name] = value;
        count++;
      } catch (err) {
        console.warn(`[SECRETS] Failed to inject ${name}: ${err.message}`);
      }
    }
    
    await this.auditLog('secrets_injected_to_env', { count });
    console.log(`✅ Injected ${count} secrets into environment`);
    
    return count;
  }

  /**
   * Encrypt value
   */
  encrypt(plaintext) {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(this.config.encryptionKey, 'hex');
    
    const cipher = crypto.createCipheriv(this.config.algorithm, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt value
   */
  decrypt(encryptedData) {
    const key = Buffer.from(this.config.encryptionKey, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(this.config.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Audit log
   */
  async auditLog(action, details) {
    const entry = {
      timestamp: new Date().toISOString(),
      action,
      details
    };
    
    try {
      await fs.appendFile(this.config.auditLog, JSON.stringify(entry) + '\n');
    } catch (err) {
      console.error('[SECRETS] Audit log failed:', err.message);
    }
  }

  /**
   * Export secrets to .env format (for backup)
   */
  async exportToEnvFile(outputPath) {
    const secretNames = await this.listSecrets();
    const lines = [];
    
    for (const name of secretNames) {
      try {
        const value = await this.getSecret(name);
        lines.push(`${name}=${value}`);
      } catch (err) {
        console.warn(`[SECRETS] Failed to export ${name}`);
      }
    }
    
    await fs.writeFile(outputPath, lines.join('\n'), 'utf8');
    await this.auditLog('secrets_exported', { outputPath, count: lines.length });
    
    console.log(`✅ Exported ${lines.length} secrets to ${outputPath}`);
    return lines.length;
  }
}

module.exports = SecretsManager;

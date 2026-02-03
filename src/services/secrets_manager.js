/**
 * Secrets Manager - Secure credential storage
 */
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SecretsManager {
  constructor() {
    this.secretsDir = path.join(process.cwd(), '.secrets');
    this.encryptedSecrets = new Map();
  }

  async initialize() {
    if (!fs.existsSync(this.secretsDir)) {
      fs.mkdirSync(this.secretsDir, { recursive: true });
    }
    console.log('[SecretsManager] Initialized');
  }

  async storeSecret(name, value) {
    const encrypted = this.encrypt(value);
    this.encryptedSecrets.set(name, encrypted);
    await this.persistSecret(name, encrypted);
  }

  async persistSecret(name, encrypted) {
    const filePath = path.join(this.secretsDir, `${name}.enc`);
    fs.writeFileSync(filePath, JSON.stringify(encrypted));
  }

  async ingestFromEnvFile(filepath) {
    if (!fs.existsSync(filepath)) return 0;
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    let count = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length) {
        await this.storeSecret(key.trim(), valueParts.join('=').trim());
        count++;
      }
    }
    return count;
  }

  async listSecrets() {
    return Array.from(this.encryptedSecrets.keys());
  }

  async injectIntoEnvironment() {
    let count = 0;
    for (const [name, encrypted] of this.encryptedSecrets) {
      const value = this.decrypt(encrypted);
      if (value) {
        process.env[name] = value;
        count++;
      }
    }
    return count;
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(process.env.MASTER_SECRET || 'default', 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return { iv: iv.toString('hex'), tag: tag.toString('hex'), data: encrypted.toString('hex') };
  }

  decrypt(encrypted) {
    try {
      const key = crypto.scryptSync(process.env.MASTER_SECRET || 'default', 'salt', 32);
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(encrypted.iv, 'hex'));
      decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
      const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted.data, 'hex')), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (e) {
      return null;
    }
  }
}

module.exports = SecretsManager;

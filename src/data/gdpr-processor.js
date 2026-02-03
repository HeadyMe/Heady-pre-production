const crypto = require('crypto');

class GDPRProcessor {
  constructor() {
    this.encryptionKey = process.env.DATA_ENCRYPTION_KEY || crypto.randomBytes(32);
    this.algorithm = 'aes-256-gcm';
  }
  
  encrypt(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex')
    };
  }
  
  decrypt(encrypted) {
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      Buffer.from(encrypted.iv, 'hex')
    );
    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
    let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  }
  
  pseudonymize(data) {
    const pseudonymMap = new Map();
    const pseudonymized = { ...data };
    
    // Replace identifiers with tokens
    if (pseudonymized.email) {
      if (!pseudonymMap.has(pseudonymized.email)) {
        pseudonymMap.set(
          pseudonymized.email,
          crypto.createHash('sha256').update(pseudonymized.email).digest('hex')
        );
      }
      pseudonymized.email = pseudonymMap.get(pseudonymized.email);
    }
    
    // Repeat for other PII fields
    return pseudonymized;
  }
}

module.exports = new GDPRProcessor();

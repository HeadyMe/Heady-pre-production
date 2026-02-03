const crypto = require('crypto');
const fs = require('fs');

class AuditEngine {
  constructor() {
    this.logPath = './audit-logs';
    fs.mkdirSync(this.logPath, { recursive: true });
  }
  
  log(event, user, resource, outcome) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      user,
      resource,
      outcome,
      hash: '' // Will be set after writing
    };
    
    const logFile = `${this.logPath}/audit-${new Date().toISOString().split('T')[0]}.log`;
    const entryString = JSON.stringify(entry);
    
    // Create hash chain
    const lastHash = this.getLastHash(logFile);
    const hashInput = lastHash + entryString;
    entry.hash = crypto.createHash('sha256').update(hashInput).digest('hex');
    
    fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
  }
  
  getLastHash(logFile) {
    if (!fs.existsSync(logFile)) return 'genesis';
    const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);
    if (lines.length === 0) return 'genesis';
    const lastEntry = JSON.parse(lines[lines.length - 1]);
    return lastEntry.hash;
  }
}

module.exports = new AuditEngine();

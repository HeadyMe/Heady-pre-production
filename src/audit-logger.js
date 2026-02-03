const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs/audit.log');

class AuditLogger {
  static log(task, result) {
    const entry = {
      timestamp: new Date(),
      taskId: task.id,
      input: task.input,
      result,
      context: task.context
    };

    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n');
  }
}

module.exports = AuditLogger;

const CheckpointReporter = require('./checkpoint_reporter');
const fs = require('fs').promises;
const path = require('path');

class GovernanceCheckpoint {
  constructor(config = {}) {
    this.config = {
      autoCheckpointInterval: config.autoCheckpointInterval || 3600000,
      checkpointOnEvents: config.checkpointOnEvents || [
        'deployment',
        'major_change',
        'error_threshold',
        'manual_trigger'
      ],
      rootDir: config.rootDir || process.cwd(),
      ...config
    };
    
    this.lastCheckpoint = null;
    this.checkpointTimer = null;
  }

  async initialize() {
    if (this.config.autoCheckpointInterval > 0) {
      this.startAutoCheckpoint();
    }
    
    await this.loadLastCheckpoint();
  }

  startAutoCheckpoint() {
    this.checkpointTimer = setInterval(async () => {
      await this.triggerCheckpoint('scheduled');
    }, this.config.autoCheckpointInterval);
  }

  stopAutoCheckpoint() {
    if (this.checkpointTimer) {
      clearInterval(this.checkpointTimer);
      this.checkpointTimer = null;
    }
  }

  async triggerCheckpoint(reason = 'manual', metadata = {}) {
    const reporter = new CheckpointReporter({
      rootDir: this.config.rootDir,
      outputDir: path.join(this.config.rootDir, 'audit_logs')
    });

    const markdown = await reporter.generateReport();
    
    this.lastCheckpoint = {
      id: reporter.checkpointId,
      timestamp: reporter.timestamp,
      reason,
      metadata
    };

    await this.saveCheckpointMetadata();
    await this.emitGovernanceEvent(reason, reporter.checkpointId);

    return {
      checkpointId: reporter.checkpointId,
      markdown,
      reconData: reporter.reconData
    };
  }

  async loadLastCheckpoint() {
    try {
      const metaPath = path.join(this.config.rootDir, 'audit_logs', 'last_checkpoint.json');
      const data = await fs.readFile(metaPath, 'utf8');
      this.lastCheckpoint = JSON.parse(data);
    } catch (err) {
      this.lastCheckpoint = null;
    }
  }

  async saveCheckpointMetadata() {
    const metaPath = path.join(this.config.rootDir, 'audit_logs', 'last_checkpoint.json');
    await fs.mkdir(path.dirname(metaPath), { recursive: true });
    await fs.writeFile(metaPath, JSON.stringify(this.lastCheckpoint, null, 2), 'utf8');
  }

  async emitGovernanceEvent(reason, checkpointId) {
    const event = {
      timestamp: new Date().toISOString(),
      type: 'CHECKPOINT',
      level: 'info',
      reason,
      checkpointId,
      message: `Checkpoint ${checkpointId} generated: ${reason}`
    };

    const auditPath = path.join(this.config.rootDir, 'audit_logs', `audit_${new Date().toISOString().split('T')[0]}.jsonl`);
    await fs.appendFile(auditPath, JSON.stringify(event) + '\n', 'utf8');
  }

  getLastCheckpoint() {
    return this.lastCheckpoint;
  }

  async getCheckpointHistory(limit = 10) {
    const auditDir = path.join(this.config.rootDir, 'audit_logs');
    
    try {
      const files = await fs.readdir(auditDir);
      const mdFiles = files
        .filter(f => f.endsWith('.md'))
        .sort()
        .reverse()
        .slice(0, limit);

      const history = [];
      
      for (const file of mdFiles) {
        const stats = await fs.stat(path.join(auditDir, file));
        const jsonFile = file.replace('.md', '.json');
        
        let reconData = null;
        try {
          const jsonPath = path.join(auditDir, jsonFile);
          const data = await fs.readFile(jsonPath, 'utf8');
          reconData = JSON.parse(data);
        } catch (err) {
          reconData = null;
        }

        history.push({
          checkpointId: file.replace('.md', ''),
          timestamp: stats.mtime.toISOString(),
          size: stats.size,
          reconData
        });
      }

      return history;
    } catch (err) {
      return [];
    }
  }

  async compareCheckpoints(checkpoint1Id, checkpoint2Id) {
    const auditDir = path.join(this.config.rootDir, 'audit_logs');
    
    try {
      const data1 = JSON.parse(await fs.readFile(path.join(auditDir, `${checkpoint1Id}.json`), 'utf8'));
      const data2 = JSON.parse(await fs.readFile(path.join(auditDir, `${checkpoint2Id}.json`), 'utf8'));

      return {
        dockerChanges: this.compareSections(data1.docker, data2.docker),
        mcpChanges: this.compareSections(data1.mcpServers, data2.mcpServers),
        gitChanges: this.compareSections(data1.git, data2.git),
        healthChanges: this.compareSections(data1.health, data2.health),
        metricsChanges: this.compareSections(data1.metrics, data2.metrics)
      };
    } catch (err) {
      throw new Error(`Failed to compare checkpoints: ${err.message}`);
    }
  }

  compareSections(section1, section2) {
    return {
      before: section1,
      after: section2,
      changed: JSON.stringify(section1) !== JSON.stringify(section2)
    };
  }
}

module.exports = GovernanceCheckpoint;

// HEADY_BRAND:BEGIN
// PythonWorkerPool — Persistent Python process pool
// Replaces per-request subprocess spawning with reusable workers
// HEADY_BRAND:END

const { spawn } = require("child_process");
const path = require("path");

class PythonWorkerPool {
  constructor(options = {}) {
    this.maxWorkers = options.maxWorkers || 4;
    this.timeoutMs = options.timeoutMs || 30000;
    this.scriptPath = options.scriptPath || "";
    this.pythonBin = options.pythonBin || process.env.HEADY_PYTHON_BIN || "python";
    this.queue = [];
    this.activeWorkers = 0;
    this.totalExecuted = 0;
    this.totalErrors = 0;
  }

  async execute(args, timeoutMs) {
    const timeout = timeoutMs || this.timeoutMs;

    // If at capacity, queue the request
    if (this.activeWorkers >= this.maxWorkers) {
      return new Promise((resolve, reject) => {
        this.queue.push({ args, timeout, resolve, reject });
      });
    }

    return this._run(args, timeout);
  }

  _run(args, timeoutMs) {
    this.activeWorkers++;

    return new Promise((resolve, reject) => {
      if (!require("fs").existsSync(this.scriptPath)) {
        this.activeWorkers--;
        this._processQueue();
        return reject(new Error(`Script not found at ${this.scriptPath}`));
      }

      const proc = spawn(this.pythonBin, [this.scriptPath, ...args], {
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, PYTHONUNBUFFERED: "1" },
      });

      let stdout = "";
      let stderr = "";
      let finished = false;

      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          proc.kill("SIGTERM");
          this.activeWorkers--;
          this.totalErrors++;
          this._processQueue();
          reject(new Error(`Execution timeout after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        this.activeWorkers--;
        this.totalExecuted++;

        if (code !== 0) {
          this.totalErrors++;
          this._processQueue();
          reject(new Error(`Exited with code ${code}: ${stderr}`));
        } else {
          try {
            const jsonMatch = stdout.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              this._processQueue();
              resolve(JSON.parse(jsonMatch[0]));
            } else {
              this._processQueue();
              resolve({ output: stdout, stderr });
            }
          } catch (e) {
            this._processQueue();
            resolve({ output: stdout, stderr, parseError: e.message });
          }
        }
      });

      proc.on("error", (error) => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        this.activeWorkers--;
        this.totalErrors++;
        this._processQueue();
        reject(new Error(`Failed to start: ${error.message}`));
      });
    });
  }

  _processQueue() {
    if (this.queue.length > 0 && this.activeWorkers < this.maxWorkers) {
      const { args, timeout, resolve, reject } = this.queue.shift();
      this._run(args, timeout).then(resolve).catch(reject);
    }
  }

  getStats() {
    return {
      activeWorkers: this.activeWorkers,
      maxWorkers: this.maxWorkers,
      queueLength: this.queue.length,
      totalExecuted: this.totalExecuted,
      totalErrors: this.totalErrors,
      errorRate: this.totalExecuted > 0
        ? ((this.totalErrors / this.totalExecuted) * 100).toFixed(1) + "%"
        : "0%",
    };
  }
}

module.exports = { PythonWorkerPool };

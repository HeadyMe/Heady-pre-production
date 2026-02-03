/**
 * Worker Manager Stub
 * Provides basic worker management functionality
 */

class WorkerManager {
  constructor() {
    this.workers = new Map();
    this.taskQueue = [];
  }

  registerWorker(workerId, capabilities) {
    this.workers.set(workerId, {
      id: workerId,
      capabilities,
      status: 'active',
      lastHeartbeat: Date.now()
    });
    return { success: true, workerId };
  }

  getWorker(workerId) {
    return this.workers.get(workerId);
  }

  getAllWorkers() {
    return Array.from(this.workers.values());
  }

  removeWorker(workerId) {
    return this.workers.delete(workerId);
  }

  assignTask(workerId, task) {
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.currentTask = task;
      return { success: true };
    }
    return { success: false, error: 'Worker not found' };
  }
}

module.exports = new WorkerManager();

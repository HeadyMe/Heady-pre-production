// HEADY_BRAND:BEGIN
// Cluster wrapper — spawns one worker per CPU core for horizontal scaling
// Falls back to single-process if HEADY_CLUSTER=false or single-core
// HEADY_BRAND:END

const cluster = require("cluster");
const os = require("os");

const ENABLE_CLUSTER = process.env.HEADY_CLUSTER !== "false";
const NUM_WORKERS = parseInt(process.env.HEADY_WORKERS, 10) || os.cpus().length;

if (cluster.isPrimary && ENABLE_CLUSTER && NUM_WORKERS > 1) {
  console.log(`[Cluster] Primary ${process.pid} forking ${NUM_WORKERS} workers`);

  const workers = new Map();

  for (let i = 0; i < NUM_WORKERS; i++) {
    const worker = cluster.fork();
    workers.set(worker.id, { pid: worker.process.pid, startedAt: Date.now() });
  }

  cluster.on("exit", (worker, code, signal) => {
    console.warn(`[Cluster] Worker ${worker.process.pid} died (code=${code}, signal=${signal}). Restarting...`);
    workers.delete(worker.id);

    // Restart with backoff to prevent crash loops
    const restartDelay = workers.size === 0 ? 5000 : 1000;
    setTimeout(() => {
      const newWorker = cluster.fork();
      workers.set(newWorker.id, { pid: newWorker.process.pid, startedAt: Date.now() });
      console.log(`[Cluster] Replacement worker ${newWorker.process.pid} started`);
    }, restartDelay);
  });

  // Graceful shutdown: send SIGTERM to all workers
  const shutdown = (signal) => {
    console.log(`[Cluster] ${signal} received, shutting down ${workers.size} workers`);
    for (const id of cluster.workers ? Object.keys(cluster.workers) : []) {
      cluster.workers[id]?.process?.kill("SIGTERM");
    }
    setTimeout(() => {
      console.log("[Cluster] Force exit after timeout");
      process.exit(0);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

} else {
  if (ENABLE_CLUSTER && NUM_WORKERS > 1) {
    console.log(`[Cluster] Worker ${process.pid} starting`);
  }
  // Load the actual application
  require("./heady-manager.js");
}

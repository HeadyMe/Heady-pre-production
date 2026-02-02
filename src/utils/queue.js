const Queue = require('bull');

const queues = {};

const getQueue = (name) => {
  if (!queues[name]) {
    queues[name] = new Queue(name, process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  }
  return queues[name];
};

module.exports = { getQueue };

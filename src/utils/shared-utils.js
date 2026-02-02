const crypto = require('crypto');

const generateId = () => crypto.randomUUID();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeJsonParse = (str) => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

module.exports = {
  generateId,
  sleep,
  safeJsonParse,
};

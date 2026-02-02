const NodeCache = require('node-cache');

// Standard TTL 1 hour, check period 2 minutes
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

module.exports = { cache };

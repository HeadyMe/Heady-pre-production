const { handleRequest } = require('./server.js');

module.exports = {
    async fetch(request) {
        return handleRequest(request);
    }
};

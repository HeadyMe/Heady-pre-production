const WebSocket = require('ws');
const { EventEmitter } = require('events');

class RealtimeManager extends EventEmitter {
    constructor(server) {
        super();
        this.wss = new WebSocket.Server({ server });
        
        this.wss.on('connection', (ws, req) => {
            console.log('Client connected');
            
            ws.on('message', (message) => {
                try {
                    const parsed = JSON.parse(message);
                    this.emit('message', parsed, ws);
                } catch (e) {
                    console.error('Failed to parse message', e);
                }
            });

            ws.on('close', () => {
                console.log('Client disconnected');
            });
        });
    }

    broadcast(type, data) {
        const message = JSON.stringify({ type, data });
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}

module.exports = RealtimeManager;

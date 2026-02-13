/**
 * HeadyWeb — Local development server
 * Serves the HeadyWeb browser shell with HeadyBuddy sidebar
 * Production: deployed via Cloudflare Worker or served by heady-manager
 */

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.HEADYWEB_PORT || 3400;

app.use(cors());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'headyweb', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[HeadyWeb] Running on port ${PORT}`);
});

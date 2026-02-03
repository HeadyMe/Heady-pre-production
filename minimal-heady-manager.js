const express = require('express');
const app = express();
const port = 3300;

app.get('/api/health', (req, res) => {
  res.json({ status: 'operational' });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Minimal HeadyManager running on port ${port}`);
});

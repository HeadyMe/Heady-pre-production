const express = require('express');
const app = express();
const port = 3700;

app.get('/', (req, res) => {
  res.send('HeadyMCP running');
});

app.listen(port, () => {
  console.log(`HeadyMCP running on port ${port}`);
});

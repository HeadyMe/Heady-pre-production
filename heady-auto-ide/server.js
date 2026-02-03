const express = require('express');
const app = express();
const port = 3500;

app.get('/', (req, res) => {
  res.send('HeadyAutoIDE running');
});

app.listen(port, () => {
  console.log(`HeadyAutoIDE running on port ${port}`);
});

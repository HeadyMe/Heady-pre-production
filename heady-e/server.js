const express = require('express');
const app = express();
const port = 3600;

app.get('/', (req, res) => {
  res.send('HeadyE running');
});

app.listen(port, () => {
  console.log(`HeadyE running on port ${port}`);
});

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Heady Sonic Workspace Backend' });
});

// TODO: Add MCP proxy and task/notes endpoints

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

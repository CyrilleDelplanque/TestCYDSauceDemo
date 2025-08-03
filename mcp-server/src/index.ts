import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'MCP server is running' });
});

// MCP endpoint example
app.post('/mcp', (req, res) => {
  // Here you would handle MCP requests
  res.json({ message: 'MCP endpoint received', data: req.body });
});

app.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);
});

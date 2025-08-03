"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use(express_1.default.json());
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

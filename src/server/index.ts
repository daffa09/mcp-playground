import express from "express";
import { tools } from "./tools.js";
import { MCPInvokeRequest } from "../types/mcp.js";
import { rateLimiter } from "./middleware/rateLimiter.js";

const app = express();

// Middleware
app.use(express.json());

// CORS headers for web UI integration
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

// Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Rate limiting
app.use(rateLimiter(100, 60000)); // 100 requests per minute

// Tool discovery endpoint
app.get("/tools", (_, res) => {
  const publicTools = Object.entries(tools).map(([name, tool]) => ({
    name,
    description: tool.description,
    inputSchema: tool.inputSchema,
  }));

  res.json(publicTools);
});

// Tool invocation endpoint
app.post("/invoke", async (req, res) => {
  const body = req.body as MCPInvokeRequest;

  // Validate request structure
  if (!body.tool || !body.input) {
    return res.status(400).json({
      error: "Invalid request",
      message: "Request must include 'tool' and 'input' fields",
    });
  }

  const tool = tools[body.tool as keyof typeof tools];

  if (!tool) {
    return res.status(400).json({
      error: "Unknown tool",
      message: `Tool '${body.tool}' not found`,
    });
  }

  try {
    const startTime = Date.now();
    const result = await Promise.race([
      tool.handler(body.input),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Operation timeout")), 5000)
      ),
    ]);
    const duration = Date.now() - startTime;

    res.json({
      result,
      metadata: {
        tool: body.tool,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error(`Error executing tool '${body.tool}':`, err.message);

    // Don't expose system paths or sensitive info in error messages
    const safeMessage = err.message.includes("workspace")
      ? err.message
      : "An error occurred while executing the tool";

    res.status(500).json({
      error: "Tool execution failed",
      message: safeMessage,
      tool: body.tool,
    });
  }
});

// Health check endpoint
app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    tools_available: Object.keys(tools).length,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Endpoint ${req.path} not found`,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ MCP Server running at http://localhost:${PORT}`);
  console.log(`📋 Tools available: ${Object.keys(tools).length}`);
  console.log(`   ${Object.keys(tools).join(", ")}`);
});

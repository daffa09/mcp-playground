import { MCPTool, MCPInvokeResponse } from "../types";

const SERVER_URL = "http://localhost:3000";

/**
 * Fetch available MCP tools
 */
export async function fetchTools(): Promise<MCPTool[]> {
  const response = await fetch(`${SERVER_URL}/tools`);
  if (!response.ok) {
    throw new Error("Failed to fetch tools");
  }
  return response.json();
}

/**
 * Invoke an MCP tool
 */
export async function invokeTool(
  toolName: string,
  input: Record<string, any>
): Promise<MCPInvokeResponse> {
  const response = await fetch(`${SERVER_URL}/invoke`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tool: toolName,
      input,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || "Tool invocation failed");
  }
  
  return data;
}

/**
 * Check server health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${SERVER_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

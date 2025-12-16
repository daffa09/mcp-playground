export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, string>;
}

export interface MCPInvokeResponse {
  result?: any;
  error?: string;
  message?: string;
  metadata?: {
    tool: string;
    duration_ms: number;
    timestamp: string;
  };
}

export interface ToolInvocation {
  id: string;
  tool: string;
  input: Record<string, any>;
  status: "pending" | "success" | "error";
  result?: any;
  error?: string;
  duration_ms?: number;
  timestamp: string;
}

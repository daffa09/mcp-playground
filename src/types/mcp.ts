export type MCPTool = {
  name: string;
  description: string;
  inputSchema: Record<string, string>;
};

export type MCPInvokeRequest = {
  tool: string;
  input: Record<string, any>;
};

export type MCPInvokeResponse = {
  result?: any;
  error?: string;
  metadata?: {
    tool: string;
    duration_ms: number;
    timestamp: string;
  };
};

export type ToolInvocation = {
  id: string;
  tool: string;
  input: Record<string, any>;
  status: "pending" | "success" | "error";
  result?: any;
  error?: string;
  duration_ms?: number;
  timestamp: string;
};

export type UserIntent = {
  action: string;
  parameters?: Record<string, any>;
};

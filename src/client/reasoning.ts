import { MCPTool, UserIntent } from "../types/mcp.js";

/**
 * Simple intent classification based on keywords
 * In production, this would use an LLM API (OpenAI, Anthropic, Gemini)
 */
export function classifyIntent(userQuery: string): UserIntent {
  const query = userQuery.toLowerCase();

  // Read file intent
  if (query.includes("read") || query.includes("show me") || query.includes("content of")) {
    const pathMatch = userQuery.match(/['"]([^'"]+\.[\w]+)['"]/);
    if (pathMatch) {
      return {
        action: "read_file",
        parameters: { path: pathMatch[1] },
      };
    }
  }

  // List files intent
  if (query.includes("list") || query.includes("show all") || query.includes("find all")) {
    const intent: UserIntent = { action: "list_files", parameters: {} };

    // Check for file type pattern
    if (query.includes("typescript") || query.includes(".ts")) {
      intent.parameters!.pattern = "*.ts";
    } else if (query.includes("javascript") || query.includes(".js")) {
      intent.parameters!.pattern = "*.js";
    } else if (query.includes("json")) {
      intent.parameters!.pattern = "*.json";
    }

    return intent;
  }

  // Search intent
  if (query.includes("search") || query.includes("find") || query.includes("contains")) {
    const quotedMatch = userQuery.match(/["']([^"']+)["']/);
    if (quotedMatch) {
      return {
        action: "search_files",
        parameters: { query: quotedMatch[1] },
      };
    }
  }

  // File metadata intent
  if (query.includes("metadata") || query.includes("info about") || query.includes("details about")) {
    const pathMatch = userQuery.match(/['"]([^'"]+\.[\w]+)['"]/);
    if (pathMatch) {
      return {
        action: "file_metadata",
        parameters: { path: pathMatch[1] },
      };
    }
  }

  // Directory tree intent
  if (query.includes("tree") || query.includes("structure") || query.includes("hierarchy")) {
    return {
      action: "directory_tree",
      parameters: {},
    };
  }

  // Workspace stats intent
  if (query.includes("stats") || query.includes("statistics") || query.includes("overview")) {
    return {
      action: "workspace_stats",
      parameters: {},
    };
  }

  // Default: list files
  return {
    action: "list_files",
    parameters: { recursive: true },
  };
}

/**
 * Select the best tool based on available tools and user intent
 */
export function selectTool(
  intent: UserIntent,
  availableTools: MCPTool[]
): { tool: string; input: Record<string, any> } | null {
  const toolExists = availableTools.some((t) => t.name === intent.action);

  if (!toolExists) {
    return null;
  }

  return {
    tool: intent.action,
    input: intent.parameters || {},
  };
}

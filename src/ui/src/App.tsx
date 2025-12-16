import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { PromptInput } from "./components/PromptInput";
import { ToolTimeline } from "./components/ToolTimeline";
import { ResultViewer } from "./components/ResultViewer";
import { MCPTool, ToolInvocation } from "./types";
import { fetchTools, invokeTool } from "./services/mcpClient";
import "./App.css";

function App() {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [invocations, setInvocations] = useState<ToolInvocation[]>([]);
  const [selectedInvocation, setSelectedInvocation] =
    useState<ToolInvocation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available tools on mount
  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    try {
      const availableTools = await fetchTools();
      setTools(availableTools);
    } catch (err) {
      setError("Failed to connect to MCP server. Is it running on port 3000?");
      console.error(err);
    }
  };

  const handleSubmit = async (query: string) => {
    setIsProcessing(true);
    setError(null);

    // Create invocation record
    const invocationId = `inv-${Date.now()}`;
    const newInvocation: ToolInvocation = {
      id: invocationId,
      tool: "processing",
      input: { query },
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    setInvocations((prev) => [newInvocation, ...prev]);
    setSelectedInvocation(newInvocation);

    try {
      // Simple intent classification (can be replaced with LLM API)
      const { tool, input } = classifyIntent(query, tools);

      // Update invocation with tool details
      const updatedInvocation: ToolInvocation = {
        ...newInvocation,
        tool,
        input,
      };

      setInvocations((prev) =>
        prev.map((inv) => (inv.id === invocationId ? updatedInvocation : inv))
      );
      setSelectedInvocation(updatedInvocation);

      // Invoke the tool
      const response = await invokeTool(tool, input);

      // Update with success
      const successInvocation: ToolInvocation = {
        ...updatedInvocation,
        status: "success",
        result: response.result,
        duration_ms: response.metadata?.duration_ms,
      };

      setInvocations((prev) =>
        prev.map((inv) => (inv.id === invocationId ? successInvocation : inv))
      );
      setSelectedInvocation(successInvocation);
    } catch (err: any) {
      // Update with error
      const errorInvocation: ToolInvocation = {
        ...newInvocation,
        status: "error",
        error: err.message || "Unknown error occurred",
      };

      setInvocations((prev) =>
        prev.map((inv) => (inv.id === invocationId ? errorInvocation : inv))
      );
      setSelectedInvocation(errorInvocation);
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <Header toolsCount={tools.length} />

      <main className="app-main">
        <div className="app-container">
          {error && (
            <div className="app-error">
              <span className="error-icon">⚠️</span>
              {error}
              <button onClick={() => setError(null)} className="close-btn">
                ✕
              </button>
            </div>
          )}

          <div className="prompt-section">
            <PromptInput onSubmit={handleSubmit} isProcessing={isProcessing} />
          </div>

          <div className="content-sections">
            <div className="timeline-section">
              <h2>Tool Call Timeline</h2>
              <ToolTimeline
                invocations={invocations}
                onSelectInvocation={setSelectedInvocation}
                selectedId={selectedInvocation?.id}
              />
            </div>

            <div className="viewer-section">
              <h2>Result Viewer</h2>
              <ResultViewer invocation={selectedInvocation} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Simple intent classification
 * In production, this would call an LLM API
 */
function classifyIntent(
  query: string,
  tools: MCPTool[]
): { tool: string; input: Record<string, any> } {
  const q = query.toLowerCase();

  // Read file
  if (q.includes("read") || q.includes("show") || q.includes("content")) {
    const pathMatch = query.match(/['"]?([^\s'"]+\.\w+)['"]?/);
    if (pathMatch) {
      return { tool: "read_file", input: { path: pathMatch[1] } };
    }
  }

  // List files
  if (q.includes("list") || q.includes("show all") || q.includes("find all")) {
    const input: Record<string, any> = {};

    if (q.includes("typescript") || q.includes(".ts")) {
      input.pattern = "*.ts";
    } else if (q.includes("javascript") || q.includes(".js")) {
      input.pattern = "*.js";
    } else if (q.includes("json")) {
      input.pattern = "*.json";
    }

    return { tool: "list_files", input };
  }

  // Search
  if (q.includes("search") || q.includes("find") || q.includes("contains")) {
    const quotedMatch = query.match(/["']([^"']+)["']/);
    if (quotedMatch) {
      return { tool: "search_files", input: { query: quotedMatch[1] } };
    }
    // Extract last word as search term
    const words = query.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    return { tool: "search_files", input: { query: lastWord } };
  }

  // File metadata
  if (q.includes("metadata") || q.includes("info") || q.includes("details")) {
    const pathMatch = query.match(/['"]?([^\s'"]+\.\w+)['"]?/);
    if (pathMatch) {
      return { tool: "file_metadata", input: { path: pathMatch[1] } };
    }
  }

  // Directory tree
  if (q.includes("tree") || q.includes("structure") || q.includes("hierarchy")) {
    return { tool: "directory_tree", input: {} };
  }

  // Workspace stats
  if (q.includes("stats") || q.includes("statistics") || q.includes("overview")) {
    return { tool: "workspace_stats", input: {} };
  }

  // Default: list all files
  return { tool: "list_files", input: { recursive: true } };
}

export default App;

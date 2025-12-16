import React from "react";
import { ToolInvocation } from "../types";
import "./ResultViewer.css";

interface ResultViewerProps {
  invocation: ToolInvocation | null;
}

export const ResultViewer: React.FC<ResultViewerProps> = ({ invocation }) => {
  if (!invocation) {
    return (
      <div className="result-empty">
        <p className="empty-message">No tool selected</p>
        <p className="empty-hint">Click on a tool invocation to view results</p>
      </div>
    );
  }

  if (invocation.status === "pending") {
    return (
      <div className="result-pending">
        <div className="spinner"></div>
        <p>Executing {invocation.tool}...</p>
      </div>
    );
  }

  if (invocation.status === "error") {
    return (
      <div className="result-error">
        <div className="error-header">
          <span className="error-icon">⚠️</span>
          <h3>Error executing {invocation.tool}</h3>
        </div>
        <div className="error-content">
          <p>{invocation.error || "Unknown error occurred"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="result-viewer fade-in">
      <div className="result-header">
        <div>
          <h3 className="result-title">{invocation.tool}</h3>
          {invocation.duration_ms !== undefined && (
            <span className="result-meta">
              Completed in {invocation.duration_ms}ms
            </span>
          )}
        </div>
        <button
          className="copy-btn"
          onClick={() => {
            navigator.clipboard.writeText(
              JSON.stringify(invocation.result, null, 2)
            );
          }}
          title="Copy result"
        >
          📋 Copy
        </button>
      </div>

      <div className="result-content">
        {renderResult(invocation.tool, invocation.result)}
      </div>
    </div>
  );
};

function renderResult(toolName: string, result: any) {
  // read_file: Display as code
  if (toolName === "read_file") {
    return (
      <pre className="code-block">
        <code>{result}</code>
      </pre>
    );
  }

  // list_files: Display as file list
  if (toolName === "list_files") {
    if (!result || result.length === 0) {
      return <p className="text-secondary">No files found</p>;
    }
    return (
      <div className="file-list">
        {result.map((file: any, i: number) => (
          <div key={i} className="file-item">
            <span className="file-icon">📄</span>
            <div className="file-info">
              <span className="file-path monospace">{file.path}</span>
              <span className="file-meta text-secondary">
                {formatBytes(file.size)} • {new Date(file.modified).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // search_files: Display as search results
  if (toolName === "search_files") {
    if (!result || !result.results || result.results.length === 0) {
      return <p className="text-secondary">No matches found</p>;
    }
    return (
      <div className="search-results">
        <p className="search-summary">
          Found {result.total_matches} matches for "{result.query}"
          {result.total_matches > result.results.length &&
            ` (showing first ${result.results.length})`
          }
        </p>
        {result.results.map((match: any, i: number) => (
          <div key={i} className="search-result">
            <div className="result-location">
              <span className="file-path monospace">{match.file}</span>
              <span className="line-number">Line {match.line}</span>
            </div>
            <pre className="result-content-preview">
              <code>{match.content}</code>
            </pre>
          </div>
        ))}
      </div>
    );
  }

  // file_metadata: Display as key-value pairs
  if (toolName === "file_metadata") {
    return (
      <div className="metadata-grid">
        <div className="metadata-item">
          <span className="metadata-label">Size:</span>
          <span className="metadata-value">{formatBytes(result.size)}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Extension:</span>
          <span className="metadata-value monospace">{result.extension || "none"}</span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Created:</span>
          <span className="metadata-value">
            {new Date(result.created).toLocaleString()}
          </span>
        </div>
        <div className="metadata-item">
          <span className="metadata-label">Modified:</span>
          <span className="metadata-value">
            {new Date(result.modified).toLocaleString()}
          </span>
        </div>
        {result.lines !== undefined && (
          <div className="metadata-item">
            <span className="metadata-label">Lines:</span>
            <span className="metadata-value">{result.lines}</span>
          </div>
        )}
      </div>
    );
  }

  // directory_tree: Display as preformatted text
  if (toolName === "directory_tree") {
    return (
      <pre className="tree-view">
        <code>{result}</code>
      </pre>
    );
  }

  // workspace_stats: Display as statistics dashboard
  if (toolName === "workspace_stats") {
    return (
      <div className="stats-dashboard">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Files</span>
            <span className="stat-value">{result.total_files}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Size</span>
            <span className="stat-value">{formatBytes(result.total_size)}</span>
          </div>
        </div>

        <div className="stats-section">
          <h4>File Types</h4>
          <div className="file-types">
            {Object.entries(result.file_types).map(([ext, count]: [string, any]) => (
              <div key={ext} className="file-type-item">
                <span className="file-type-ext monospace">{ext}</span>
                <span className="file-type-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {result.largest_files && result.largest_files.length > 0 && (
          <div className="stats-section">
            <h4>Largest Files</h4>
            <div className="largest-files">
              {result.largest_files.map((file: any, i: number) => (
                <div key={i} className="file-item">
                  <span className="file-path monospace">{file.path}</span>
                  <span className="file-size">{formatBytes(file.size)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default: Display as JSON
  return (
    <pre className="json-view">
      <code>{JSON.stringify(result, null, 2)}</code>
    </pre>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

import React, { useState } from "react";
import { ToolInvocation } from "../types";
import "./ToolTimeline.css";

interface ToolTimelineProps {
  invocations: ToolInvocation[];
  onSelectInvocation: (invocation: ToolInvocation) => void;
  selectedId?: string;
}

export const ToolTimeline: React.FC<ToolTimelineProps> = ({
  invocations,
  onSelectInvocation,
  selectedId,
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const getStatusIcon = (status: ToolInvocation["status"]) => {
    switch (status) {
      case "pending":
        return <span className="status-icon pending">⏳</span>;
      case "success":
        return <span className="status-icon success">✓</span>;
      case "error":
        return <span className="status-icon error">✕</span>;
    }
  };

  const getStatusClass = (status: ToolInvocation["status"]) => {
    return `timeline-item ${status} ${selectedId === invocations.find(inv => inv.id === selectedId)?.id ? "selected" : ""}`;
  };

  if (invocations.length === 0) {
    return (
      <div className="timeline-empty">
        <p className="empty-message">No tool invocations yet</p>
        <p className="empty-hint">Submit a query to get started</p>
      </div>
    );
  }

  return (
    <div className="tool-timeline">
      {invocations.map((invocation) => (
        <div
          key={invocation.id}
          className={getStatusClass(invocation.status)}
          onClick={() => onSelectInvocation(invocation)}
        >
          <div className="timeline-header">
            <div className="timeline-title">
              {getStatusIcon(invocation.status)}
              <span className="tool-name">{invocation.tool}</span>
            </div>
            <button
              className="expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(invocation.id);
              }}
              aria-label={
                expandedIds.has(invocation.id) ? "Collapse" : "Expand"
              }
            >
              {expandedIds.has(invocation.id) ? "▼" : "▶"}
            </button>
          </div>

          {expandedIds.has(invocation.id) && (
            <div className="timeline-details fade-in">
              <div className="detail-section">
                <span className="detail-label">Input:</span>
                <pre className="detail-value monospace">
                  {JSON.stringify(invocation.input, null, 2)}
                </pre>
              </div>

              {invocation.duration_ms !== undefined && (
                <div className="detail-meta">
                  <span className="meta-item">
                    Duration: {invocation.duration_ms}ms
                  </span>
                </div>
              )}

              {invocation.error && (
                <div className="detail-section error-section">
                  <span className="detail-label text-error">Error:</span>
                  <p className="error-message">{invocation.error}</p>
                </div>
              )}
            </div>
          )}

          <div className="timeline-timestamp">
            {new Date(invocation.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

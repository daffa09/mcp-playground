import React from "react";
import "./Header.css";

interface HeaderProps {
  toolsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ toolsCount }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <h1>
            <span className="title-icon">🔧</span>
            MCP Developer Workspace
          </h1>
          <p className="header-subtitle">
            AI-powered project context through standardized tools
          </p>
        </div>

        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{toolsCount}</span>
            <span className="stat-label">Tools Available</span>
          </div>
        </div>
      </div>
    </header>
  );
};

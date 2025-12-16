import React, { useState } from "react";
import "./PromptInput.css";

interface PromptInputProps {
  onSubmit: (query: string) => void;
  isProcessing: boolean;
}

const EXAMPLE_PROMPTS = [
  "Show all TypeScript files",
  "Read utils.txt",
  "Search for 'function'",
  "Show directory tree",
  "Show workspace stats",
];

export const PromptInput: React.FC<PromptInputProps> = ({
  onSubmit,
  isProcessing,
}) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isProcessing) {
      onSubmit(query.trim());
      setQuery("");
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="prompt-input-container">
      <form onSubmit={handleSubmit} className="prompt-form">
        <div className="input-wrapper">
          <textarea
            className="prompt-textarea"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)]
            }
            rows={3}
            disabled={isProcessing}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>

        <div className="prompt-actions">
          <div className="examples">
            <span className="examples-label">Try:</span>
            {EXAMPLE_PROMPTS.slice(0, 3).map((example, i) => (
              <button
                key={i}
                type="button"
                className="example-btn"
                onClick={() => handleExampleClick(example)}
                disabled={isProcessing}
              >
                {example}
              </button>
            ))}
          </div>

          <div className="action-buttons">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setQuery("")}
              disabled={isProcessing || !query}
            >
              Clear
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isProcessing || !query.trim()}
            >
              {isProcessing ? "Processing..." : "Submit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

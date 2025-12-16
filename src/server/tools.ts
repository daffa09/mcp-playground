import fs from "fs/promises";
import path from "path";
import {
  validatePath,
  enforceDepthLimit,
  enforceResultLimit,
} from "./utils/validation.js";

const BASE_DIR = path.resolve("./workspace");
const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_SEARCH_RESULTS = 100;
const MAX_TREE_DEPTH = 5;

/**
 * File metadata interface
 */
interface FileMetadata {
  size: number;
  created: string;
  modified: string;
  extension: string;
  lines?: number;
}

/**
 * Search result interface
 */
interface SearchResult {
  file: string;
  line: number;
  content: string;
  context: string[];
}

/**
 * Workspace statistics interface
 */
interface WorkspaceStats {
  total_files: number;
  total_size: number;
  file_types: Record<string, number>;
  largest_files: Array<{ path: string; size: number }>;
}

export const tools = {
  /**
   * Read a file from the workspace
   */
  read_file: {
    description: "Read a file from the workspace",
    inputSchema: {
      path: "string",
    },

    async handler(input: { path: string }) {
      const targetPath = validatePath(BASE_DIR, input.path);

      // Check file size
      const stats = await fs.stat(targetPath);
      if (stats.size > MAX_FILE_SIZE) {
        throw new Error(
          `File too large: ${stats.size} bytes (max ${MAX_FILE_SIZE})`
        );
      }

      return await fs.readFile(targetPath, "utf-8");
    },
  },

  /**
   * List files in a directory with optional glob pattern
   */
  list_files: {
    description:
      "List all files in the workspace directory or subdirectory with optional glob pattern",
    inputSchema: {
      directory: "string", // optional, defaults to '.'
      pattern: "string", // optional glob pattern like '*.ts'
      recursive: "boolean", // optional, defaults to true
    },

    async handler(input: {
      directory?: string;
      pattern?: string;
      recursive?: boolean;
    }) {
      const dir = input.directory || ".";
      const targetPath = validatePath(BASE_DIR, dir);
      const recursive = input.recursive !== false; // default true
      const pattern = input.pattern;

      const results: Array<{
        path: string;
        size: number;
        modified: string;
      }> = [];

      async function scan(currentPath: string, relativePath: string) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          const relPath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            if (recursive) {
              await scan(fullPath, relPath);
            }
          } else if (entry.isFile()) {
            // Apply pattern filter if specified
            if (pattern) {
              const regex = new RegExp(
                pattern.replace(/\*/g, ".*").replace(/\?/g, ".")
              );
              if (!regex.test(entry.name)) {
                continue;
              }
            }

            const stats = await fs.stat(fullPath);
            results.push({
              path: relPath,
              size: stats.size,
              modified: stats.mtime.toISOString(),
            });
          }
        }
      }

      await scan(targetPath, dir === "." ? "" : dir);

      return enforceResultLimit(results, MAX_SEARCH_RESULTS);
    },
  },

  /**
   * Search for text content within files
   */
  search_files: {
    description: "Search for text content within workspace files",
    inputSchema: {
      query: "string",
      file_pattern: "string", // optional, e.g., '*.ts'
      case_sensitive: "boolean", // optional, default false
    },

    async handler(input: {
      query: string;
      file_pattern?: string;
      case_sensitive?: boolean;
    }) {
      const query = input.query;
      const caseSensitive = input.case_sensitive || false;
      const searchRegex = new RegExp(
        query,
        caseSensitive ? "g" : "gi"
      );

      const results: SearchResult[] = [];

      async function searchInFile(filePath: string, relativePath: string) {
        try {
          const stats = await fs.stat(filePath);
          if (stats.size > MAX_FILE_SIZE) {
            return; // Skip large files
          }

          const content = await fs.readFile(filePath, "utf-8");
          const lines = content.split("\n");

          lines.forEach((line, index) => {
            if (searchRegex.test(line)) {
              const contextStart = Math.max(0, index - 1);
              const contextEnd = Math.min(lines.length, index + 2);
              const context = lines.slice(contextStart, contextEnd);

              results.push({
                file: relativePath,
                line: index + 1,
                content: line.trim(),
                context,
              });
            }
          });
        } catch (err) {
          // Skip files that can't be read as text
        }
      }

      async function scan(currentPath: string, relativePath: string) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          const relPath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            await scan(fullPath, relPath);
          } else if (entry.isFile()) {
            // Apply pattern filter if specified
            if (input.file_pattern) {
              const regex = new RegExp(
                input.file_pattern.replace(/\*/g, ".*").replace(/\?/g, ".")
              );
              if (!regex.test(entry.name)) {
                continue;
              }
            }

            await searchInFile(fullPath, relPath);
          }
        }
      }

      await scan(BASE_DIR, "");

      return {
        query,
        total_matches: results.length,
        results: enforceResultLimit(results, MAX_SEARCH_RESULTS),
      };
    },
  },

  /**
   * Get detailed metadata about a specific file
   */
  file_metadata: {
    description: "Get detailed metadata about a specific file",
    inputSchema: {
      path: "string",
    },

    async handler(input: { path: string }): Promise<FileMetadata> {
      const targetPath = validatePath(BASE_DIR, input.path);
      const stats = await fs.stat(targetPath);

      const metadata: FileMetadata = {
        size: stats.size,
        created: stats.birthtime.toISOString(),
        modified: stats.mtime.toISOString(),
        extension: path.extname(input.path),
      };

      // Count lines if it's a text file and not too large
      if (stats.size <= MAX_FILE_SIZE) {
        try {
          const content = await fs.readFile(targetPath, "utf-8");
          metadata.lines = content.split("\n").length;
        } catch {
          // Not a text file, skip line count
        }
      }

      return metadata;
    },
  },

  /**
   * Generate a visual tree structure of directories
   */
  directory_tree: {
    description: "Generate a visual tree structure of the workspace",
    inputSchema: {
      depth: "number", // optional, default 3, max 5
    },

    async handler(input: { depth?: number }): Promise<string> {
      const maxDepth = Math.min(input.depth || 3, MAX_TREE_DEPTH);
      enforceDepthLimit(maxDepth, MAX_TREE_DEPTH);

      const lines: string[] = [];

      async function buildTree(
        currentPath: string,
        prefix: string,
        currentDepth: number
      ) {
        if (currentDepth > maxDepth) {
          return;
        }

        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        const sortedEntries = entries.sort((a, b) => {
          // Directories first, then alphabetically
          if (a.isDirectory() && !b.isDirectory()) return -1;
          if (!a.isDirectory() && b.isDirectory()) return 1;
          return a.name.localeCompare(b.name);
        });

        for (let i = 0; i < sortedEntries.length; i++) {
          const entry = sortedEntries[i];
          const isLast = i === sortedEntries.length - 1;
          const connector = isLast ? "└── " : "├── ";
          const icon = entry.isDirectory() ? "📁 " : "📄 ";

          lines.push(prefix + connector + icon + entry.name);

          if (entry.isDirectory() && currentDepth < maxDepth) {
            const newPrefix = prefix + (isLast ? "    " : "│   ");
            const fullPath = path.join(currentPath, entry.name);
            await buildTree(fullPath, newPrefix, currentDepth + 1);
          }
        }
      }

      lines.push("📁 workspace/");
      await buildTree(BASE_DIR, "", 1);

      return lines.join("\n");
    },
  },

  /**
   * Get high-level project statistics
   */
  workspace_stats: {
    description: "Get high-level statistics about the workspace",
    inputSchema: {},

    async handler(): Promise<WorkspaceStats> {
      const stats: WorkspaceStats = {
        total_files: 0,
        total_size: 0,
        file_types: {},
        largest_files: [],
      };

      const allFiles: Array<{ path: string; size: number }> = [];

      async function scan(currentPath: string, relativePath: string) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);
          const relPath = path.join(relativePath, entry.name);

          if (entry.isDirectory()) {
            await scan(fullPath, relPath);
          } else if (entry.isFile()) {
            const fileStat = await fs.stat(fullPath);
            const ext = path.extname(entry.name) || "no extension";

            stats.total_files++;
            stats.total_size += fileStat.size;
            stats.file_types[ext] = (stats.file_types[ext] || 0) + 1;

            allFiles.push({ path: relPath, size: fileStat.size });
          }
        }
      }

      await scan(BASE_DIR, "");

      // Get top 5 largest files
      allFiles.sort((a, b) => b.size - a.size);
      stats.largest_files = allFiles.slice(0, 5);

      return stats;
    },
  },
};

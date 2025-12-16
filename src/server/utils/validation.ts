import path from "path";

/**
 * Validates that a given path is within the workspace boundary
 * Prevents path traversal attacks
 */
export function validatePath(basePath: string, userPath: string): string {
  const resolvedPath = path.resolve(basePath, userPath);

  if (!resolvedPath.startsWith(basePath)) {
    throw new Error("Access denied: Path outside workspace");
  }

  return resolvedPath;
}

/**
 * Validates input against a simple schema
 */
export function validateInput(
  input: Record<string, any>,
  schema: Record<string, string>
): void {
  for (const [key, expectedType] of Object.entries(schema)) {
    const value = input[key];

    if (value === undefined) {
      throw new Error(`Missing required parameter: ${key}`);
    }

    const actualType = typeof value;
    if (actualType !== expectedType) {
      throw new Error(
        `Invalid type for ${key}: expected ${expectedType}, got ${actualType}`
      );
    }
  }
}

/**
 * Limits the depth of recursive operations
 */
export function enforceDepthLimit(depth: number, max: number): number {
  if (depth > max) {
    throw new Error(`Depth limit exceeded: maximum ${max} levels allowed`);
  }
  return depth;
}

/**
 * Limits the size of result arrays to prevent DoS
 */
export function enforceResultLimit<T>(results: T[], limit: number): T[] {
  if (results.length > limit) {
    return results.slice(0, limit);
  }
  return results;
}

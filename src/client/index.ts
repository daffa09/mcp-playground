import { MCPTool, MCPInvokeResponse } from "../types/mcp.js";
import { classifyIntent, selectTool } from "./reasoning.js";

const SERVER_URL = "http://localhost:3001";

/**
 * Fetch available tools from MCP server
 */
async function getTools(): Promise<MCPTool[]> {
  const res = await fetch(`${SERVER_URL}/tools`);
  return res.json();
}

/**
 * Invoke a tool on the MCP server
 */
async function invokeTool(
  tool: string,
  input: Record<string, any>
): Promise<MCPInvokeResponse> {
  const res = await fetch(`${SERVER_URL}/invoke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool, input }),
  });
  return res.json();
}

/**
 * Process a user request and execute the appropriate tool
 */
export async function processUserRequest(userQuery: string) {
  console.log(`\n📝 User request: "${userQuery}"`);

  // Step 1: Discover available tools
  console.log("\n🔍 Discovering available tools...");
  const tools = await getTools();
  console.log(`Found ${tools.length} tools:`, tools.map((t) => t.name).join(", "));

  // Step 2: Classify user intent
  console.log("\n🧠 Analyzing intent...");
  const intent = classifyIntent(userQuery);
  console.log(`Intent: ${intent.action}`);
  console.log(`Parameters:`, intent.parameters);

  // Step 3: Select appropriate tool
  const toolSelection = selectTool(intent, tools);
  if (!toolSelection) {
    console.log("❌ No suitable tool found for this request");
    return;
  }

  console.log(`\n🔧 Selected tool: ${toolSelection.tool}`);

  // Step 4: Invoke the tool
  console.log(`\n⚙️  Invoking tool...`);
  const response = await invokeTool(toolSelection.tool, toolSelection.input);

  // Step 5: Display results
  if (response.error) {
    console.log(`\n❌ Error: ${response.error}`);
    return;
  }

  console.log(`\n✅ Success!`);
  if (response.metadata) {
    console.log(`Duration: ${response.metadata.duration_ms}ms`);
  }

  console.log("\n📄 Result:");
  console.log(JSON.stringify(response.result, null, 2));

  return response;
}

/**
 * Main execution for CLI mode
 */
async function main() {
  const args = process.argv.slice(2);
  const query = args.join(" ");

  if (!query) {
    console.log("Usage: npm run client -- <your query>");
    console.log('Example: npm run client -- "Show all TypeScript files"');
    return;
  }

  await processUserRequest(query);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

#!/usr/bin/env node
/**
 * MCP Server for Claude Desktop
 *
 * Model Context Protocol adapter that exposes car tools to Claude Desktop.
 * Uses stdio transport for communication.
 *
 * Usage in claude_desktop_config.json:
 * {
 *   "mcpServers": {
 *     "car-tools": {
 *       "command": "node",
 *       "args": ["/path/to/car-tools-api-mcp/mcp/index.js"]
 *     }
 *   }
 * }
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const { TOOLS, executeTool } = require('../src/tools');

// Create MCP server
const server = new Server(
  {
    name: 'car-tools',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle list_tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Convert OpenAI format to MCP format
  const mcpTools = TOOLS.map((tool) => ({
    name: tool.function.name,
    description: tool.function.description,
    inputSchema: tool.function.parameters,
  }));

  return { tools: mcpTools };
});

// Handle call_tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await executeTool(name, args || {});

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (err) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: err.message }),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[MCP] Car Tools server running on stdio');
}

main().catch((err) => {
  console.error('[MCP] Fatal error:', err);
  process.exit(1);
});

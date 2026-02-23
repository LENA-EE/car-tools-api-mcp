/**
 * Tools API Routes
 */

const express = require('express');
const { TOOLS, executeTool } = require('../tools');

const router = express.Router();

/**
 * GET /tools
 * Returns list of available tools in OpenAI function calling format
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    tools: TOOLS,
  });
});

/**
 * POST /tools/execute
 * Execute a tool
 * Body: { tool: string, args: object }
 */
router.post('/execute', async (req, res) => {
  const { tool, args } = req.body;

  if (!tool) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: tool',
    });
  }

  // Validate tool exists
  const toolExists = TOOLS.some((t) => t.function.name === tool);
  if (!toolExists) {
    return res.status(400).json({
      success: false,
      error: `Unknown tool: ${tool}`,
      availableTools: TOOLS.map((t) => t.function.name),
    });
  }

  try {
    const result = await executeTool(tool, args || {});
    res.json(result);
  } catch (err) {
    console.error(`[API] Error executing ${tool}:`, err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;

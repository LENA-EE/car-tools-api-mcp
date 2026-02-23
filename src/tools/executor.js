/**
 * Tool Executor
 * Executes tool calls by name and arguments
 */

const { searchCars } = require('./search.tool');
const { semanticSearch } = require('./semantic.tool');
const { decodeVin, checkVin } = require('./vin.tool');

/**
 * Execute a tool by name
 * @param {string} name - Tool name
 * @param {Object} args - Tool arguments
 * @returns {Promise<Object>}
 */
async function executeTool(name, args = {}) {
  console.log(`[Executor] Running tool: ${name}`, JSON.stringify(args));

  try {
    switch (name) {
      case 'search_cars':
        return await searchCars(args);

      case 'semantic_search':
        return await semanticSearch(args);

      case 'decode_vin':
        return await decodeVin(args);

      case 'check_vin':
        return await checkVin(args);

      case 'get_model_info':
        // This is a "hint" tool - AI should use its own knowledge
        return {
          success: true,
          type: 'hint',
          brand: args.brand,
          model: args.model,
          message: 'Use your knowledge to provide information about this model',
          hint: `Provide information about ${args.brand} ${args.model}: common issues, maintenance costs, reliability, fuel economy, etc.`,
        };

      case 'compare_models':
        // This is a "hint" tool - AI should use its own knowledge
        return {
          success: true,
          type: 'hint',
          model1: args.model1,
          model2: args.model2,
          message: 'Use your knowledge to compare these models',
          hint: `Compare ${args.model1?.brand} ${args.model1?.model} vs ${args.model2?.brand} ${args.model2?.model}: price, reliability, features, maintenance costs, etc.`,
        };

      default:
        return {
          success: false,
          error: `Unknown tool: ${name}`,
        };
    }
  } catch (err) {
    console.error(`[Executor] Error in ${name}:`, err);
    return {
      success: false,
      error: err.message,
    };
  }
}

module.exports = { executeTool };

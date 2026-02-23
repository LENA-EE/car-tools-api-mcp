/**
 * Semantic Search Tool
 * Vector similarity search using pgvector + OpenAI embeddings
 */

const { pool } = require('../config/database');
const OpenAI = require('openai');

const EMBEDDING_MODEL = 'openai/text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

let openrouterClient = null;

function getOpenRouterClient() {
  if (!openrouterClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }
    openrouterClient = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
    });
  }
  return openrouterClient;
}

/**
 * Generate embedding for text
 */
async function generateEmbedding(text) {
  const client = getOpenRouterClient();
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.trim(),
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return response.data[0].embedding;
}

/**
 * Semantic search by natural language query
 * @param {Object} args - { query, limit }
 * @returns {Promise<Object>}
 */
async function semanticSearch(args) {
  const { query, limit = 5 } = args;
  const threshold = 0.2;

  if (!process.env.OPENROUTER_API_KEY) {
    return {
      success: false,
      error: 'Semantic search not available (OPENROUTER_API_KEY not set)',
      cars: [],
    };
  }

  try {
    // Generate embedding for query
    const embedding = await generateEmbedding(query);
    const vectorStr = `[${embedding.join(',')}]`;

    // Search by similarity
    const result = await pool.query(
      `
      SELECT
        id, mark_name, folder_name, body_type, engine_volume, hp,
        transmission, drive_type, engine_type, year, price,
        1 - (embedding <=> $1::vector) as similarity
      FROM cars_catalog
      WHERE embedding IS NOT NULL
        AND (embedding <=> $1::vector) < $2
      ORDER BY embedding <=> $1::vector
      LIMIT $3
    `,
      [vectorStr, 1 - threshold, limit]
    );

    return {
      success: true,
      total: result.rows.length,
      cars: result.rows.map((car) => ({
        ...car,
        name: `${car.mark_name} ${car.folder_name}`,
        engine: `${car.engine_volume}L ${car.engine_type === 'diesel' ? 'Diesel' : 'Petrol'}, ${car.hp} hp`,
        similarity: parseFloat(car.similarity).toFixed(3),
      })),
    };
  } catch (err) {
    console.error('[SemanticSearch] Error:', err.message);
    return {
      success: false,
      error: err.message,
      cars: [],
    };
  }
}

module.exports = { semanticSearch };

/**
 * Database Configuration
 * Connects to Neon PostgreSQL (same as ai-car-finder-mvp)
 */

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection on startup
pool.query('SELECT 1').catch((err) => {
  console.error('[Database] Connection failed:', err.message);
});

module.exports = { pool };

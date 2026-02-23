/**
 * Car Tools API
 * Universal tools service for AI agents
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const toolsRoutes = require('./routes/tools.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute per IP
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use(limiter);

// Optional API Key authentication
app.use((req, res, next) => {
  const apiKey = process.env.API_KEY;

  // Skip auth if no API_KEY is set
  if (!apiKey) {
    return next();
  }

  // Skip auth for health endpoint
  if (req.path === '/health') {
    return next();
  }

  const providedKey = req.headers['x-api-key'];
  if (providedKey !== apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing API key',
    });
  }

  next();
});

// Routes
app.use('/tools', toolsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'car-tools-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Car Tools API',
    version: '1.0.0',
    description: 'Universal car tools for AI agents',
    endpoints: {
      health: 'GET /health',
      tools: 'GET /tools',
      execute: 'POST /tools/execute',
    },
    documentation: 'https://github.com/LENA-EE/car-tools-api-mcp',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Car Tools API running on port ${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Tools: http://localhost:${PORT}/tools`);
});

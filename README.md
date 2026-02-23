# Car Tools API + MCP

Universal car tools for AI agents. Provides HTTP API and MCP (Model Context Protocol) adapter for car search and VIN verification.

## Features

- **search_cars** - Search cars by parameters (brand, model, price, year, etc.)
- **semantic_search** - Natural language search ("reliable family car")
- **decode_vin** - Decode VIN to get car info (brand, model, year, country)
- **check_vin** - Full VIN check (decode + pledges + history)
- **get_model_info** - Get information about car model (AI uses its knowledge)
- **compare_models** - Compare two car models

## Quick Start

### HTTP API

```bash
# Install dependencies
npm install

# Copy env example and configure
cp .env.example .env

# Start server
npm start
```

Server runs on `http://localhost:3001`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/tools` | List available tools (OpenAI format) |
| POST | `/tools/execute` | Execute a tool |

### Example: Search Cars

```bash
curl -X POST http://localhost:3001/tools/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "search_cars",
    "args": {
      "mark_name": "BMW",
      "price_max": 3000000,
      "engine_type": "diesel"
    }
  }'
```

### Example: Check VIN

```bash
curl -X POST http://localhost:3001/tools/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "check_vin",
    "args": {
      "vin": "WBAPH5C55BA123456"
    }
  }'
```

## MCP for Claude Desktop

This service includes an MCP adapter for Claude Desktop integration.

### Setup

1. Find your Claude Desktop config file:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the server configuration:

```json
{
  "mcpServers": {
    "car-tools": {
      "command": "node",
      "args": ["C:/path/to/car-tools-api-mcp/mcp/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://...",
        "FNP_MOCK": "true"
      }
    }
  }
}
```

3. Restart Claude Desktop

Now Claude can use car tools directly in conversations!

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `OPENROUTER_API_KEY` | No | For semantic search (embeddings) |
| `FNP_MOCK` | No | Set to "true" to mock FNP responses |
| `API_KEY` | No | Optional API key for authentication |
| `PORT` | No | Server port (default: 3001) |

## Integration Examples

### With OpenAI/DeepSeek

```javascript
// Get tools for LLM
const { tools } = await fetch('http://localhost:3001/tools').then(r => r.json());

// Call LLM with tools
const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'Find a BMW X5 under 3 million rubles' }],
  tools: tools,
});

// If LLM wants to call a tool
if (response.choices[0].message.tool_calls) {
  const toolCall = response.choices[0].message.tool_calls[0];
  const result = await fetch('http://localhost:3001/tools/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool: toolCall.function.name,
      args: JSON.parse(toolCall.function.arguments)
    })
  }).then(r => r.json());
}
```

### With Telegram Bot

```javascript
// In your bot handler
bot.on('message', async (ctx) => {
  const response = await callLLMWithTools(ctx.message.text);

  // If search_cars was called
  if (response.cars) {
    for (const car of response.cars) {
      await ctx.reply(`${car.name} - ${car.price} руб.`);
    }
  }
});
```

## Deploy to Render

1. Push to GitHub
2. Connect repo in Render dashboard
3. Set environment variables
4. Deploy!

See `render.yaml` for configuration.

## License

MIT

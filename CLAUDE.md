# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Railway deployment template for MoltBot, a personal AI assistant framework that connects to messaging platforms (Telegram, Discord, Slack, WhatsApp, and more) with AI provider support (Anthropic, OpenAI, Groq). The template includes a custom wrapper server that adds web-based setup, health checks, and secure gateway management.

## Key Template Files

- **`.env.example`** - Template for environment variables (copy to `.env` for local use)
- **`Dockerfile`** - Multi-stage build with tini, non-root user, and health checks
- **`entrypoint.sh`** - Railway PORT handling and startup script
- **`railway.json`** - Railway platform configuration with health checks
- **`src/`** - Wrapper server source code

## Essential Commands

### Development & Testing
```bash
make build              # Build Docker image
make run                # Start MoltBot locally with auto-generated password
make test               # Test the Docker build and endpoints
make logs               # View container logs
make shell              # Access running container shell
```

### Deployment
```bash
make deploy-local       # Deploy using docker-compose
make stop               # Stop running container
make clean              # Remove containers, images, and volumes
```

### Utilities
```bash
make generate-password  # Generate a secure setup password
```

## Architecture & Structure

```
moltbot-railway/
├── .env.example           # Environment variable template
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Local development orchestration
├── entrypoint.sh          # Railway PORT handling
├── Makefile               # Development commands
├── railway.json           # Railway platform config
├── package.json           # Wrapper server dependencies
└── src/
    ├── server.js          # Express wrapper server (main entry point)
    ├── health.js          # Health check endpoints (/health/*)
    ├── gateway.js         # MoltBot gateway process manager
    ├── proxy.js           # Reverse proxy to gateway
    └── auth.js            # Setup password authentication middleware
```

### Key Design Decisions

1. **Wrapper Server Architecture**: Express 5 server that:
   - Exposes health endpoints without authentication
   - Protects `/setup` with `SETUP_PASSWORD`
   - Spawns and monitors MoltBot gateway process
   - Reverse proxies all other traffic to gateway (port 18789)
   - Handles WebSocket upgrades for real-time features

2. **Security**:
   - Non-root user (`moltbot:moltbot` with UID/GID 1001)
   - Tini as PID 1 for proper signal handling
   - Auto-generated gateway tokens stored securely
   - Password-protected setup wizard

3. **Health Checks**:
   - `/health` - Basic liveness (always 200)
   - `/health/live` - Process liveness with uptime
   - `/health/ready` - Gateway readiness (503 if not running)

4. **Data Persistence**:
   - Single volume at `/data` for Railway's one-volume-per-service limit
   - State: `/data/.moltbot/` (config, sessions, tokens)
   - Workspace: `/data/workspace/` (file storage)

5. **Gateway Management**:
   - Runs `moltbot onboard --non-interactive` on first setup
   - Spawns `moltbot gateway --port 18789 --verbose`
   - Auto-restarts on crash (with 5-second delay)
   - Graceful shutdown on SIGTERM/SIGINT

### Environment Variables

**Required:**
- `SETUP_PASSWORD` - Protects `/setup` endpoint (no default for security)

**With Defaults:**
- `MOLTBOT_STATE_DIR=/data/.moltbot` - Configuration storage
- `MOLTBOT_WORKSPACE_DIR=/data/workspace` - File storage
- `INTERNAL_GATEWAY_PORT=18789` - Gateway internal port
- `PORT=8080` - External port (Railway overrides this)

**Optional:**
- `MOLTBOT_GATEWAY_TOKEN` - If not set, auto-generated and stored

### Request Flow

1. Request arrives at wrapper server on `$PORT`
2. `/health/*` routes - served directly (no auth)
3. `/setup/*` routes - require password authentication
4. All other routes - proxied to gateway at `127.0.0.1:$INTERNAL_GATEWAY_PORT`
5. WebSocket upgrades - proxied for real-time features

## Common Tasks

### Modifying Health Check Behavior

Edit `src/health.js`:
- `setGatewayReady(boolean)` - Called by gateway manager
- Add custom health checks by extending the router

### Changing Authentication Method

Edit `src/auth.js`:
- Currently supports: Bearer token, query param, cookie, POST body
- Add custom auth by extending `createAuthMiddleware`

### Adding Gateway Management Features

Edit `src/gateway.js`:
- `startGateway()` - Spawns MoltBot gateway
- `stopGateway()` - Graceful shutdown
- `getGatewayInfo()` - Process status

### Customizing Proxy Behavior

Edit `src/proxy.js`:
- Uses `http-proxy` for HTTP and WebSocket proxying
- Add request/response transformations in `proxyReq`/`proxyRes` events

## Testing Approach

The `make test` command verifies:
1. Docker image builds successfully
2. Container starts and runs
3. Health endpoints respond correctly
4. Auth protection works (401 without password, 200 with)

For manual testing:
```bash
# Health check
curl http://localhost:8080/health

# Auth protection (should return 401)
curl http://localhost:8080/setup

# Auth with password (should return 200)
curl "http://localhost:8080/setup?password=YOUR_PASSWORD"
```

## Railway-Specific Configuration

### Volume Setup (Required)
Mount path: `/data`
- Contains all MoltBot configuration and state
- Without volume, data is lost on redeploy

### Health Check
- Endpoint: `/health/ready`
- Returns 503 until gateway is started via `/setup`

### Private Networking
- Internal: `http://SERVICE.railway.internal:PORT`
- Always include PORT (no default to 80)
- Use reference variables: `${{MoltBot.PORT}}`

## Notes for Future Development

1. **MoltBot Updates**: The Dockerfile installs `moltbot@latest`. Railway auto-rebuilds on code changes.

2. **Multi-platform Support**: MoltBot supports Telegram, Discord, Slack, WhatsApp, Signal, iMessage, Teams, Matrix, and more. Configuration is in `moltbot.json`.

3. **AI Providers**: Configure in `moltbot.json` under `agent.model`:
   - `anthropic/claude-sonnet-4`
   - `openai/gpt-4o`
   - `groq/llama-3.3-70b-versatile`

4. **Backup/Restore**: Use `/setup/export` to download tar.gz backup. Restore by extracting to `/data/.moltbot/`.

5. **Scaling**: MoltBot is designed as a personal assistant (single-user). For multi-tenant, consider running multiple instances.

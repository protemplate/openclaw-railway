# MoltBot Railway Template

Deploy [MoltBot](https://github.com/moltbot/moltbot), a personal AI assistant for messaging platforms, to [Railway](https://railway.app) with one click.

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/new?template=https://github.com/protemplate/moltbot-railway)

## Features

- One-click deployment to Railway
- Web-based setup wizard (password protected)
- Supports all MoltBot messaging platforms (Telegram, Discord, Slack, WhatsApp, and more)
- Multiple AI provider support (Anthropic, OpenAI, Groq)
- Persistent data storage with Railway volumes
- Comprehensive health checks for monitoring
- Secure by default with non-root container
- Graceful shutdown with proper signal handling
- Backup export functionality
- Easy local development with Docker

## Quick Start

### Deploy to Railway

1. Click the "Deploy on Railway" button above
2. Set your `SETUP_PASSWORD` environment variable
3. Add a volume mounted at `/data` for persistent storage
4. Deploy and wait for the service to start
5. Visit `https://your-app.railway.app/setup` and enter your password
6. Start the gateway and configure your messaging platform

### Local Development

```bash
# Clone the repository
git clone https://github.com/protemplate/moltbot-railway
cd moltbot-railway

# Quick start with auto-generated password
make run

# Or use docker-compose
make deploy-local

# Access MoltBot at http://localhost:8080/setup
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SETUP_PASSWORD` | Password to protect the setup wizard | - | Yes |
| `MOLTBOT_STATE_DIR` | Directory for MoltBot configuration and state | `/data/.moltbot` | No |
| `MOLTBOT_WORKSPACE_DIR` | Directory for file storage | `/data/workspace` | No |
| `MOLTBOT_GATEWAY_TOKEN` | Gateway authentication token (auto-generated if not set) | Auto-generated | No |
| `INTERNAL_GATEWAY_PORT` | Internal port for MoltBot gateway | `18789` | No |

### Railway Volume Configuration

**Important:** You must configure a volume in Railway for data persistence.

1. Go to your MoltBot service in Railway
2. Navigate to the **Volumes** tab
3. Click **Add Volume**
4. Set the mount path to `/data`
5. Redeploy the service

Without a volume, all configuration and data will be lost on redeploy.

## Usage

### Available Commands

```bash
# Build and run
make build              # Build Docker image
make run                # Run MoltBot locally
make stop               # Stop running container

# Testing
make test               # Test the build and endpoints

# Deployment
make deploy-local       # Deploy with docker-compose

# Utilities
make logs               # View container logs
make shell              # Access container shell
make clean              # Clean up everything
make generate-password  # Generate secure setup password
```

### Health Endpoints

| Endpoint | Description | Auth Required |
|----------|-------------|---------------|
| `/health` | Basic liveness check | No |
| `/health/live` | Kubernetes-style liveness probe | No |
| `/health/ready` | Readiness check (is gateway running?) | No |

### Setup Wizard

Access the setup wizard at `/setup` with your `SETUP_PASSWORD`:

```bash
# Via query parameter
https://your-app.railway.app/setup?password=YOUR_PASSWORD

# Or enter password on the login page
https://your-app.railway.app/setup
```

The setup wizard allows you to:
- Start/stop the MoltBot gateway
- View gateway status and token
- Export configuration backups

### Configuring Messaging Platforms

After starting the gateway, configure your messaging platform by editing the MoltBot configuration file:

```bash
# Access container shell
make shell

# Edit configuration
nano /data/.moltbot/moltbot.json
```

Example Telegram configuration:

```json
{
  "agent": {
    "model": "anthropic/claude-sonnet-4"
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "token": "YOUR_TELEGRAM_BOT_TOKEN"
    }
  }
}
```

See the [MoltBot documentation](https://github.com/moltbot/moltbot) for detailed platform configuration.

## Security

### Setup Password

The setup password protects your MoltBot configuration from unauthorized access.

**Generate a secure password:**
```bash
make generate-password
# or
openssl rand -base64 32
```

### Best Practices

1. **Always use a strong setup password** - The setup wizard can start/stop the gateway and export backups
2. **Store sensitive tokens securely** - Use Railway's secret environment variables for API keys
3. **Keep backups** - Use the `/setup/export` endpoint to download configuration backups
4. **Monitor health endpoints** - Set up Railway notifications for health check failures
5. **Use HTTPS** - Railway provides automatic SSL for all deployments

### Container Security

This template follows security best practices:
- Runs as non-root user (`moltbot:moltbot`)
- Uses tini as init system for proper signal handling
- Minimal runtime dependencies
- No unnecessary packages installed

## Private Networking

Railway's private networking is automatically supported for service-to-service communication.

### Access Points

Your MoltBot instance is accessible at:
- **Public**: `https://your-app.railway.app`
- **Private**: `http://moltbot.railway.internal:PORT` (within your Railway project)

**Important:** Always include the PORT in private network URLs. Without it, connections default to port 80 and will fail.

### Fixed Port Configuration (Recommended)

To make inter-service communication predictable:

1. Go to your MoltBot service in Railway
2. Navigate to **Variables** tab
3. Add: `PORT=8080`
4. Redeploy the service

### Using Reference Variables

From other Railway services:
```bash
# Set in your client service's variables
MOLTBOT_URL=${{MoltBot.RAILWAY_PRIVATE_DOMAIN}}:${{MoltBot.PORT}}
```

## Architecture

### Project Structure

```
moltbot-railway/
├── .env.example           # Environment variable template
├── Dockerfile             # Multi-stage Docker build
├── docker-compose.yml     # Local development
├── entrypoint.sh          # Railway PORT handling
├── Makefile               # Development commands
├── railway.json           # Railway configuration
├── package.json           # Wrapper server dependencies
└── src/
    ├── server.js          # Express wrapper server
    ├── health.js          # Health check endpoints
    ├── gateway.js         # Gateway process manager
    ├── proxy.js           # Reverse proxy config
    └── auth.js            # Setup password middleware
```

### How It Works

1. **Wrapper Server**: An Express server handles incoming requests
2. **Health Checks**: `/health/*` endpoints are always available without authentication
3. **Setup Protection**: `/setup` requires password authentication
4. **Gateway Manager**: Spawns and monitors the MoltBot gateway process
5. **Reverse Proxy**: All other traffic is proxied to the internal gateway
6. **WebSocket Support**: Upgrades are handled for real-time communication

### Data Persistence

Single volume mount at `/data`:
```
/data/
├── .moltbot/              # MoltBot configuration and state
│   ├── moltbot.json       # Main configuration file
│   └── gateway.token      # Auto-generated gateway token
└── workspace/             # File storage for workspace features
```

## Troubleshooting

### Common Issues

**Gateway fails to start**
- Check Railway logs for error messages
- Ensure the `/data` volume is properly mounted
- Verify environment variables are set correctly

**Setup wizard returns 401**
- Check your `SETUP_PASSWORD` environment variable is set
- Try using the password as a query parameter: `?password=YOUR_PASSWORD`

**Connection refused errors**
- Ensure the gateway is running (check `/health/ready`)
- Verify Railway networking is configured correctly

**Data not persisting**
- Confirm volume is mounted at `/data`
- Check volume permissions in Railway dashboard

### Viewing Logs

```bash
# Local development
make logs

# Railway
railway logs
```

### Getting Help

- [MoltBot Documentation](https://github.com/moltbot/moltbot)
- [Railway Documentation](https://docs.railway.app)
- [Report Issues](https://github.com/protemplate/moltbot-railway/issues)

## Development

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Test your changes locally (`make test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Testing

```bash
# Run all tests
make test

# Test specific functionality
make build && docker run --rm -e SETUP_PASSWORD=test moltbot-railway curl http://localhost:8080/health
```

## License

This template is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- [MoltBot](https://github.com/moltbot/moltbot) for the amazing AI assistant framework
- [Railway](https://railway.app) for the deployment platform
- The open source community for continuous improvements

---

Made with care for the AI assistant community

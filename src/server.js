/**
 * MoltBot Railway Template - Wrapper Server
 *
 * Express server that:
 * 1. Exposes health check endpoints (no auth required)
 * 2. Protects /setup with SETUP_PASSWORD
 * 3. Spawns and monitors MoltBot gateway process
 * 4. Reverse proxies traffic to the gateway
 * 5. Handles WebSocket upgrades
 * 6. Provides /setup/export for backups
 */

import express from 'express';
import { createServer } from 'http';
import { existsSync } from 'fs';
import { join } from 'path';
import archiver from 'archiver';

import healthRouter, { setGatewayReady } from './health.js';
import { createAuthMiddleware } from './auth.js';
import { startGateway, stopGateway, isGatewayRunning, getGatewayInfo, getGatewayToken } from './gateway.js';
import { createProxy } from './proxy.js';

// Configuration
const PORT = process.env.PORT || 8080;
const SETUP_PASSWORD = process.env.SETUP_PASSWORD;
const MOLTBOT_STATE_DIR = process.env.MOLTBOT_STATE_DIR || '/data/.moltbot';

// Create Express app
const app = express();

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple cookie parser
app.use((req, res, next) => {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });
  }
  req.cookies = cookies;
  next();
});

// Health check endpoints - no authentication required
app.use('/health', healthRouter);

// Setup authentication middleware
const authMiddleware = createAuthMiddleware(SETUP_PASSWORD);

// Setup wizard routes
app.get('/setup', authMiddleware, (req, res) => {
  const configFile = join(MOLTBOT_STATE_DIR, 'moltbot.json');
  const isConfigured = existsSync(configFile);
  const gatewayInfo = getGatewayInfo();

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>MoltBot Setup</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: #f5f5f5;
        }
        h1 { color: #333; }
        .card {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
        }
        .status.running { background: #d4edda; color: #155724; }
        .status.stopped { background: #f8d7da; color: #721c24; }
        .status.configured { background: #cce5ff; color: #004085; }
        .status.not-configured { background: #fff3cd; color: #856404; }
        button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          margin-right: 10px;
          margin-bottom: 10px;
        }
        button:hover { opacity: 0.9; }
        button.secondary {
          background: #6c757d;
        }
        button.danger {
          background: #dc3545;
        }
        pre {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          overflow-x: auto;
        }
        .info { color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <h1>MoltBot Setup</h1>

      <div class="card">
        <h2>Status</h2>
        <p>
          Gateway: <span class="status ${gatewayInfo.running ? 'running' : 'stopped'}">
            ${gatewayInfo.running ? 'Running' : 'Stopped'}
          </span>
          ${gatewayInfo.pid ? `(PID: ${gatewayInfo.pid})` : ''}
        </p>
        <p>
          Configuration: <span class="status ${isConfigured ? 'configured' : 'not-configured'}">
            ${isConfigured ? 'Configured' : 'Not Configured'}
          </span>
        </p>
      </div>

      <div class="card">
        <h2>Actions</h2>
        <form method="POST" action="/setup/start" style="display: inline;">
          <input type="hidden" name="password" value="${req.query.password || ''}">
          <button type="submit" ${gatewayInfo.running ? 'disabled' : ''}>Start Gateway</button>
        </form>
        <form method="POST" action="/setup/stop" style="display: inline;">
          <input type="hidden" name="password" value="${req.query.password || ''}">
          <button type="submit" class="danger" ${!gatewayInfo.running ? 'disabled' : ''}>Stop Gateway</button>
        </form>
        <a href="/setup/export?password=${req.query.password || ''}">
          <button type="button" class="secondary">Export Backup</button>
        </a>
      </div>

      <div class="card">
        <h2>Gateway Token</h2>
        <p class="info">Use this token to authenticate with the MoltBot API:</p>
        <pre>${getGatewayToken()}</pre>
      </div>

      <div class="card">
        <h2>Configuration</h2>
        <p class="info">State Directory: <code>${MOLTBOT_STATE_DIR}</code></p>
        <p class="info">Gateway Port: <code>${gatewayInfo.port}</code></p>
        <p class="info">
          Edit <code>${join(MOLTBOT_STATE_DIR, 'moltbot.json')}</code> to configure messaging platforms.
        </p>
      </div>

      <div class="card">
        <h2>Next Steps</h2>
        <ol>
          <li>Start the gateway using the button above</li>
          <li>Configure your messaging platform (Telegram, Discord, etc.) in the moltbot.json file</li>
          <li>Access your bot through your configured messaging platform</li>
        </ol>
        <p class="info">
          See the <a href="https://github.com/moltbot/moltbot" target="_blank">MoltBot documentation</a> for detailed setup instructions.
        </p>
      </div>
    </body>
    </html>
  `);
});

// Start gateway
app.post('/setup/start', authMiddleware, async (req, res) => {
  try {
    await startGateway();
    res.redirect(`/setup?password=${req.query.password || req.body.password || ''}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop gateway
app.post('/setup/stop', authMiddleware, async (req, res) => {
  try {
    await stopGateway();
    res.redirect(`/setup?password=${req.query.password || req.body.password || ''}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export backup
app.get('/setup/export', authMiddleware, (req, res) => {
  const archive = archiver('tar', { gzip: true });

  res.attachment('moltbot-backup.tar.gz');
  archive.pipe(res);

  // Add state directory to archive
  if (existsSync(MOLTBOT_STATE_DIR)) {
    archive.directory(MOLTBOT_STATE_DIR, '.moltbot');
  }

  archive.finalize();
});

// Create reverse proxy
const { middleware: proxyMiddleware, upgradeHandler } = createProxy();

// Proxy all other requests to gateway (when running)
app.use('/{*path}', (req, res, next) => {
  if (!isGatewayRunning()) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'MoltBot gateway is not running. Visit /setup to start it.'
    });
  }
  proxyMiddleware(req, res);
});

// Create HTTP server
const server = createServer(app);

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  // Skip health check endpoints
  if (req.url.startsWith('/health')) {
    socket.destroy();
    return;
  }

  if (!isGatewayRunning()) {
    socket.destroy();
    return;
  }

  upgradeHandler(req, socket, head);
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);

  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed');
  });

  // Stop gateway
  await stopGateway();

  console.log('Shutdown complete');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MoltBot wrapper server listening on port ${PORT}`);
  console.log(`Setup wizard: http://localhost:${PORT}/setup`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  // Check if gateway should auto-start (if already configured)
  const configFile = join(MOLTBOT_STATE_DIR, 'moltbot.json');
  if (existsSync(configFile)) {
    console.log('Configuration found, auto-starting gateway...');
    startGateway().catch(err => {
      console.error('Failed to auto-start gateway:', err.message);
    });
  } else {
    console.log('No configuration found. Visit /setup to configure MoltBot.');
  }
});

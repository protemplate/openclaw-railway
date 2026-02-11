/**
 * OpenClaw Railway Template - Wrapper Server
 *
 * Express server that:
 * 1. Exposes health check endpoints (no auth required)
 * 2. Protects /setup with SETUP_PASSWORD
 * 3. Provides web terminal for `openclaw onboard` wizard
 * 4. Spawns and monitors OpenClaw gateway process
 * 5. Reverse proxies traffic to the gateway
 * 6. Handles WebSocket upgrades
 * 7. Provides /setup/export for backups
 */

import express from 'express';
import { createServer } from 'http';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import archiver from 'archiver';

import healthRouter, { setGatewayReady } from './health.js';
import { createAuthMiddleware } from './auth.js';
import { startGateway, stopGateway, isGatewayRunning, getGatewayInfo, getGatewayToken, runCmd, deleteConfig, getRecentLogs, getGatewayUptime } from './gateway.js';
import { createProxy } from './proxy.js';
import { createTerminalServer, closeAllSessions } from './terminal.js';
import { getSetupPageHTML } from './setup-page.js';
import { getUIPageHTML } from './ui-page.js';
import { getLoginPageHTML } from './login-page.js';

// Configuration
const PORT = process.env.PORT || 8080;
const SETUP_PASSWORD = process.env.SETUP_PASSWORD;
const OPENCLAW_STATE_DIR = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';

// Auth provider groups for the simple mode form
const AUTH_GROUPS = [
  {
    provider: 'Anthropic',
    options: [
      { label: 'API Key', value: 'anthropic-api-key', flag: '--anthropic-api-key' },
      { label: 'Setup Token', value: 'setup-token',
        flag: ['--auth-choice', 'token', '--token-provider', 'anthropic'],
        secretFlag: '--token' }
    ]
  },
  {
    provider: 'OpenAI',
    options: [
      { label: 'API Key', value: 'openai-api-key', flag: '--openai-api-key' }
    ]
  },
  {
    provider: 'Google / Gemini',
    options: [
      { label: 'API Key', value: 'gemini-api-key', flag: '--gemini-api-key' }
    ]
  },
  {
    provider: 'OpenRouter',
    options: [
      { label: 'API Key', value: 'openrouter-api-key', flag: '--openrouter-api-key' }
    ]
  },
  {
    provider: 'Ollama',
    options: [
      { label: 'No key needed', value: 'ollama', flag: null }
    ]
  }
];

// Flat lookup: auth choice value -> full option object (flag, secretFlag, etc.)
const AUTH_OPTION_MAP = {};
for (const group of AUTH_GROUPS) {
  for (const opt of group.options) {
    AUTH_OPTION_MAP[opt.value] = opt;
  }
}

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

// Login page - no authentication required
app.get('/login', (req, res) => {
  const redirect = req.query.redirect || '/setup';
  // If already authenticated (cookie), redirect immediately
  if (req.cookies?.openclaw_auth === SETUP_PASSWORD) {
    return res.redirect(redirect);
  }
  res.send(getLoginPageHTML({ redirect }));
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  const redirect = req.body.redirect || req.query.redirect || '/setup';
  if (password === SETUP_PASSWORD) {
    res.cookie('openclaw_auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    return res.redirect(redirect);
  }
  // Wrong password - re-render login with error
  res.status(401).send(getLoginPageHTML({ redirect, error: 'Invalid password' }));
});

// Setup authentication middleware
const authMiddleware = createAuthMiddleware(SETUP_PASSWORD);

// Setup wizard routes - main page with web terminal and status
// Handle both GET and POST (POST comes from login form)
const setupHandler = (req, res) => {
  const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
  const isConfigured = existsSync(configFile);
  const gatewayInfo = getGatewayInfo();
  const password = req.query.password || req.body?.password || req.cookies?.openclaw_auth || '';

  res.send(getSetupPageHTML({
    isConfigured,
    gatewayInfo,
    password,
    stateDir: OPENCLAW_STATE_DIR,
    gatewayToken: getGatewayToken(),
    authGroups: AUTH_GROUPS
  }));
};

app.get('/setup', authMiddleware, setupHandler);
app.post('/setup', authMiddleware, setupHandler);

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

  res.attachment('openclaw-backup.tar.gz');
  archive.pipe(res);

  // Add state directory to archive
  if (existsSync(OPENCLAW_STATE_DIR)) {
    archive.directory(OPENCLAW_STATE_DIR, '.openclaw');
  }

  archive.finalize();
});

// Get config
app.get('/setup/config', authMiddleware, (req, res) => {
  const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
  if (existsSync(configFile)) {
    try {
      const config = JSON.parse(readFileSync(configFile, 'utf-8'));
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to parse config file' });
    }
  } else {
    res.json(null);
  }
});

// Save config
app.post('/setup/config', authMiddleware, (req, res) => {
  try {
    const config = req.body;
    // Validate required fields
    if (!config.agent?.model) {
      return res.status(400).json({ error: 'agent.model is required' });
    }
    const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
    writeFileSync(configFile, JSON.stringify(config, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Simple Mode API endpoints ---

// Status endpoint
app.get('/setup/api/status', authMiddleware, (req, res) => {
  const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
  res.json({
    configured: existsSync(configFile),
    gatewayRunning: isGatewayRunning(),
    authGroups: AUTH_GROUPS
  });
});

// Run setup (simple mode)
app.post('/setup/api/run', authMiddleware, async (req, res) => {
  try {
    const { authChoice, authSecret, flow, telegram, discord, slackBot, slackApp } = req.body;
    const logs = [];

    // Build onboard command args
    const onboardArgs = ['--non-interactive', '--accept-risk', '--json',
      '--gateway-token', getGatewayToken()];

    if (flow) {
      onboardArgs.push('--flow', flow);
    }

    const opt = AUTH_OPTION_MAP[authChoice];
    const flag = opt?.flag;
    if (flag) {
      if (Array.isArray(flag)) {
        onboardArgs.push(...flag);
        if (opt.secretFlag && authSecret) {
          onboardArgs.push(opt.secretFlag, authSecret);
        }
      } else if (authSecret) {
        onboardArgs.push(flag, authSecret);
      }
    }

    // Run onboard
    logs.push('> openclaw onboard ' + onboardArgs.map(a => a.startsWith('--') ? a : '***').join(' '));
    const onboardResult = await runCmd('onboard', onboardArgs);
    if (onboardResult.stdout) logs.push(onboardResult.stdout.trim());
    if (onboardResult.stderr) logs.push(onboardResult.stderr.trim());

    if (onboardResult.code !== 0) {
      return res.json({ success: false, logs });
    }

    // Configure channels
    const channels = [
      { name: 'telegram', token: telegram },
      { name: 'discord', token: discord }
    ];

    if (slackBot) {
      channels.push({ name: 'slack', token: slackBot, extra: { appToken: slackApp || '' } });
    }

    for (const ch of channels) {
      if (!ch.token) continue;
      const val = JSON.stringify({
        enabled: true,
        dmPolicy: 'allow',
        botToken: ch.token,
        ...(ch.extra || {})
      });
      const configArgs = ['set', '--json', `channels.${ch.name}`, val];
      logs.push(`> openclaw config ${configArgs[0]} ${configArgs[1]} channels.${ch.name} ...`);
      const r = await runCmd('config', configArgs);
      if (r.stdout) logs.push(r.stdout.trim());
      if (r.stderr) logs.push(r.stderr.trim());
    }

    // Start gateway
    logs.push('> Starting gateway...');
    await startGateway();
    logs.push('Gateway started successfully.');

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, logs: [error.message] });
  }
});

// Reset configuration
app.post('/setup/api/reset', authMiddleware, async (req, res) => {
  try {
    if (isGatewayRunning()) {
      await stopGateway();
    }
    deleteConfig();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Management Panel (/ui) routes ---

// Main UI page
const uiHandler = (req, res) => {
  const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
  const isConfigured = existsSync(configFile);

  // Redirect to /setup if not configured
  if (!isConfigured) {
    const pw = req.query.password || req.body?.password || req.cookies?.openclaw_auth || '';
    return res.redirect(`/setup?password=${encodeURIComponent(pw)}`);
  }

  const gatewayInfo = getGatewayInfo();
  const pw = req.query.password || req.body?.password || req.cookies?.openclaw_auth || '';

  res.send(getUIPageHTML({
    isConfigured,
    gatewayInfo,
    password: pw,
    stateDir: OPENCLAW_STATE_DIR,
    gatewayToken: getGatewayToken(),
    uptime: getGatewayUptime()
  }));
};

app.get('/ui', authMiddleware, uiHandler);
app.post('/ui', authMiddleware, uiHandler);

// UI API: Status
app.get('/ui/api/status', authMiddleware, (req, res) => {
  const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
  const isConfigured = existsSync(configFile);
  const gatewayInfo = getGatewayInfo();

  let model = null;
  let channels = null;
  if (isConfigured) {
    try {
      const config = JSON.parse(readFileSync(configFile, 'utf-8'));
      model = config.agent?.model || null;
      channels = config.channels || null;
    } catch {
      // ignore parse errors
    }
  }

  res.json({
    configured: isConfigured,
    gatewayRunning: isGatewayRunning(),
    gatewayInfo,
    uptime: getGatewayUptime(),
    model,
    channels,
    timestamp: new Date().toISOString()
  });
});

// UI API: Logs
app.get('/ui/api/logs', authMiddleware, (req, res) => {
  const sinceId = parseInt(req.query.since, 10) || 0;
  res.json(getRecentLogs(sinceId));
});

// UI API: Gateway start
app.post('/ui/api/gateway/start', authMiddleware, async (req, res) => {
  try {
    await startGateway();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UI API: Gateway stop
app.post('/ui/api/gateway/stop', authMiddleware, async (req, res) => {
  try {
    await stopGateway();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UI API: Gateway restart
app.post('/ui/api/gateway/restart', authMiddleware, async (req, res) => {
  try {
    if (isGatewayRunning()) {
      await stopGateway();
    }
    await startGateway();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UI API: Pairing approval
app.post('/ui/api/pairing/approve', authMiddleware, async (req, res) => {
  try {
    const { channel, code } = req.body;
    if (!channel || !code) {
      return res.status(400).json({ success: false, error: 'channel and code are required' });
    }
    const result = await runCmd('pairing', ['approve', channel, code]);
    if (result.code === 0) {
      let message = result.stdout.trim();
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(message);
        return res.json({ success: true, message: parsed.message || message });
      } catch {
        return res.json({ success: true, message });
      }
    } else {
      res.json({ success: false, error: result.stderr.trim() || result.stdout.trim() || 'Pairing approval failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UI API: Get config
app.get('/ui/api/config', authMiddleware, (req, res) => {
  const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
  if (existsSync(configFile)) {
    try {
      const config = JSON.parse(readFileSync(configFile, 'utf-8'));
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to parse config file' });
    }
  } else {
    res.json(null);
  }
});

// UI API: Save config
app.post('/ui/api/config', authMiddleware, (req, res) => {
  try {
    const config = req.body;
    if (!config.agent?.model) {
      return res.status(400).json({ success: false, error: 'agent.model is required' });
    }
    const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
    writeFileSync(configFile, JSON.stringify(config, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create reverse proxy
const { middleware: proxyMiddleware, upgradeHandler } = createProxy(getGatewayToken);

// Redirect /openclaw to include gateway token so the SPA can authenticate
const openclawHandler = (req, res, next) => {
  // If token already in query, let the proxy serve the SPA
  // (avoids redirect loop since Express 5 strict:false matches /openclaw/ too)
  if (req.query.token) {
    return next();
  }
  if (!isGatewayRunning()) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'OpenClaw gateway is not running. Visit /setup to start it.'
    });
  }
  const token = getGatewayToken();
  res.redirect(`/openclaw/?token=${encodeURIComponent(token)}`);
};

app.get('/openclaw', authMiddleware, openclawHandler);
app.post('/openclaw', authMiddleware, openclawHandler);

// Proxy all other requests to gateway (when running)
// Note: Using no path argument to avoid Express 5 stripping req.url
// (/{*path} would set req.url to "/" for every request, breaking the proxy)
app.use((req, res, next) => {
  if (!isGatewayRunning()) {
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'OpenClaw gateway is not running. Visit /setup to start it.'
    });
  }
  proxyMiddleware(req, res);
});

// Create HTTP server
const server = createServer(app);

// Initialize terminal WebSocket server (handles /setup/ws endpoint)
createTerminalServer(server, SETUP_PASSWORD);

// Handle WebSocket upgrades for gateway proxy
// Note: Terminal WebSocket upgrades are handled by createTerminalServer
server.on('upgrade', (req, socket, head) => {
  // Skip health check endpoints
  if (req.url.startsWith('/health')) {
    socket.destroy();
    return;
  }

  // Skip terminal endpoints (handled by terminal server)
  if (req.url.startsWith('/setup/ws') || req.url.startsWith('/ui/ws')) {
    return; // Already handled by createTerminalServer
  }

  // Proxy WebSocket to gateway if running
  if (!isGatewayRunning()) {
    socket.destroy();
    return;
  }

  upgradeHandler(req, socket, head);
});

// Graceful shutdown
async function shutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);

  // Close terminal sessions
  closeAllSessions();

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
  console.log(`OpenClaw wrapper server listening on port ${PORT}`);
  console.log(`Setup wizard: http://localhost:${PORT}/setup`);
  console.log(`Management panel: http://localhost:${PORT}/ui`);
  console.log(`Health check: http://localhost:${PORT}/health`);

  // Check if gateway should auto-start (if already configured)
  const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
  if (existsSync(configFile)) {
    console.log('Configuration found, auto-starting gateway...');
    startGateway().catch(err => {
      console.error('Failed to auto-start gateway:', err.message);
    });
  } else {
    console.log('No configuration found. Visit /setup to configure OpenClaw.');
  }
});

/**
 * OpenClaw Railway Template - Wrapper Server
 *
 * Express server that:
 * 1. Exposes health check endpoints (no auth required)
 * 2. Protects /onboard with SETUP_PASSWORD
 * 3. Provides web terminal for `openclaw onboard` wizard
 * 4. Spawns and monitors OpenClaw gateway process
 * 5. Reverse proxies traffic to the gateway
 * 6. Handles WebSocket upgrades
 * 7. Provides /onboard/export for backups
 */

import express from 'express';
import { createServer } from 'http';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import archiver from 'archiver';
import { siAnthropic, siGooglegemini, siOpenrouter, siVercel, siCloudflare, siOllama } from 'simple-icons';
import { CHANNEL_GROUPS, buildChannelConfig, getChannelIcon } from './channels.js';
import { validate, migrateConfig, getAllSchemas } from './schema/index.js';

import healthRouter, { setGatewayReady } from './health.js';
import { createAuthMiddleware } from './auth.js';
import { startGateway, stopGateway, isGatewayRunning, getGatewayInfo, getGatewayToken, runCmd, deleteConfig, getRecentLogs, getGatewayUptime } from './gateway.js';
import { createProxy } from './proxy.js';
import { createTerminalServer, closeAllSessions } from './terminal.js';
import { getSetupPageHTML } from './onboard-page.js';
import { getUIPageHTML } from './ui-page.js';
import { getLoginPageHTML } from './login-page.js';

// Configuration
const PORT = process.env.PORT || 8080;
const SETUP_PASSWORD = process.env.SETUP_PASSWORD;
const OPENCLAW_STATE_DIR = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';

// Custom SVG paths for providers not in simple-icons (viewBox 0 0 24 24)
const CUSTOM_ICONS = {
  'OpenAI': {
    svg: 'M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364l2.0201-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4114-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0974-2.3616l2.603-1.5018 2.6032 1.5018v3.0036l-2.6032 1.5018-2.603-1.5018z',
    color: '#412991'
  },
  'Venice AI': {
    svg: 'M12 2L2 22h4l6-14 6 14h4L12 2z',
    color: '#7C3AED'
  },
  'Together AI': {
    svg: 'M4 4h16v4H14v14h-4V8H4V4z',
    color: '#0EA5E9'
  },
  'Moonshot AI': {
    svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.82 0 3.53-.49 5-1.35A8 8 0 0 1 10 12a8 8 0 0 1 7-7.93A9.96 9.96 0 0 0 12 2z',
    color: '#6366F1'
  },
  'Kimi Coding': {
    svg: 'M6 3v18h4v-7l6 7h5l-7.5-8.5L20 3h-5l-5 6V3H6z',
    color: '#F59E0B'
  },
  'Z.AI (GLM)': {
    svg: 'M4 4h16v4l-10.5 8H20v4H4v-4l10.5-8H4V4z',
    color: '#3B82F6'
  }
};

// Map provider display names to simple-icons objects
const SIMPLE_ICONS_MAP = {
  'Anthropic': siAnthropic,
  'Google / Gemini': siGooglegemini,
  'OpenRouter': siOpenrouter,
  'Vercel AI Gateway': siVercel,
  'Cloudflare AI Gateway': siCloudflare,
  'Ollama': siOllama
};

// Look up icon data for a provider by display name
function getProviderIcon(name) {
  const si = SIMPLE_ICONS_MAP[name];
  if (si) return { svg: si.path, color: '#' + si.hex };
  const custom = CUSTOM_ICONS[name];
  if (custom) return { svg: custom.svg, color: custom.color };
  return null;
}

// Auth provider groups for the simple mode form
const AUTH_GROUPS = [
  // === Popular ===
  {
    provider: 'Anthropic',
    category: 'popular',
    description: 'Claude Opus, Sonnet, Haiku',
    emoji: '\u{1F9E0}',
    options: [
      { label: 'API Key', value: 'anthropic-api-key', flag: '--anthropic-api-key' },
      { label: 'Setup Token', value: 'setup-token',
        flag: ['--auth-choice', 'token', '--token-provider', 'anthropic'],
        secretFlag: '--token' }
    ]
  },
  {
    provider: 'OpenAI',
    category: 'popular',
    description: 'GPT-4o, o1, o3, DALL-E',
    emoji: '\u{1F916}',
    options: [
      { label: 'API Key', value: 'openai-api-key', flag: '--openai-api-key' }
    ]
  },
  {
    provider: 'Google / Gemini',
    category: 'popular',
    description: 'Gemini Pro, Flash, Ultra',
    emoji: '\u{2728}',
    options: [
      { label: 'API Key', value: 'gemini-api-key', flag: '--gemini-api-key' }
    ]
  },
  {
    provider: 'OpenRouter',
    category: 'popular',
    description: 'Multi-provider gateway',
    emoji: '\u{1F310}',
    options: [
      { label: 'API Key', value: 'openrouter-api-key', flag: '--openrouter-api-key' }
    ]
  },
  // === More Providers ===
  {
    provider: 'Venice AI',
    category: 'more',
    description: 'Privacy-focused AI inference',
    emoji: '\u{1F3AD}',
    options: [
      { label: 'API Key', value: 'venice-api-key',
        flag: ['--auth-choice', 'venice-api-key'],
        secretFlag: '--venice-api-key' }
    ]
  },
  {
    provider: 'Together AI',
    category: 'more',
    description: 'Open-source model hosting',
    emoji: '\u{1F91D}',
    options: [
      { label: 'API Key', value: 'together-api-key',
        flag: ['--auth-choice', 'together-api-key'],
        secretFlag: '--together-api-key' }
    ]
  },
  {
    provider: 'Vercel AI Gateway',
    category: 'more',
    description: 'Edge AI inference gateway',
    emoji: '\u25B2',
    options: [
      { label: 'API Key', value: 'ai-gateway-api-key',
        flag: ['--auth-choice', 'ai-gateway-api-key'],
        secretFlag: '--ai-gateway-api-key' }
    ]
  },
  {
    provider: 'Moonshot AI',
    category: 'more',
    description: 'Kimi large language models',
    emoji: '\u{1F319}',
    options: [
      { label: 'API Key', value: 'moonshot-api-key',
        flag: ['--auth-choice', 'moonshot-api-key'],
        secretFlag: '--moonshot-api-key' }
    ]
  },
  {
    provider: 'Kimi Coding',
    category: 'more',
    description: 'AI-powered code assistant',
    emoji: '\u{1F4BB}',
    options: [
      { label: 'API Key', value: 'kimi-code-api-key',
        flag: ['--auth-choice', 'kimi-code-api-key'],
        secretFlag: '--kimi-code-api-key' }
    ]
  },
  {
    provider: 'Z.AI (GLM)',
    category: 'more',
    description: 'Zhipu GLM series models',
    emoji: '\u{1F4A0}',
    options: [
      { label: 'API Key', value: 'zai-api-key',
        flag: ['--auth-choice', 'zai-api-key'],
        secretFlag: '--zai-api-key' }
    ]
  },
  {
    provider: 'Cloudflare AI Gateway',
    category: 'more',
    description: 'Edge AI inference gateway',
    emoji: '\u2601\uFE0F',
    options: [
      { label: 'API Key + IDs', value: 'cloudflare-ai-gateway-api-key',
        flag: ['--auth-choice', 'cloudflare-ai-gateway-api-key'],
        secretFlag: '--cloudflare-ai-gateway-api-key',
        extraFields: [
          { id: 'cf-account-id', label: 'Account ID', flag: '--cloudflare-ai-gateway-account-id', placeholder: 'Cloudflare account ID' },
          { id: 'cf-gateway-id', label: 'Gateway ID', flag: '--cloudflare-ai-gateway-gateway-id', placeholder: 'AI Gateway ID' }
        ]
      }
    ]
  },
  {
    provider: 'Ollama',
    category: 'more',
    description: 'Run models locally',
    emoji: '\u{1F999}',
    options: [
      { label: 'No key needed', value: 'ollama', flag: null }
    ]
  }
];

// Enrich each provider group with SVG icon data
for (const group of AUTH_GROUPS) {
  group.icon = getProviderIcon(group.provider);
}

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
  const redirect = req.query.redirect || '/onboard';
  // If already authenticated (cookie), redirect immediately
  if (req.cookies?.openclaw_auth === SETUP_PASSWORD) {
    return res.redirect(redirect);
  }
  res.send(getLoginPageHTML({ redirect }));
});

app.post('/login', (req, res) => {
  const { password } = req.body;
  const redirect = req.body.redirect || req.query.redirect || '/onboard';
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
    authGroups: AUTH_GROUPS,
    channelGroups: CHANNEL_GROUPS
  }));
};

app.get('/onboard', authMiddleware, setupHandler);
app.post('/onboard', authMiddleware, setupHandler);

// Start gateway
app.post('/onboard/start', authMiddleware, async (req, res) => {
  try {
    await startGateway();
    res.redirect(`/onboard?password=${req.query.password || req.body.password || ''}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stop gateway
app.post('/onboard/stop', authMiddleware, async (req, res) => {
  try {
    await stopGateway();
    res.redirect(`/onboard?password=${req.query.password || req.body.password || ''}`);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export backup
app.get('/onboard/export', authMiddleware, (req, res) => {
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
app.get('/onboard/config', authMiddleware, (req, res) => {
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
app.post('/onboard/config', authMiddleware, (req, res) => {
  try {
    const config = req.body;

    // Auto-migrate legacy keys before validation
    const { migrated } = migrateConfig(config);

    // Validate against schema
    const result = validate(config);
    if (!result.valid) {
      return res.status(400).json({ error: 'Validation failed', errors: result.errors });
    }

    const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
    writeFileSync(configFile, JSON.stringify(config, null, 2));
    res.json({ success: true, migrated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Simple Mode API endpoints ---

// Status endpoint
app.get('/onboard/api/status', authMiddleware, (req, res) => {
  const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
  res.json({
    configured: existsSync(configFile),
    gatewayRunning: isGatewayRunning(),
    authGroups: AUTH_GROUPS
  });
});

// Run setup (simple mode)
app.post('/onboard/api/run', authMiddleware, async (req, res) => {
  try {
    const { authChoice, authSecret, extraFieldValues, flow, channels: channelPayload, skills } = req.body;
    const logs = [];

    // Build onboard command args
    const onboardArgs = ['--non-interactive', '--accept-risk', '--json'];

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

    // Handle extra fields (e.g., Cloudflare account/gateway IDs)
    if (opt?.extraFields && extraFieldValues) {
      for (const field of opt.extraFields) {
        const val = extraFieldValues[field.id];
        if (val && field.flag) {
          onboardArgs.push(field.flag, val);
        }
      }
    }

    // Run onboard
    logs.push('> openclaw onboard ' + onboardArgs.map(a => a.startsWith('--') ? a : '***').join(' '));
    const onboardResult = await runCmd('onboard', onboardArgs);
    if (onboardResult.stdout) logs.push(onboardResult.stdout.trim());
    if (onboardResult.stderr) logs.push(onboardResult.stderr.trim());

    if (onboardResult.code !== 0) {
      // onboard always tries to verify the gateway connection after writing config.
      // Since no gateway is running yet (we start it below), the verification fails
      // and onboard exits non-zero. Check if config was actually written — if so,
      // treat the gateway verification failure as non-fatal and continue.
      const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
      if (!existsSync(configFile)) {
        return res.json({ success: false, logs });
      }
      logs.push('(Gateway verification skipped — gateway will be started next)');
    }

    // Configure channels and skills directly in config file
    // (openclaw config set requires a running gateway; we write to file instead)
    const configPath = join(OPENCLAW_STATE_DIR, 'openclaw.json');
    const ocConfig = JSON.parse(readFileSync(configPath, 'utf-8'));

    for (const ch of channelPayload || []) {
      ocConfig.channels = ocConfig.channels || {};
      ocConfig.channels[ch.name] = buildChannelConfig(ch.name, ch.fields);
      logs.push(`Configured channel: ${ch.name}`);
    }

    if (skills && Array.isArray(skills)) {
      ocConfig.skills = ocConfig.skills || {};
      ocConfig.skills.entries = ocConfig.skills.entries || {};
      for (const skillName of skills) {
        ocConfig.skills.entries[skillName] = { enabled: true };
        logs.push(`Enabled skill: ${skillName}`);
      }
    }

    writeFileSync(configPath, JSON.stringify(ocConfig, null, 2));

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
app.post('/onboard/api/reset', authMiddleware, async (req, res) => {
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

  // Redirect to /onboard if not configured
  if (!isConfigured) {
    const pw = req.query.password || req.body?.password || req.cookies?.openclaw_auth || '';
    return res.redirect(`/onboard?password=${encodeURIComponent(pw)}`);
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
      // Support both new and legacy config shapes
      model = config.agents?.defaults?.model?.primary || config.agents?.defaults?.model || config.agent?.model || null;
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

    // Auto-migrate legacy keys before validation
    const { migrated } = migrateConfig(config);

    // Validate against schema
    const result = validate(config);
    if (!result.valid) {
      return res.status(400).json({ success: false, error: 'Validation failed', errors: result.errors });
    }

    const configFile = join(OPENCLAW_STATE_DIR, 'openclaw.json');
    writeFileSync(configFile, JSON.stringify(config, null, 2));
    res.json({ success: true, migrated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Serve schemas + form metadata for client-side validation and form generation
app.get('/api/schemas', authMiddleware, (req, res) => {
  res.json(getAllSchemas());
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
      message: 'OpenClaw gateway is not running. Visit /onboard to start it.'
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
      message: 'OpenClaw gateway is not running. Visit /onboard to start it.'
    });
  }
  proxyMiddleware(req, res);
});

// Create HTTP server
const server = createServer(app);

// Initialize terminal WebSocket server (handles /onboard/ws endpoint)
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
  if (req.url.startsWith('/onboard/ws') || req.url.startsWith('/ui/ws')) {
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
  console.log(`Setup wizard: http://localhost:${PORT}/onboard`);
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
    console.log('No configuration found. Visit /onboard to configure OpenClaw.');
  }
});

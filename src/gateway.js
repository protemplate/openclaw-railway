/**
 * Gateway process manager for OpenClaw
 *
 * Handles spawning, monitoring, and graceful shutdown of the OpenClaw gateway process
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, readdirSync, renameSync, symlinkSync, lstatSync, rmSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { setGatewayReady } from './health.js';
import { migrateConfig, getDefaultConfig } from './schema/index.js';

let gatewayProcess = null;
let isShuttingDown = false;

// Log buffering for UI panel
const LOG_BUFFER_MAX = 1000;
let logBuffer = [];
let logIdCounter = 0;
let gatewayStartTime = null;

/**
 * Buffer a log line from the gateway process
 * @param {'stdout'|'stderr'} stream - Which stream the line came from
 * @param {string} text - The log text
 */
function bufferLogLine(stream, text) {
  logIdCounter++;
  logBuffer.push({
    id: logIdCounter,
    timestamp: Date.now(),
    stream,
    text
  });
  if (logBuffer.length > LOG_BUFFER_MAX) {
    logBuffer = logBuffer.slice(logBuffer.length - LOG_BUFFER_MAX);
  }
}

/**
 * Get or generate the gateway token
 * @returns {string} Gateway authentication token
 */
export function getGatewayToken() {
  const stateDir = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';
  const tokenFile = join(stateDir, 'gateway.token');

  // Check if token is set via environment variable
  if (process.env.OPENCLAW_GATEWAY_TOKEN) {
    return process.env.OPENCLAW_GATEWAY_TOKEN;
  }

  // Check if token file exists
  if (existsSync(tokenFile)) {
    return readFileSync(tokenFile, 'utf-8').trim();
  }

  // Generate new token
  const token = crypto.randomBytes(32).toString('hex');

  // Ensure directory exists
  mkdirSync(stateDir, { recursive: true });

  // Save token
  writeFileSync(tokenFile, token, { mode: 0o600 });
  console.log('Generated new gateway token');

  return token;
}

/**
 * Check if the gateway is currently running
 * @returns {boolean} True if gateway is running
 */
export function isGatewayRunning() {
  return gatewayProcess !== null && !gatewayProcess.killed;
}

/**
 * Start the OpenClaw gateway process
 * @returns {Promise<void>}
 */
export async function startGateway() {
  if (isGatewayRunning()) {
    console.log('Gateway is already running');
    return;
  }

  const port = process.env.INTERNAL_GATEWAY_PORT || '18789';
  const stateDir = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';
  const workspaceDir = process.env.OPENCLAW_WORKSPACE_DIR || '/data/workspace';

  isShuttingDown = false;
  console.log(`Starting OpenClaw gateway on port ${port}...`);

  // Symlink HOME-derived workspace to the persistent volume so memories survive redeploys.
  // OpenClaw uses $HOME/.openclaw/workspace internally, which with HOME=/home/openclaw
  // resolves to /home/openclaw/.openclaw/workspace — NOT on the /data volume.
  const homeOpenclawDir = '/home/openclaw/.openclaw';
  const homeWorkspace = join(homeOpenclawDir, 'workspace');
  mkdirSync(homeOpenclawDir, { recursive: true });
  if (existsSync(homeWorkspace) && !lstatSync(homeWorkspace).isSymbolicLink()) {
    // Real dir exists — move any files to persistent location, then replace with symlink
    const files = readdirSync(homeWorkspace);
    for (const f of files) {
      const src = join(homeWorkspace, f);
      const dest = join(workspaceDir, f);
      if (!existsSync(dest)) {
        renameSync(src, dest);
      }
    }
    rmSync(homeWorkspace, { recursive: true, force: true });
  }
  if (!existsSync(homeWorkspace)) {
    symlinkSync(workspaceDir, homeWorkspace);
    console.log(`Symlinked ${homeWorkspace} -> ${workspaceDir}`);
  }
  // Ensure memory subdirectory exists on the persistent volume
  mkdirSync(join(workspaceDir, 'memory'), { recursive: true });
  mkdirSync(join(stateDir, 'workspace', 'memory'), { recursive: true });

  // Create minimal config if not exists
  const configFile = join(stateDir, 'openclaw.json');
  if (!existsSync(configFile)) {
    console.log('Creating minimal configuration...');
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(configFile, JSON.stringify(getDefaultConfig(port), null, 2));
    console.log('Configuration created at', configFile);
  }

  // Get or generate gateway token
  const token = getGatewayToken();

  // Ensure token is in config file for gateway auth
  const config = JSON.parse(readFileSync(configFile, 'utf-8'));

  // Migrate legacy config keys (agent.* → agents.defaults.* + tools.*)
  const { migrated, changes } = migrateConfig(config);
  if (migrated) {
    console.log('Migrated legacy config keys:');
    for (const change of changes) {
      console.log(`  ${change}`);
    }
  }

  // Inject gateway settings (always overwritten by wrapper)
  config.gateway = config.gateway || {};
  config.gateway.port = parseInt(port, 10);
  config.gateway.auth = { mode: 'token', token };
  config.gateway.controlUi = config.gateway.controlUi || {};
  config.gateway.controlUi.basePath = '/openclaw';
  // Allow token-only auth without device pairing — safe because the gateway is bound
  // to loopback and our wrapper enforces SETUP_PASSWORD + HTTPS externally
  config.gateway.controlUi.allowInsecureAuth = true;
  config.gateway.controlUi.dangerouslyDisableDeviceAuth = true;

  // Allow the Railway public domain as a WebSocket origin so the Control UI works
  const publicDomain = process.env.RAILWAY_PUBLIC_DOMAIN;
  if (publicDomain) {
    const origins = config.gateway.controlUi.allowedOrigins || [];
    const httpsOrigin = `https://${publicDomain}`;
    if (!origins.includes(httpsOrigin)) {
      origins.push(httpsOrigin);
    }
    config.gateway.controlUi.allowedOrigins = origins;
  }

  // Note: Do NOT set trustedProxies — it tells the gateway that connections from
  // 127.0.0.1 are proxy-forwarded, which breaks the isLocalDirectRequest() check.
  // Without trustedProxies, all loopback connections are treated as direct local
  // clients, enabling auto-approval of device pairing for CLI commands like
  // `openclaw status --deep`. The proxy already strips x-forwarded-for headers,
  // so the gateway sees remoteAddr=127.0.0.1 regardless.
  delete config.gateway.trustedProxies;
  delete config.gateway.token;

  // Fix channel config validation: dmPolicy="open" requires allowFrom to include "*"
  if (config.channels) {
    for (const [name, channel] of Object.entries(config.channels)) {
      if (channel && channel.dmPolicy === 'open') {
        if (!Array.isArray(channel.allowFrom)) {
          channel.allowFrom = ['*'];
          console.log(`Fixed channels.${name}.allowFrom: set to ["*"] for dmPolicy="open"`);
        } else if (!channel.allowFrom.includes('*')) {
          channel.allowFrom.push('*');
          console.log(`Fixed channels.${name}.allowFrom: added "*" for dmPolicy="open"`);
        }
      }
    }
  }

  // Ensure memory backend is configured (default to builtin FTS)
  config.memory = config.memory || {};
  if (!config.memory.backend) {
    config.memory.backend = 'builtin';
    console.log('Set memory backend to builtin');
  }

  // Auto-enable bundled skills when their env vars are present
  if (process.env.SEARXNG_URL) {
    config.skills = config.skills || {};
    config.skills.entries = config.skills.entries || {};
    if (!config.skills.entries['searxng-local']) {
      config.skills.entries['searxng-local'] = { enabled: true };
      console.log('Auto-enabled searxng-local skill (SEARXNG_URL is set)');
    }
  }

  // Clean up invalid browser keys from previous deployments
  if (config.browser && config.browser.launchArgs) {
    delete config.browser.launchArgs;
    config.browser.headless = true;
    config.browser.noSandbox = true;
    console.log('Removed invalid browser.launchArgs from config');
  }

  // Configure browser for Docker/Railway (headless Chromium with safe flags)
  if (!config.browser || Object.keys(config.browser).length === 0) {
    config.browser = {
      headless: true,
      noSandbox: true,
    };
    console.log('Injected Docker-safe browser configuration');
  }

  writeFileSync(configFile, JSON.stringify(config, null, 2));

  // Start the gateway
  // Using: openclaw gateway --port PORT --verbose
  gatewayProcess = spawn('openclaw', [
    'gateway', 'run',
    '--bind', 'loopback',
    '--port', port,
    '--auth', 'token',
    '--token', token,
    '--verbose'
  ], {
    env: {
      ...process.env,
      HOME: '/home/openclaw',
      OPENCLAW_STATE_DIR: stateDir,
      OPENCLAW_WORKSPACE_DIR: workspaceDir,
      OPENCLAW_BUNDLED_SKILLS_DIR: join(stateDir, 'skills'),
      PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '/ms-playwright'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  gatewayStartTime = Date.now();

  gatewayProcess.stdout.on('data', (data) => {
    const text = data.toString().trim();
    console.log(`[gateway] ${text}`);
    bufferLogLine('stdout', text);
  });

  gatewayProcess.stderr.on('data', (data) => {
    const text = data.toString().trim();
    console.error(`[gateway] ${text}`);
    bufferLogLine('stderr', text);
  });

  gatewayProcess.on('error', (error) => {
    console.error('Gateway process error:', error.message);
    setGatewayReady(false);
  });

  gatewayProcess.on('exit', (code, signal) => {
    console.log(`Gateway exited with code ${code}, signal ${signal}`);
    gatewayProcess = null;
    gatewayStartTime = null;
    setGatewayReady(false);

    // Restart if not shutting down and exited unexpectedly
    if (!isShuttingDown && code !== 0) {
      console.log('Gateway crashed, restarting in 5 seconds...');
      setTimeout(() => startGateway().catch(err => {
        console.error('Gateway restart failed:', err.message);
      }), 5000);
    }
  });

  // Wait for gateway to be ready (up to 90s for cold starts)
  try {
    await waitForGateway(port, 90000);
    syncGatewayToken(configFile, token, stateDir);
    setGatewayReady(true);
    console.log('Gateway is ready');

    // Auto-index memory in the background so files created since last restart are searchable
    runCmd('memory', ['index']).then(result => {
      if (result.code === 0) {
        console.log('Memory indexed successfully');
      } else {
        console.log('Memory index skipped:', result.stderr.trim());
      }
    }).catch(() => {});
  } catch (err) {
    console.warn(`Initial gateway wait failed: ${err.message}`);
    // The process may still be starting — poll in the background
    if (isGatewayRunning()) {
      console.log('Gateway process is alive, continuing to poll in background...');
      pollUntilReady(port, configFile, token, stateDir);
    }
  }
}

/**
 * Run the openclaw onboard command in non-interactive mode
 * @returns {Promise<void>}
 */
async function runOnboard() {
  const stateDir = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';
  const workspaceDir = process.env.OPENCLAW_WORKSPACE_DIR || '/data/workspace';

  return new Promise((resolve, reject) => {
    const onboard = spawn('openclaw', ['onboard', '--non-interactive', '--accept-risk'], {
      env: {
        ...process.env,
        HOME: '/home/openclaw',
        OPENCLAW_STATE_DIR: stateDir,
        OPENCLAW_WORKSPACE_DIR: workspaceDir,
        PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '/ms-playwright'
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    onboard.stdout.on('data', (data) => {
      console.log(`[onboard] ${data.toString().trim()}`);
    });

    onboard.stderr.on('data', (data) => {
      console.error(`[onboard] ${data.toString().trim()}`);
    });

    onboard.on('error', reject);
    onboard.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Onboard exited with code ${code}`));
      }
    });
  });
}

/**
 * Run an arbitrary openclaw command and return its output
 * @param {string} command - The openclaw subcommand (e.g., 'onboard', 'config')
 * @param {string[]} args - Arguments to pass after the subcommand
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
export function runCmd(command, args = [], extraEnv = {}) {
  const stateDir = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';
  const workspaceDir = process.env.OPENCLAW_WORKSPACE_DIR || '/data/workspace';

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const child = spawn('openclaw', [command, ...args], {
      env: {
        ...process.env,
        HOME: '/home/openclaw',
        OPENCLAW_STATE_DIR: stateDir,
        OPENCLAW_WORKSPACE_DIR: workspaceDir,
        PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '/ms-playwright',
        ...extraEnv
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('error', (err) => {
      resolve({ stdout, stderr: stderr + err.message, code: 1 });
    });

    child.on('exit', (code) => {
      resolve({ stdout, stderr, code: code ?? 1 });
    });
  });
}

/**
 * Run an arbitrary command (not prefixed with 'openclaw') and return its output
 * @param {string} command - The full command name (e.g., 'npx')
 * @param {string[]} args - Arguments to pass to the command
 * @param {Object} extraEnv - Additional environment variables
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
export function runExec(command, args = [], extraEnv = {}) {
  const stateDir = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';
  const workspaceDir = process.env.OPENCLAW_WORKSPACE_DIR || '/data/workspace';

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const child = spawn(command, args, {
      env: {
        ...process.env,
        HOME: '/home/openclaw',
        OPENCLAW_STATE_DIR: stateDir,
        OPENCLAW_WORKSPACE_DIR: workspaceDir,
        PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '/ms-playwright',
        ...extraEnv
      },
      stdio: ['ignore', 'pipe', 'pipe']
    });

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('error', (err) => {
      resolve({ stdout, stderr: stderr + err.message, code: 1 });
    });

    child.on('exit', (code) => {
      resolve({ stdout, stderr, code: code ?? 1 });
    });
  });
}

/**
 * Delete the openclaw configuration file
 * @returns {boolean} True if file was deleted, false if it didn't exist
 */
export function deleteConfig() {
  const stateDir = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';
  const configFile = join(stateDir, 'openclaw.json');

  if (existsSync(configFile)) {
    unlinkSync(configFile);
    return true;
  }
  return false;
}

/**
 * Wait for the gateway to be ready
 * @param {string} port - Gateway port
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function waitForGateway(port, timeout = 30000) {
  const start = Date.now();
  const endpoints = ['/health', '/', '/openclaw'];

  while (Date.now() - start < timeout) {
    for (const endpoint of endpoints) {
      try {
        await fetch(`http://127.0.0.1:${port}${endpoint}`);
        // Any response (even 404/401) means the server is listening
        return;
      } catch {
        // Gateway not ready yet (connection refused)
      }
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  throw new Error('Gateway failed to start within timeout');
}

/**
 * Sync the gateway token from the config file after startup
 */
function syncGatewayToken(configFile, originalToken, stateDir) {
  try {
    const liveConfig = JSON.parse(readFileSync(configFile, 'utf-8'));
    const liveToken = liveConfig.gateway?.auth?.token;
    if (liveToken && liveToken !== originalToken) {
      console.log('Gateway changed auth token on startup — syncing token file');
      const tokenFile = join(stateDir, 'gateway.token');
      writeFileSync(tokenFile, liveToken, { mode: 0o600 });
    }
  } catch (err) {
    console.error('Failed to sync gateway token:', err.message);
  }
}

/**
 * Poll for gateway readiness in the background (when initial wait times out)
 * Checks every 5s for up to 5 minutes
 */
function pollUntilReady(port, configFile, originalToken, stateDir) {
  const maxPollTime = 300000; // 5 minutes
  const pollInterval = 5000;
  const start = Date.now();

  const timer = setInterval(async () => {
    if (!isGatewayRunning()) {
      console.log('Gateway process exited during background poll');
      clearInterval(timer);
      return;
    }
    try {
      await fetch(`http://127.0.0.1:${port}/health`);
      console.log('Gateway became ready (background poll)');
      clearInterval(timer);
      syncGatewayToken(configFile, originalToken, stateDir);
      setGatewayReady(true);

      // Auto-index memory in the background
      runCmd('memory', ['index']).then(result => {
        if (result.code === 0) {
          console.log('Memory indexed successfully');
        } else {
          console.log('Memory index skipped:', result.stderr.trim());
        }
      }).catch(() => {});
    } catch {
      if (Date.now() - start > maxPollTime) {
        console.error('Gateway did not become ready within 5 minutes');
        clearInterval(timer);
      }
    }
  }, pollInterval);
}

/**
 * Stop the gateway gracefully
 * @returns {Promise<void>}
 */
export async function stopGateway() {
  if (!isGatewayRunning()) {
    return;
  }

  isShuttingDown = true;
  console.log('Stopping gateway...');

  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.log('Gateway did not stop gracefully, killing...');
      gatewayProcess.kill('SIGKILL');
      resolve();
    }, 10000);

    gatewayProcess.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });

    gatewayProcess.kill('SIGTERM');
  });
}

/**
 * Get gateway process info
 * @returns {Object} Process information
 */
export function getGatewayInfo() {
  return {
    running: isGatewayRunning(),
    pid: gatewayProcess?.pid || null,
    port: process.env.INTERNAL_GATEWAY_PORT || '18789'
  };
}

/**
 * Get recent log entries from the gateway process
 * @param {number} sinceId - Only return entries with id > sinceId (0 for all)
 * @returns {{entries: Array, lastId: number}}
 */
export function getRecentLogs(sinceId = 0) {
  const entries = logBuffer.filter(e => e.id > sinceId);
  return {
    entries,
    lastId: logBuffer.length > 0 ? logBuffer[logBuffer.length - 1].id : sinceId
  };
}

/**
 * Get gateway uptime in seconds, or null if not running
 * @returns {number|null}
 */
export function getGatewayUptime() {
  if (!gatewayStartTime || !isGatewayRunning()) return null;
  return Math.floor((Date.now() - gatewayStartTime) / 1000);
}

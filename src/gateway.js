/**
 * Gateway process manager for OpenClaw
 *
 * Handles spawning, monitoring, and graceful shutdown of the OpenClaw gateway process
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
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
  config.gateway.controlUi.allowInsecureAuth = true;
  config.gateway.trustedProxies = ['127.0.0.1', '::1'];
  delete config.gateway.token;
  writeFileSync(configFile, JSON.stringify(config, null, 2));

  // Run doctor --fix to auto-repair any config validation issues
  // (e.g., dmPolicy="open" requires allowFrom to include "*")
  const doctorResult = await runCmd('doctor', ['--fix'], {
    HOME: stateDir,
    OPENCLAW_STATE_DIR: stateDir,
    OPENCLAW_WORKSPACE_DIR: workspaceDir
  });
  if (doctorResult.code === 0) {
    const output = (doctorResult.stdout + doctorResult.stderr).trim();
    if (output) console.log(`[doctor] ${output}`);
  } else {
    console.warn(`[doctor] exited with code ${doctorResult.code}: ${doctorResult.stderr.trim()}`);
  }

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
      HOME: stateDir,
      OPENCLAW_STATE_DIR: stateDir,
      OPENCLAW_WORKSPACE_DIR: workspaceDir
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

  // Wait for gateway to be ready
  await waitForGateway(port);

  // The gateway may rewrite the config file with its own token after startup.
  // Sync: read the token the gateway is actually using and update our token file
  // so getGatewayToken() returns the correct value for proxy auth and /openclaw redirect.
  try {
    const liveConfig = JSON.parse(readFileSync(configFile, 'utf-8'));
    const liveToken = liveConfig.gateway?.auth?.token;
    if (liveToken && liveToken !== token) {
      console.log('Gateway changed auth token on startup — syncing token file');
      const tokenFile = join(stateDir, 'gateway.token');
      writeFileSync(tokenFile, liveToken, { mode: 0o600 });
    }
  } catch (err) {
    console.error('Failed to sync gateway token:', err.message);
  }

  setGatewayReady(true);
  console.log('Gateway is ready');
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
        HOME: stateDir,
        OPENCLAW_STATE_DIR: stateDir,
        OPENCLAW_WORKSPACE_DIR: workspaceDir
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
        HOME: stateDir,
        OPENCLAW_STATE_DIR: stateDir,
        OPENCLAW_WORKSPACE_DIR: workspaceDir,
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

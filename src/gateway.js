/**
 * Gateway process manager for MoltBot
 *
 * Handles spawning, monitoring, and graceful shutdown of the MoltBot gateway process
 */

import { spawn } from 'child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import { setGatewayReady } from './health.js';

let gatewayProcess = null;
let isShuttingDown = false;

/**
 * Get or generate the gateway token
 * @returns {string} Gateway authentication token
 */
export function getGatewayToken() {
  const stateDir = process.env.MOLTBOT_STATE_DIR || '/data/.moltbot';
  const tokenFile = join(stateDir, 'gateway.token');

  // Check if token is set via environment variable
  if (process.env.MOLTBOT_GATEWAY_TOKEN) {
    return process.env.MOLTBOT_GATEWAY_TOKEN;
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
 * Start the MoltBot gateway process
 * @returns {Promise<void>}
 */
export async function startGateway() {
  if (isGatewayRunning()) {
    console.log('Gateway is already running');
    return;
  }

  const port = process.env.INTERNAL_GATEWAY_PORT || '18789';
  const stateDir = process.env.MOLTBOT_STATE_DIR || '/data/.moltbot';
  const workspaceDir = process.env.MOLTBOT_WORKSPACE_DIR || '/data/workspace';

  console.log(`Starting MoltBot gateway on port ${port}...`);

  // First run onboard in non-interactive mode if not already set up
  const configFile = join(stateDir, 'moltbot.json');
  if (!existsSync(configFile)) {
    console.log('Running initial setup...');
    await runOnboard();
  }

  // Start the gateway
  gatewayProcess = spawn('moltbot', ['gateway', '--port', port, '--verbose'], {
    env: {
      ...process.env,
      HOME: stateDir,
      MOLTBOT_STATE_DIR: stateDir,
      MOLTBOT_WORKSPACE_DIR: workspaceDir
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  gatewayProcess.stdout.on('data', (data) => {
    console.log(`[gateway] ${data.toString().trim()}`);
  });

  gatewayProcess.stderr.on('data', (data) => {
    console.error(`[gateway] ${data.toString().trim()}`);
  });

  gatewayProcess.on('error', (error) => {
    console.error('Gateway process error:', error.message);
    setGatewayReady(false);
  });

  gatewayProcess.on('exit', (code, signal) => {
    console.log(`Gateway exited with code ${code}, signal ${signal}`);
    gatewayProcess = null;
    setGatewayReady(false);

    // Restart if not shutting down and exited unexpectedly
    if (!isShuttingDown && code !== 0) {
      console.log('Gateway crashed, restarting in 5 seconds...');
      setTimeout(() => startGateway(), 5000);
    }
  });

  // Wait for gateway to be ready
  await waitForGateway(port);
  setGatewayReady(true);
  console.log('Gateway is ready');
}

/**
 * Run the moltbot onboard command in non-interactive mode
 * @returns {Promise<void>}
 */
async function runOnboard() {
  const stateDir = process.env.MOLTBOT_STATE_DIR || '/data/.moltbot';
  const workspaceDir = process.env.MOLTBOT_WORKSPACE_DIR || '/data/workspace';

  return new Promise((resolve, reject) => {
    const onboard = spawn('moltbot', ['onboard', '--non-interactive'], {
      env: {
        ...process.env,
        HOME: stateDir,
        MOLTBOT_STATE_DIR: stateDir,
        MOLTBOT_WORKSPACE_DIR: workspaceDir
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
 * Wait for the gateway to be ready
 * @param {string} port - Gateway port
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<void>}
 */
async function waitForGateway(port, timeout = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // Gateway not ready yet
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

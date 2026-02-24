/**
 * Server harness for E2E tests.
 *
 * Spawns the real server process with the mock CLI on PATH,
 * using a temp directory for state so tests are isolated.
 */

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..', '..');

/**
 * Start the server with a fresh temp state directory and mock CLI on PATH.
 *
 * @returns {Promise<{ port: number, stateDir: string, process: ChildProcess, cleanup: () => void }>}
 */
export async function startServer() {
  const stateDir = mkdtempSync(join(tmpdir(), 'openclaw-test-'));
  const mockDir = join(PROJECT_ROOT, 'mock');

  // Pick a random high port to avoid collisions
  const port = 30000 + Math.floor(Math.random() * 20000);

  const homeDir = mkdtempSync(join(tmpdir(), 'openclaw-home-'));

  const env = {
    ...process.env,
    PORT: String(port),
    SETUP_PASSWORD: 'test-password',
    OPENCLAW_STATE_DIR: stateDir,
    OPENCLAW_WORKSPACE_DIR: join(stateDir, 'workspace'),
    HOME: homeDir,
    // Prepend mock/ so `openclaw` resolves to our mock script
    PATH: `${mockDir}:${process.env.PATH}`,
  };

  const child = spawn('node', [join(PROJECT_ROOT, 'src', 'server.js')], {
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Wait for "listening on port" message
  const actualPort = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server did not start within 10s')), 10000);
    let stderr = '';

    child.stdout.on('data', (data) => {
      const line = data.toString();
      const match = line.match(/listening on port (\d+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(parseInt(match[1], 10));
      }
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Server exited with code ${code}: ${stderr}`));
    });
  });

  const cleanup = () => {
    try { child.kill('SIGTERM'); } catch { /* already dead */ }
    try { rmSync(stateDir, { recursive: true, force: true }); } catch { /* best effort */ }
    try { rmSync(homeDir, { recursive: true, force: true }); } catch { /* best effort */ }
  };

  return { port: actualPort, stateDir, process: child, cleanup };
}

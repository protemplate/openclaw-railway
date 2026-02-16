/**
 * Layer 3: E2E deploy flow tests
 *
 * Spawns the real server with mock CLI and exercises the full
 * POST /onboard/api/run -> mock CLI -> config file pipeline.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CHANNEL_GROUPS } from '../src/channels.js';
import { CHANNEL_FIXTURES } from './helpers/fixtures.js';
import { startServer } from './helpers/server-harness.js';

let server;

/**
 * POST JSON to the server with auth.
 */
async function postRun(port, body) {
  const res = await fetch(`http://127.0.0.1:${port}/onboard/api/run?password=test-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

/**
 * Read and parse the openclaw.json config file from the state dir.
 */
function readConfig(stateDir) {
  const raw = readFileSync(join(stateDir, 'openclaw.json'), 'utf-8');
  return JSON.parse(raw);
}

describe('E2E deploy flow', { timeout: 30000 }, () => {
  before(async () => {
    server = await startServer();
  });

  after(() => {
    server?.cleanup();
  });

  describe('deploy each channel individually', () => {
    for (const ch of CHANNEL_GROUPS) {
      it(`deploys ${ch.name} with correct config`, async () => {
        const fixture = CHANNEL_FIXTURES[ch.name];

        const result = await postRun(server.port, {
          authChoice: 'anthropic-api-key',
          authSecret: 'sk-test-key',
          channels: [{ name: ch.name, fields: fixture }],
        });

        assert.equal(result.success, true, `Deploy failed for ${ch.name}: ${JSON.stringify(result.logs)}`);

        const config = readConfig(server.stateDir);
        const channelConfig = config.channels?.[ch.name];

        assert.ok(channelConfig, `channels.${ch.name} missing from config file`);
        assert.equal(channelConfig.enabled, true);
        assert.equal(channelConfig.dmPolicy, 'open');

        // Verify all fixture field values are present
        for (const [key, val] of Object.entries(fixture || {})) {
          if (!val) continue;
          if (ch.name === 'irc' && key === 'channels') {
            // IRC channels should be converted to array
            assert.ok(Array.isArray(channelConfig.channels), 'IRC channels should be an array');
            assert.deepEqual(
              channelConfig.channels,
              val.split(',').map(s => s.trim()).filter(Boolean)
            );
          } else {
            assert.equal(channelConfig[key], val, `${ch.name}.${key} mismatch`);
          }
        }
      });
    }
  });

  describe('deploy multiple channels at once', () => {
    it('deploys telegram + discord + slack in one request', async () => {
      const channels = ['telegram', 'discord', 'slack'].map(name => ({
        name,
        fields: CHANNEL_FIXTURES[name],
      }));

      const result = await postRun(server.port, {
        authChoice: 'anthropic-api-key',
        authSecret: 'sk-test-key',
        channels,
      });

      assert.equal(result.success, true, `Multi-deploy failed: ${JSON.stringify(result.logs)}`);

      const config = readConfig(server.stateDir);

      for (const name of ['telegram', 'discord', 'slack']) {
        const channelConfig = config.channels?.[name];
        assert.ok(channelConfig, `channels.${name} missing after multi-deploy`);
        assert.equal(channelConfig.enabled, true);
        assert.equal(channelConfig.dmPolicy, 'open');
      }

      // Verify specific field values
      assert.equal(config.channels.telegram.botToken, CHANNEL_FIXTURES.telegram.botToken);
      assert.equal(config.channels.discord.token, CHANNEL_FIXTURES.discord.token);
      assert.equal(config.channels.slack.botToken, CHANNEL_FIXTURES.slack.botToken);
      assert.equal(config.channels.slack.appToken, CHANNEL_FIXTURES.slack.appToken);
    });
  });
});

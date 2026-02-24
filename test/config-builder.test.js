/**
 * Layer 2: Config generation tests for buildChannelConfig()
 *
 * Validates the pure function produces correct JSON for `openclaw config set`.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CHANNEL_GROUPS, buildChannelConfig } from '../src/channels.js';
import { CHANNEL_FIXTURES } from './helpers/fixtures.js';

describe('buildChannelConfig', () => {
  it('always sets enabled: true and dmPolicy: "open"', () => {
    const config = buildChannelConfig('telegram', { botToken: 'abc' });
    assert.equal(config.enabled, true);
    assert.equal(config.dmPolicy, 'open');
  });

  it('includes non-empty field values in config', () => {
    const config = buildChannelConfig('slack', { botToken: 'xoxb-1', appToken: 'xapp-2' });
    assert.equal(config.botToken, 'xoxb-1');
    assert.equal(config.appToken, 'xapp-2');
  });

  it('excludes empty string field values', () => {
    const config = buildChannelConfig('slack', { botToken: 'xoxb-1', appToken: '' });
    assert.equal(config.botToken, 'xoxb-1');
    assert.equal(config.appToken, undefined);
  });

  it('handles empty fields object (toggle-only channels)', () => {
    const config = buildChannelConfig('whatsapp', {});
    assert.deepEqual(config, { enabled: true, dmPolicy: 'open', allowFrom: ['*'] });
  });

  it('handles null/undefined fields', () => {
    const config1 = buildChannelConfig('signal', null);
    assert.deepEqual(config1, { enabled: true, dmPolicy: 'open', allowFrom: ['*'] });
    const config2 = buildChannelConfig('signal', undefined);
    assert.deepEqual(config2, { enabled: true, dmPolicy: 'open', allowFrom: ['*'] });
  });
});

describe('IRC channels array conversion', () => {
  it('converts comma-separated string to array', () => {
    const config = buildChannelConfig('irc', { channels: '#a, #b, #c' });
    assert.deepEqual(config.channels, ['#a', '#b', '#c']);
  });

  it('trims whitespace from each channel', () => {
    const config = buildChannelConfig('irc', { channels: '  #a  ,  #b  ' });
    assert.deepEqual(config.channels, ['#a', '#b']);
  });

  it('filters empty strings', () => {
    const config = buildChannelConfig('irc', { channels: '#a,,#b,' });
    assert.deepEqual(config.channels, ['#a', '#b']);
  });

  it('handles single channel without comma', () => {
    const config = buildChannelConfig('irc', { channels: '#only' });
    assert.deepEqual(config.channels, ['#only']);
  });

  it('does NOT convert channels for non-IRC channels', () => {
    // If someone passes a "channels" field for a non-IRC channel, it stays a string
    const config = buildChannelConfig('slack', { channels: '#general, #random' });
    assert.equal(config.channels, '#general, #random');
  });
});

describe('all 17 channels produce valid config', () => {
  for (const ch of CHANNEL_GROUPS) {
    it(`${ch.name}: has enabled, dmPolicy, and all fixture values`, () => {
      const fixture = CHANNEL_FIXTURES[ch.name];
      const config = buildChannelConfig(ch.name, fixture);

      assert.equal(config.enabled, true);
      assert.equal(config.dmPolicy, 'open');

      // All non-empty fixture values should be in the config
      for (const [key, val] of Object.entries(fixture || {})) {
        if (val) {
          assert.ok(
            config[key] !== undefined,
            `${ch.name} config missing fixture key "${key}"`
          );
        }
      }

      // IRC special: channels should be an array
      if (ch.name === 'irc' && fixture.channels) {
        assert.ok(Array.isArray(config.channels), 'IRC channels should be an array');
      }
    });
  }
});

/**
 * Layer 1: Data integrity tests for CHANNEL_GROUPS
 *
 * Validates structure, categories, required fields, and field IDs
 * without starting the HTTP server.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CHANNEL_GROUPS } from '../src/channels.js';
import { CHANNEL_FIXTURES } from './helpers/fixtures.js';

const REQUIRED_KEYS = ['name', 'displayName', 'category', 'fields', 'helpUrl'];
const EXPECTED_POPULAR = ['telegram', 'discord', 'slack', 'whatsapp', 'signal'];

describe('CHANNEL_GROUPS data integrity', () => {
  it('contains exactly 17 channels', () => {
    assert.equal(CHANNEL_GROUPS.length, 17);
  });

  it('every channel has required fields: name, displayName, category, fields, helpUrl', () => {
    for (const ch of CHANNEL_GROUPS) {
      for (const key of REQUIRED_KEYS) {
        assert.ok(
          ch[key] !== undefined && ch[key] !== null,
          `${ch.name || 'unknown'} is missing required key "${key}"`
        );
      }
    }
  });

  it('only uses categories "popular" and "more"', () => {
    const categories = new Set(CHANNEL_GROUPS.map(ch => ch.category));
    assert.deepEqual(categories, new Set(['popular', 'more']));
  });

  it('no channel has a "plugin" field', () => {
    for (const ch of CHANNEL_GROUPS) {
      assert.equal(ch.plugin, undefined, `${ch.name} has a stale "plugin" field`);
    }
  });

  it('all channel names are unique', () => {
    const names = CHANNEL_GROUPS.map(ch => ch.name);
    assert.equal(names.length, new Set(names).size, 'Duplicate channel names found');
  });
});

describe('category assignments', () => {
  it('popular = telegram, discord, slack, whatsapp, signal', () => {
    const popular = CHANNEL_GROUPS
      .filter(ch => ch.category === 'popular')
      .map(ch => ch.name);
    assert.deepEqual(popular, EXPECTED_POPULAR);
  });

  it('more = remaining 12 channels', () => {
    const more = CHANNEL_GROUPS.filter(ch => ch.category === 'more');
    assert.equal(more.length, 12);
  });
});

describe('field IDs match documented config keys', () => {
  it('discord uses field id "token" (not "botToken")', () => {
    const discord = CHANNEL_GROUPS.find(ch => ch.name === 'discord');
    const ids = discord.fields.map(f => f.id);
    assert.ok(ids.includes('token'), 'discord should have field "token"');
    assert.ok(!ids.includes('botToken'), 'discord should NOT have field "botToken"');
  });

  it('telegram has field "botToken"', () => {
    const ch = CHANNEL_GROUPS.find(c => c.name === 'telegram');
    assert.deepEqual(ch.fields.map(f => f.id), ['botToken']);
  });

  it('slack has fields "botToken" and "appToken"', () => {
    const ch = CHANNEL_GROUPS.find(c => c.name === 'slack');
    assert.deepEqual(ch.fields.map(f => f.id), ['botToken', 'appToken']);
  });

  it('irc has fields "host", "port", "nick", "channels"', () => {
    const ch = CHANNEL_GROUPS.find(c => c.name === 'irc');
    assert.deepEqual(ch.fields.map(f => f.id), ['host', 'port', 'nick', 'channels']);
  });

  it('matrix has fields "homeserver", "accessToken"', () => {
    const ch = CHANNEL_GROUPS.find(c => c.name === 'matrix');
    assert.deepEqual(ch.fields.map(f => f.id), ['homeserver', 'accessToken']);
  });

  it('msteams has fields "appId", "appPassword", "tenantId"', () => {
    const ch = CHANNEL_GROUPS.find(c => c.name === 'msteams');
    assert.deepEqual(ch.fields.map(f => f.id), ['appId', 'appPassword', 'tenantId']);
  });

  it('twitch has fields "username", "accessToken", "clientId", "channel"', () => {
    const ch = CHANNEL_GROUPS.find(c => c.name === 'twitch');
    assert.deepEqual(ch.fields.map(f => f.id), ['username', 'accessToken', 'clientId', 'channel']);
  });

  it('tlon has fields "ship", "url", "code"', () => {
    const ch = CHANNEL_GROUPS.find(c => c.name === 'tlon');
    assert.deepEqual(ch.fields.map(f => f.id), ['ship', 'url', 'code']);
  });

  it('nostr has field "privateKey"', () => {
    const ch = CHANNEL_GROUPS.find(c => c.name === 'nostr');
    assert.deepEqual(ch.fields.map(f => f.id), ['privateKey']);
  });

  it('nextcloud-talk has fields "baseUrl", "botSecret"', () => {
    const ch = CHANNEL_GROUPS.find(c => c.name === 'nextcloud-talk');
    assert.deepEqual(ch.fields.map(f => f.id), ['baseUrl', 'botSecret']);
  });

  it('whatsapp, signal, googlechat have empty fields[]', () => {
    for (const name of ['whatsapp', 'signal', 'googlechat']) {
      const ch = CHANNEL_GROUPS.find(c => c.name === name);
      assert.deepEqual(ch.fields, [], `${name} should have empty fields`);
    }
  });

  it('fixture keys match field IDs for every channel', () => {
    for (const ch of CHANNEL_GROUPS) {
      const fieldIds = ch.fields.map(f => f.id).sort();
      const fixtureKeys = Object.keys(CHANNEL_FIXTURES[ch.name] || {}).sort();
      assert.deepEqual(
        fixtureKeys, fieldIds,
        `Fixture keys for ${ch.name} (${fixtureKeys}) don't match field IDs (${fieldIds})`
      );
    }
  });
});

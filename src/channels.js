/**
 * Channel definitions and config-building logic for OpenClaw Onboarding Wizard
 *
 * Extracted from server.js so tests can import without starting the HTTP listener.
 */

import { siTelegram, siDiscord, siWhatsapp, siSignal, siMatrix, siMattermost, siGooglechat, siNextcloud, siZalo, siLine, siTwitch } from 'simple-icons';

// Custom SVG paths for channels not in simple-icons (viewBox 0 0 24 24)
const CUSTOM_CHANNEL_ICONS = {
  'slack': {
    svg: 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.27 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.163 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.163 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.163 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.27a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.163a2.528 2.528 0 0 1-2.522 2.523h-6.315z',
    color: '#4A154B'
  },
  'irc': {
    svg: 'M4 4h16v2H4V4zm0 4h12v2H4V8zm0 4h16v2H4v-2zm0 4h10v2H4v-2zm0 4h14v2H4v-2z',
    color: '#6B7280'
  },
  'nostr': {
    svg: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z',
    color: '#8B5CF6'
  },
  'msteams': {
    svg: 'M19.19 8.77q-.46 0-.87.13a3.27 3.27 0 0 0-1.1-1.6 3.13 3.13 0 0 0-1.9-.65h-5.2a3.14 3.14 0 0 0-3.14 3.14v4.48a3.14 3.14 0 0 0 2.61 3.09v1.92a1.7 1.7 0 0 0 .85 1.47 1.71 1.71 0 0 0 1.7 0l3.48-2.01a3.12 3.12 0 0 0 1.2-1.19q.23.02.46.02a3.35 3.35 0 0 0 0-6.7zM8.43 5.73A2.14 2.14 0 1 0 8.43 1.5a2.14 2.14 0 0 0 0 4.24zm6.9-.24a2.66 2.66 0 1 0 0-5.33 2.66 2.66 0 0 0 0 5.33z',
    color: '#6264A7'
  },
  'tlon': {
    svg: 'M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.82 7.5 12 10.82 5.18 7.5 12 4.18zM5 9.24l6 3.33v6.19L5 15.43V9.24zm14 0v6.19l-6 3.33v-6.19l6-3.33z',
    color: '#000000'
  },
  'feishu': {
    svg: 'M14.38 3.51L8.66 8.33l8.44 4.32c.25.13.4.38.4.66v.04c0 .28-.16.54-.42.66l-3.2 1.55 6.12.77V5.28c0-.62-.37-1.18-.94-1.43l-4.68-2.34zm-5.72 5.82l-4.44 3.56a1.6 1.6 0 0 0-.58 1.23v5.63c0 .62.37 1.17.94 1.42l4.54 2.27c.72.36 1.57-.09 1.66-.88l.96-8.48-3.08-4.75zm4.44 8.5l3.2-1.55-3.2-.4v1.95z',
    color: '#3370FF'
  }
};

// Map channel config keys to simple-icons objects
const CHANNEL_ICON_MAP = {
  'telegram': siTelegram,
  'discord': siDiscord,
  'whatsapp': siWhatsapp,
  'signal': siSignal,
  'matrix': siMatrix,
  'mattermost': siMattermost,
  'googlechat': siGooglechat,
  'nextcloud-talk': siNextcloud,
  'zalo': siZalo,
  'line': siLine,
  'twitch': siTwitch
};

/**
 * Look up icon data for a channel by config key
 * @param {string} name - Channel config key
 * @returns {{ svg: string, color: string } | null}
 */
export function getChannelIcon(name) {
  const si = CHANNEL_ICON_MAP[name];
  if (si) return { svg: si.path, color: '#' + si.hex };
  const custom = CUSTOM_CHANNEL_ICONS[name];
  if (custom) return { svg: custom.svg, color: custom.color };
  return null;
}

// Channel groups for the setup wizard (17 total)
export const CHANNEL_GROUPS = [
  // === Popular ===
  {
    name: 'telegram', displayName: 'Telegram', description: 'Most popular bot platform',
    category: 'popular', emoji: '\u2708\uFE0F', icon: null,
    fields: [
      { id: 'botToken', label: 'Bot Token', placeholder: '123456:ABC-DEF...', type: 'password' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/telegram',
    helpText: { text: 'Get a token from', linkText: '@BotFather', linkUrl: 'https://t.me/BotFather' },
    note: null
  },
  {
    name: 'discord', displayName: 'Discord', description: 'Gaming & community servers',
    category: 'popular', emoji: '\uD83C\uDFAE', icon: null,
    fields: [
      { id: 'token', label: 'Bot Token', placeholder: 'MTIz...', type: 'password' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/discord',
    helpText: { text: 'Create a bot at', linkText: 'Developer Portal', linkUrl: 'https://discord.com/developers/applications' },
    note: null
  },
  {
    name: 'slack', displayName: 'Slack', description: 'Workspace messaging',
    category: 'popular', emoji: '\uD83D\uDCBC', icon: null,
    fields: [
      { id: 'botToken', label: 'Bot Token', placeholder: 'xoxb-...', type: 'password' },
      { id: 'appToken', label: 'App Token', placeholder: 'xapp-...', type: 'password' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/slack',
    helpText: { text: 'Create an app at', linkText: 'api.slack.com/apps', linkUrl: 'https://api.slack.com/apps' },
    note: null
  },
  {
    name: 'whatsapp', displayName: 'WhatsApp', description: 'End-to-end encrypted messaging',
    category: 'popular', emoji: '\uD83D\uDCAC', icon: null,
    fields: [],
    helpUrl: 'https://docs.openclaw.ai/channels/whatsapp',
    helpText: null,
    note: 'After deploy, link your phone via Terminal: openclaw channels login'
  },
  {
    name: 'signal', displayName: 'Signal', description: 'Privacy-focused messaging',
    category: 'popular', emoji: '\uD83D\uDD12', icon: null,
    fields: [],
    helpUrl: 'https://docs.openclaw.ai/channels/signal',
    helpText: null,
    note: 'After deploy, link your phone via Terminal: signal-cli link -n "OpenClaw"'
  },
  // === More Channels ===
  {
    name: 'irc', displayName: 'IRC', description: 'Classic Internet Relay Chat',
    category: 'more', emoji: '\uD83D\uDCBB', icon: null,
    fields: [
      { id: 'host', label: 'Server', placeholder: 'irc.libera.chat', type: 'text' },
      { id: 'port', label: 'Port', placeholder: '6697', type: 'text' },
      { id: 'nick', label: 'Nickname', placeholder: 'openclaw', type: 'text' },
      { id: 'channels', label: 'Channels', placeholder: '#channel1, #channel2', type: 'text' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/irc',
    helpText: null,
    note: null
  },
  {
    name: 'zalo', displayName: 'Zalo', description: 'Popular in Vietnam',
    category: 'more', emoji: '\uD83D\uDCF1', icon: null, requiresPlugin: '@openclaw/zalo',
    fields: [
      { id: 'botToken', label: 'Bot Token', placeholder: 'Zalo OA token...', type: 'password' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/zalo',
    helpText: null,
    note: null
  },
  {
    name: 'mattermost', displayName: 'Mattermost', description: 'Open-source team messaging',
    category: 'more', emoji: '\uD83D\uDCAC', icon: null, requiresPlugin: '@openclaw/mattermost',
    fields: [
      { id: 'botToken', label: 'Bot Token', placeholder: 'Mattermost bot token...', type: 'password' },
      { id: 'baseUrl', label: 'Server URL', placeholder: 'https://mattermost.example.com', type: 'text' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/mattermost',
    helpText: null,
    note: null
  },
  {
    name: 'matrix', displayName: 'Matrix', description: 'Decentralized secure chat',
    category: 'more', emoji: '\uD83C\uDF10', icon: null,
    fields: [
      { id: 'homeserver', label: 'Homeserver URL', placeholder: 'https://matrix.org', type: 'text' },
      { id: 'accessToken', label: 'Access Token', placeholder: 'syt_...', type: 'password' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/matrix',
    helpText: null,
    note: null
  },
  {
    name: 'line', displayName: 'LINE', description: 'Popular in Japan & SE Asia',
    category: 'more', emoji: '\uD83D\uDFE2', icon: null, requiresPlugin: '@openclaw/line',
    fields: [
      { id: 'channelAccessToken', label: 'Channel Access Token', placeholder: 'LINE channel access token...', type: 'password' },
      { id: 'channelSecret', label: 'Channel Secret', placeholder: 'LINE channel secret...', type: 'password' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/line',
    helpText: null,
    note: null
  },
  {
    name: 'feishu', displayName: 'Feishu / Lark', description: 'ByteDance workspace',
    category: 'more', emoji: '\uD83D\uDC26', icon: null, requiresPlugin: '@openclaw/feishu',
    fields: [
      { id: 'appId', label: 'App ID', placeholder: 'Feishu app ID...', type: 'text' },
      { id: 'appSecret', label: 'App Secret', placeholder: 'Feishu app secret...', type: 'password' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/feishu',
    helpText: null,
    note: null
  },
  {
    name: 'nostr', displayName: 'Nostr', description: 'Decentralized social protocol',
    category: 'more', emoji: '\uD83D\uDD11', icon: null,
    fields: [
      { id: 'privateKey', label: 'Private Key', placeholder: 'nsec1... or hex', type: 'password' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/nostr',
    helpText: null,
    note: null
  },
  {
    name: 'nextcloud-talk', displayName: 'Nextcloud Talk', description: 'Self-hosted team chat',
    category: 'more', emoji: '\u2601\uFE0F', icon: null, requiresPlugin: '@openclaw/nextcloud-talk',
    fields: [
      { id: 'baseUrl', label: 'Server URL', placeholder: 'https://cloud.example.com', type: 'text' },
      { id: 'botSecret', label: 'Bot Secret', placeholder: 'Shared secret from Nextcloud', type: 'password' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/nextcloud-talk',
    helpText: null,
    note: null
  },
  {
    name: 'twitch', displayName: 'Twitch', description: 'Live streaming chat',
    category: 'more', emoji: '\uD83C\uDFAE', icon: null,
    fields: [
      { id: 'username', label: 'Bot Username', placeholder: 'your_bot_name', type: 'text' },
      { id: 'accessToken', label: 'OAuth Token', placeholder: 'oauth:...', type: 'password' },
      { id: 'clientId', label: 'Client ID', placeholder: 'Twitch app client ID', type: 'text' },
      { id: 'channel', label: 'Channel', placeholder: '#your_channel', type: 'text' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/twitch',
    helpText: null,
    note: null
  },
  {
    name: 'tlon', displayName: 'Tlon', description: 'Urbit-based messaging',
    category: 'more', emoji: '\u2699\uFE0F', icon: null,
    fields: [
      { id: 'ship', label: 'Ship', placeholder: '~sampel-palnet', type: 'text' },
      { id: 'url', label: 'Ship URL', placeholder: 'http://localhost:8080', type: 'text' },
      { id: 'code', label: 'Access Code', placeholder: '+code from ship', type: 'password' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/tlon',
    helpText: null,
    note: null
  },
  {
    name: 'googlechat', displayName: 'Google Chat', description: 'Google Workspace chat',
    category: 'more', emoji: '\uD83D\uDDE8\uFE0F', icon: null,
    fields: [],
    helpUrl: 'https://docs.openclaw.ai/channels/googlechat',
    helpText: null,
    note: 'Requires Google Cloud service account JSON. Configure via Terminal or Lite Panel after deploy.'
  },
  {
    name: 'msteams', displayName: 'MS Teams', description: 'Microsoft 365 messaging',
    category: 'more', emoji: '\uD83D\uDCE3', icon: null,
    fields: [
      { id: 'appId', label: 'App ID', placeholder: 'Azure Bot app ID', type: 'text' },
      { id: 'appPassword', label: 'App Password', placeholder: 'Azure Bot client secret', type: 'password' },
      { id: 'tenantId', label: 'Tenant ID', placeholder: 'Azure AD tenant ID', type: 'text' }
    ],
    helpUrl: 'https://docs.openclaw.ai/channels/msteams',
    helpText: null,
    note: 'Requires Azure Bot registration first. See docs.'
  }
];

// Enrich each channel group with SVG icon data
for (const ch of CHANNEL_GROUPS) {
  ch.icon = getChannelIcon(ch.name);
}

/**
 * Look up the required plugin package for a channel (if any)
 * @param {string} channelName - Channel config key (e.g. 'zalo', 'line')
 * @returns {string|null} Plugin package name or null
 */
export function getRequiredPlugin(channelName) {
  const ch = CHANNEL_GROUPS.find(c => c.name === channelName);
  return ch?.requiresPlugin || null;
}

/**
 * Build the config object for a single channel, suitable for `openclaw config set --json`.
 *
 * @param {string} channelName - Channel config key (e.g. 'telegram', 'irc')
 * @param {Object} fields - Key/value pairs from the setup form
 * @returns {Object} Config object with enabled, dmPolicy, and field values
 */
export function buildChannelConfig(channelName, fields) {
  const config = { enabled: true, dmPolicy: 'open', allowFrom: ['*'] };
  for (const [key, val] of Object.entries(fields || {})) {
    if (val === '' || val == null) continue;
    // Coerce boolean-like strings from form inputs
    if (val === 'true') { config[key] = true; continue; }
    if (val === 'false') { config[key] = false; continue; }
    config[key] = val;
  }
  // IRC channels field: comma-separated string -> array
  if (channelName === 'irc' && config.channels && typeof config.channels === 'string') {
    config.channels = config.channels.split(',').map(s => s.trim()).filter(Boolean);
  }
  return config;
}

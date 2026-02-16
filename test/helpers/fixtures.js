/**
 * Sample field values for all 17 channels.
 * Keys match the field `id` values in CHANNEL_GROUPS.
 */
export const CHANNEL_FIXTURES = {
  telegram:         { botToken: '123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11' },
  discord:          { token: 'MTIzNDU2Nzg5MDEyMzQ1Njc4.ABCDEF.abcdef' },
  slack:            { botToken: 'xoxb-test-token', appToken: 'xapp-test-token' },
  whatsapp:         {},
  signal:           {},
  irc:              { host: 'irc.libera.chat', port: '6697', nick: 'testbot', channels: '#test1, #test2' },
  zalo:             { botToken: 'zalo-test-token' },
  mattermost:       { botToken: 'mm-test-token', baseUrl: 'https://mm.example.com' },
  matrix:           { homeserver: 'https://matrix.org', accessToken: 'syt_test' },
  line:             { channelAccessToken: 'line-token', channelSecret: 'line-secret' },
  feishu:           { appId: 'feishu-app-id', appSecret: 'feishu-secret' },
  nostr:            { privateKey: 'nsec1testkey' },
  'nextcloud-talk': { baseUrl: 'https://cloud.example.com', botSecret: 'nc-secret' },
  twitch:           { username: 'testbot', accessToken: 'oauth:test', clientId: 'twitch-id', channel: '#test' },
  tlon:             { ship: '~sampel-palnet', url: 'http://localhost:8080', code: '+code123' },
  googlechat:       {},
  msteams:          { appId: 'azure-app-id', appPassword: 'azure-secret', tenantId: 'azure-tenant' },
};

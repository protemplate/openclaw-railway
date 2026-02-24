/**
 * UI metadata for schema-driven form generation
 *
 * Provides labels, help text, grouping, widget hints, and display order
 * for each config section. This drives the tabbed config editor in /lite.
 */

/**
 * Section metadata for the tabbed editor.
 * Order determines tab display order.
 */
export const SECTION_META = [
  {
    id: 'agents',
    label: 'Agents',
    icon: '&#x1F916;',
    description: 'Model selection, persona, and agent behavior defaults'
  },
  {
    id: 'channels',
    label: 'Channels',
    icon: '&#x1F4AC;',
    description: 'Messaging platform connections'
  },
  {
    id: 'gateway',
    label: 'Gateway',
    icon: '&#x1F310;',
    description: 'HTTP server, auth, and TLS settings'
  },
  {
    id: 'tools',
    label: 'Tools',
    icon: '&#x1F527;',
    description: 'Tool permissions, execution, and sandboxing'
  },
  {
    id: 'session',
    label: 'Session',
    icon: '&#x1F4CB;',
    description: 'Conversation scope and reset behavior'
  },
  {
    id: 'skills',
    label: 'Skills',
    icon: '&#x2B50;',
    description: 'Bundled and installed skill packs'
  },
  {
    id: 'auth',
    label: 'Auth',
    icon: '&#x1F511;',
    description: 'API key profiles and providers'
  },
  {
    id: 'memory',
    label: 'Memory',
    icon: '&#x1F9E0;',
    description: 'Agent memory backend settings'
  }
];

/**
 * Per-field UI hints.
 * Keys are dot-path field references (e.g. "agents.defaults.model.primary").
 * Values provide widget type, label overrides, help text, etc.
 */
export const FIELD_META = {
  // Agents
  'agents.defaults.model.primary': {
    label: 'Primary Model',
    help: 'Model identifier like anthropic/claude-sonnet-4 or openai/gpt-4o',
    widget: 'text',
    placeholder: 'anthropic/claude-sonnet-4'
  },
  'agents.defaults.model.fallbacks': {
    label: 'Fallback Models',
    help: 'Comma-separated list of fallback model identifiers',
    widget: 'tags'
  },
  'agents.defaults.maxTokens': {
    label: 'Max Tokens',
    help: 'Maximum tokens per response',
    widget: 'number'
  },
  'agents.defaults.temperature': {
    label: 'Temperature',
    help: 'Sampling temperature (0-2)',
    widget: 'number'
  },

  // Gateway
  'gateway.port': {
    label: 'Port',
    help: 'Managed by wrapper — do not change',
    widget: 'number',
    readonly: true
  },
  'gateway.auth.mode': {
    label: 'Auth Mode',
    widget: 'select',
    options: ['none', 'token', 'basic']
  },
  'gateway.auth.token': {
    label: 'Auth Token',
    widget: 'password',
    sensitive: true
  },

  // Tools
  'tools.allow': {
    label: 'Allowed Tools',
    help: 'Tool names or glob patterns to allow',
    widget: 'tags'
  },
  'tools.deny': {
    label: 'Denied Tools',
    help: 'Tool names or glob patterns to deny',
    widget: 'tags'
  },
  'tools.exec.timeoutSec': {
    label: 'Exec Timeout (sec)',
    help: 'Maximum seconds for shell command execution',
    widget: 'number'
  },

  // Session
  'session.scope': {
    label: 'Scope',
    widget: 'select',
    options: ['user', 'channel', 'global']
  },
  'session.reset.enabled': {
    label: 'Auto-reset',
    widget: 'toggle'
  },
  'session.reset.afterMinutes': {
    label: 'Reset After (minutes)',
    widget: 'number'
  },

  // Memory
  'memory.backend': {
    label: 'Backend',
    widget: 'select',
    options: ['builtin', 'qdrant']
  }
};

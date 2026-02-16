/**
 * Config migration logic for OpenClaw
 *
 * Handles transforming legacy config shapes into the current schema.
 * Migrations are idempotent — running on an already-migrated config is a no-op.
 *
 * Based on OpenClaw's legacy.migrations.part-2.ts and part-3.ts:
 *   agent.model (string)       → agents.defaults.model.primary
 *   agent.model (object)       → merge into agents.defaults.model
 *   agent.modelFallbacks       → agents.defaults.model.fallbacks
 *   agent.imageModel           → agents.defaults.imageModel.primary
 *   agent.tools.allow/deny     → tools.allow/deny
 *   agent.elevated             → tools.elevated
 *   agent.bash                 → tools.exec
 *   agent.sandbox.tools        → tools.sandbox.tools
 *   agent.subagents.tools      → tools.subagents.tools
 *   Remaining agent.*          → agents.defaults.*
 */

/**
 * Migrate a config object from legacy format to current format (in-place).
 * Returns true if any migrations were applied, false otherwise.
 *
 * @param {Object} config - Config object (mutated in place)
 * @returns {{ migrated: boolean, changes: string[] }}
 */
export function migrateConfig(config) {
  const changes = [];

  if (!config || typeof config !== 'object') {
    return { migrated: false, changes };
  }

  // Legacy: agent.* → agents.defaults.* + tools.*
  if (config.agent) {
    config.agents = config.agents || {};
    config.agents.defaults = config.agents.defaults || {};
    config.tools = config.tools || {};

    const agent = config.agent;

    // agent.model → agents.defaults.model
    if (agent.model !== undefined) {
      config.agents.defaults.model = config.agents.defaults.model || {};
      if (typeof agent.model === 'string') {
        config.agents.defaults.model.primary = agent.model;
        changes.push('agent.model (string) → agents.defaults.model.primary');
      } else if (typeof agent.model === 'object' && agent.model !== null) {
        Object.assign(config.agents.defaults.model, agent.model);
        changes.push('agent.model (object) → agents.defaults.model');
      }
      delete agent.model;
    }

    // agent.modelFallbacks → agents.defaults.model.fallbacks
    if (agent.modelFallbacks !== undefined) {
      config.agents.defaults.model = config.agents.defaults.model || {};
      config.agents.defaults.model.fallbacks = agent.modelFallbacks;
      changes.push('agent.modelFallbacks → agents.defaults.model.fallbacks');
      delete agent.modelFallbacks;
    }

    // agent.imageModel → agents.defaults.imageModel
    if (agent.imageModel !== undefined) {
      if (typeof agent.imageModel === 'string') {
        config.agents.defaults.imageModel = { primary: agent.imageModel };
        changes.push('agent.imageModel (string) → agents.defaults.imageModel.primary');
      } else {
        config.agents.defaults.imageModel = agent.imageModel;
        changes.push('agent.imageModel (object) → agents.defaults.imageModel');
      }
      delete agent.imageModel;
    }

    // agent.tools.allow/deny → tools.allow/deny
    if (agent.tools) {
      if (agent.tools.allow !== undefined) {
        config.tools.allow = agent.tools.allow;
        changes.push('agent.tools.allow → tools.allow');
      }
      if (agent.tools.deny !== undefined) {
        config.tools.deny = agent.tools.deny;
        changes.push('agent.tools.deny → tools.deny');
      }
      delete agent.tools;
    }

    // agent.elevated → tools.elevated
    if (agent.elevated !== undefined) {
      config.tools.elevated = agent.elevated;
      changes.push('agent.elevated → tools.elevated');
      delete agent.elevated;
    }

    // agent.bash → tools.exec
    if (agent.bash !== undefined) {
      config.tools.exec = agent.bash;
      changes.push('agent.bash → tools.exec');
      delete agent.bash;
    }

    // agent.sandbox.tools → tools.sandbox.tools
    if (agent.sandbox?.tools !== undefined) {
      config.tools.sandbox = config.tools.sandbox || {};
      config.tools.sandbox.tools = agent.sandbox.tools;
      changes.push('agent.sandbox.tools → tools.sandbox.tools');
      delete agent.sandbox.tools;
      // Move remaining sandbox keys to agents.defaults.sandbox
      if (Object.keys(agent.sandbox).length > 0) {
        config.agents.defaults.sandbox = config.agents.defaults.sandbox || {};
        Object.assign(config.agents.defaults.sandbox, agent.sandbox);
      }
      delete agent.sandbox;
    }

    // agent.subagents.tools → tools.subagents.tools
    if (agent.subagents?.tools !== undefined) {
      config.tools.subagents = config.tools.subagents || {};
      config.tools.subagents.tools = agent.subagents.tools;
      changes.push('agent.subagents.tools → tools.subagents.tools');
      delete agent.subagents.tools;
      if (Object.keys(agent.subagents).length > 0) {
        config.agents.defaults.subagents = config.agents.defaults.subagents || {};
        Object.assign(config.agents.defaults.subagents, agent.subagents);
      }
      delete agent.subagents;
    }

    // Move all remaining agent.* keys to agents.defaults.*
    for (const [key, value] of Object.entries(agent)) {
      config.agents.defaults[key] = value;
      changes.push(`agent.${key} → agents.defaults.${key}`);
    }

    delete config.agent;

    // Clean up empty tools object if nothing was migrated into it
    if (Object.keys(config.tools).length === 0) {
      delete config.tools;
    }
  }

  // Legacy: gateway.token → gateway.auth.token (already handled in gateway.js, but be safe)
  if (config.gateway?.token && !config.gateway?.auth) {
    config.gateway.auth = { mode: 'token', token: config.gateway.token };
    delete config.gateway.token;
    changes.push('gateway.token → gateway.auth');
  }

  return { migrated: changes.length > 0, changes };
}

/**
 * Get the default minimal config for a new installation
 * @param {number} port - Gateway port
 * @returns {Object} Minimal valid config
 */
export function getDefaultConfig(port) {
  return {
    agents: {
      defaults: {
        model: {
          primary: 'anthropic/claude-sonnet-4'
        }
      }
    },
    gateway: {
      port: parseInt(port, 10) || 18789
    }
  };
}

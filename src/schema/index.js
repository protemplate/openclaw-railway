/**
 * Schema registry for OpenClaw configuration
 *
 * Loads all section schemas, registers them with Ajv, and exports
 * a ready-to-use validator plus the raw schemas for the client-side UI.
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createValidator, validateConfig, validateSection } from './validate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SECTIONS_DIR = join(__dirname, 'sections');

// Section schema file names (order doesn't matter for Ajv, but list them explicitly)
const SECTION_FILES = [
  'agents.schema.json',
  'channels.schema.json',
  'gateway.schema.json',
  'tools.schema.json',
  'auth.schema.json',
  'session.schema.json',
  'models.schema.json',
  'memory.schema.json',
  'skills.schema.json',
  'hooks.schema.json',
  'cron.schema.json',
  'misc.schema.json',
  'root.schema.json'   // must be last (references the others)
];

/**
 * Load all section schemas from disk
 * @returns {Object[]} Array of parsed JSON Schema objects
 */
function loadSchemas() {
  return SECTION_FILES.map(file =>
    JSON.parse(readFileSync(join(SECTIONS_DIR, file), 'utf-8'))
  );
}

// Load schemas eagerly at module init
const schemas = loadSchemas();

// Create the Ajv validator with all schemas registered
const ajv = createValidator(schemas);

/**
 * Validate a full config object
 * @param {Object} config
 * @returns {{ valid: boolean, errors: Object[]|null }}
 */
export function validate(config) {
  return validateConfig(ajv, config);
}

/**
 * Validate a single section of the config
 * @param {string} section - Section name (e.g. 'agents', 'gateway')
 * @param {Object} data - Section data
 * @returns {{ valid: boolean, errors: Object[]|null }}
 */
export function validateOne(section, data) {
  return validateSection(ajv, section, data);
}

/**
 * Get all schemas as a plain object keyed by $id (for serving to client)
 * @returns {Object} Map of schema $id → schema object
 */
export function getAllSchemas() {
  const map = {};
  for (const schema of schemas) {
    map[schema.$id] = schema;
  }
  return map;
}

/**
 * Get the list of section names (excluding root and misc)
 * @returns {string[]}
 */
export function getSectionNames() {
  return schemas
    .filter(s => s.$id !== 'openclaw-config' && s.$id !== 'misc')
    .map(s => s.$id);
}

// Re-export migration utilities
export { migrateConfig, getDefaultConfig } from './migrate.js';

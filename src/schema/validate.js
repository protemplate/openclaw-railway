/**
 * Ajv wrapper for OpenClaw config validation
 *
 * Works server-side (Node.js) with the ajv npm package.
 * Client-side validation uses the same schemas via GET /api/schemas + CDN Ajv.
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Create and configure an Ajv validator instance
 * @param {Object[]} schemas - Array of JSON Schema objects to register
 * @returns {Ajv} Configured Ajv instance
 */
export function createValidator(schemas) {
  const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,           // permissive — don't choke on unknown keywords
    validateFormats: true
  });
  addFormats(ajv);

  // Register each section schema
  for (const schema of schemas) {
    ajv.addSchema(schema);
  }

  return ajv;
}

/**
 * Validate a full OpenClaw config against the root schema
 * @param {Ajv} ajv - Configured Ajv instance
 * @param {Object} config - Config object to validate
 * @returns {{ valid: boolean, errors: Object[]|null }}
 */
export function validateConfig(ajv, config) {
  const valid = ajv.validate('openclaw-config', config);
  return {
    valid,
    errors: valid ? null : formatErrors(ajv.errors)
  };
}

/**
 * Validate a single config section
 * @param {Ajv} ajv - Configured Ajv instance
 * @param {string} sectionId - Schema $id (e.g. 'agents', 'channels')
 * @param {Object} data - Section data to validate
 * @returns {{ valid: boolean, errors: Object[]|null }}
 */
export function validateSection(ajv, sectionId, data) {
  const validate = ajv.getSchema(sectionId);
  if (!validate) {
    return { valid: false, errors: [{ path: '', message: `Unknown section: ${sectionId}` }] };
  }
  const valid = validate(data);
  return {
    valid,
    errors: valid ? null : formatErrors(validate.errors)
  };
}

/**
 * Format Ajv errors into a simpler structure for API responses
 * @param {Object[]} errors - Ajv error objects
 * @returns {Object[]} Formatted error objects
 */
function formatErrors(errors) {
  if (!errors) return null;
  return errors.map(err => ({
    path: err.instancePath || '',
    message: err.message || 'Validation error',
    keyword: err.keyword,
    params: err.params
  }));
}

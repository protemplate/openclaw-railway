/**
 * NaBoTo — append-only ingest for bot_observations (Postgres).
 *
 * Railway: link Postgres to the OpenClaw service so DATABASE_URL is set.
 * Set NABOTO_INGEST_SECRET to a long random value; send:
 *   POST /api/naboto/observations
 *   Authorization: Bearer <NABOTO_INGEST_SECRET>
 *   Content-Type: application/json
 *   { "source_group": "Guest Experience", "message_text": "...", "message_author": "+507..." }
 *
 * Optional: detected_type, linked_reservation_id, linked_guest_id, action_taken,
 *           confidence, requires_review (boolean).
 */

import pg from 'pg';

const { Pool } = pg;

const MAX_TEXT = 32000;

let pool = null;

function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }
  if (!pool) {
    pool = new Pool({
      connectionString: url,
      max: 5,
      connectionTimeoutMillis: 8000,
    });
  }
  return pool;
}

function authOk(req) {
  const secret = process.env.NABOTO_INGEST_SECRET;
  if (!secret) {
    return false;
  }
  const authHeader = req.headers.authorization || '';
  const [type, token] = authHeader.split(/\s+/);
  return type === 'Bearer' && token === secret;
}

/**
 * Express handler: POST JSON body → INSERT bot_observations
 */
export async function nabotoObservationsHandler(req, res) {
  if (req.method !== 'POST' && req.method !== undefined) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.NABOTO_INGEST_SECRET) {
    return res.status(503).json({
      error: 'NaBoTo ingest disabled',
      hint: 'Set NABOTO_INGEST_SECRET in Railway to enable POST /api/naboto/observations',
    });
  }

  if (!authOk(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const p = getPool();
  if (!p) {
    return res.status(503).json({
      error: 'DATABASE_URL not configured',
      hint: 'Link Postgres to this service on Railway',
    });
  }

  const body = req.body || {};
  const sourceGroup = typeof body.source_group === 'string' ? body.source_group.trim() : '';
  const messageText = typeof body.message_text === 'string' ? body.message_text : '';
  const messageAuthor = typeof body.message_author === 'string' ? body.message_author.trim() : null;

  if (!sourceGroup || !messageText.trim()) {
    return res.status(400).json({
      error: 'Invalid body',
      required: ['source_group', 'message_text'],
    });
  }

  if (messageText.length > MAX_TEXT) {
    return res.status(400).json({ error: `message_text exceeds ${MAX_TEXT} characters` });
  }

  const detectedType = typeof body.detected_type === 'string' ? body.detected_type.trim() : null;
  const actionTaken = typeof body.action_taken === 'string' ? body.action_taken.trim() : null;
  const linkedReservationId = typeof body.linked_reservation_id === 'string' ? body.linked_reservation_id.trim() : null;
  const linkedGuestId = typeof body.linked_guest_id === 'string' ? body.linked_guest_id.trim() : null;
  let confidence = null;
  if (body.confidence !== undefined && body.confidence !== null) {
    const n = Number(body.confidence);
    if (!Number.isNaN(n)) {
      confidence = n;
    }
  }
  const requiresReview = Boolean(body.requires_review);

  const sql = `
    INSERT INTO bot_observations (
      source_group, message_author, message_text, detected_type,
      linked_reservation_id, linked_guest_id, action_taken, confidence, requires_review
    ) VALUES (
      $1, $2, $3, $4,
      $5::uuid, $6::uuid, $7, $8, $9
    )
    RETURNING id, created_at
  `;

  const uuidOrNull = (v) => (v && /^[0-9a-f-]{36}$/i.test(v) ? v : null);

  try {
    const r = await p.query(sql, [
      sourceGroup,
      messageAuthor,
      messageText,
      detectedType,
      uuidOrNull(linkedReservationId),
      uuidOrNull(linkedGuestId),
      actionTaken,
      confidence,
      requiresReview,
    ]);
    const row = r.rows[0];
    return res.status(201).json({
      id: row.id,
      created_at: row.created_at,
    });
  } catch (e) {
    console.error('[naboto-observations]', e.message);
    return res.status(500).json({
      error: 'Insert failed',
      detail: process.env.NODE_ENV === 'production' ? undefined : e.message,
    });
  }
}

/**
 * Optional readiness: verifies DB connectivity (no auth).
 */
export async function nabotoDbHealthHandler(_req, res) {
  const p = getPool();
  if (!p) {
    return res.status(503).json({ ok: false, reason: 'no DATABASE_URL' });
  }
  try {
    await p.query('SELECT 1');
    return res.json({ ok: true, table: 'reachable' });
  } catch (e) {
    return res.status(503).json({ ok: false, reason: e.message });
  }
}

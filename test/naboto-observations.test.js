import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import { nabotoObservationsHandler } from '../src/naboto-observations.js';

function mockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(c) {
      this.statusCode = c;
      return this;
    },
    json(o) {
      this.body = o;
      return this;
    },
  };
  return res;
}

describe('nabotoObservationsHandler', () => {
  const prevSecret = process.env.NABOTO_INGEST_SECRET;
  const prevDb = process.env.DATABASE_URL;

  after(() => {
    if (prevSecret === undefined) {
      delete process.env.NABOTO_INGEST_SECRET;
    } else {
      process.env.NABOTO_INGEST_SECRET = prevSecret;
    }
    if (prevDb === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = prevDb;
    }
  });

  it('returns 503 when NABOTO_INGEST_SECRET is unset', async () => {
    delete process.env.NABOTO_INGEST_SECRET;
    process.env.DATABASE_URL = 'postgres://x:y@localhost:5432/db';
    const req = { headers: {}, body: {} };
    const res = mockRes();
    await nabotoObservationsHandler(req, res);
    assert.strictEqual(res.statusCode, 503);
    assert.match(res.body?.hint || '', /NABOTO_INGEST_SECRET/);
  });

  it('returns 401 when Bearer token wrong', async () => {
    process.env.NABOTO_INGEST_SECRET = 'correct';
    process.env.DATABASE_URL = 'postgres://x:y@localhost:5432/db';
    const req = { headers: { authorization: 'Bearer wrong' }, body: {} };
    const res = mockRes();
    await nabotoObservationsHandler(req, res);
    assert.strictEqual(res.statusCode, 401);
  });

  it('returns 400 when source_group or message_text missing', async () => {
    process.env.NABOTO_INGEST_SECRET = 'testsecret';
    process.env.DATABASE_URL = 'postgres://x:y@localhost:5432/db';
    const req = {
      headers: { authorization: 'Bearer testsecret' },
      body: { source_group: 'G' },
    };
    const res = mockRes();
    await nabotoObservationsHandler(req, res);
    assert.strictEqual(res.statusCode, 400);
  });
});

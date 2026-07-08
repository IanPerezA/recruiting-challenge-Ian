// HTTP contract test: drives the real Express app in-process and asserts that
// bad input is rejected at the gateway (400) before reaching the data layer.
if (!process.env.DB_PATH) process.env.DB_PATH = ':memory:';

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { sequelize, initDb } from '../src/db.js';
import { Merchant } from '../src/models/index.js';
import { createApp } from '../src/app.js';

describe('HTTP contract', () => {
  let server: Server;
  let base: string;

  before(async () => {
    await initDb();
    await Merchant.upsert({ id: 'm_http', name: 'HTTP' });
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    const port = (server.address() as AddressInfo).port;
    base = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    server.closeAllConnections?.();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await sequelize.close();
  });

  const authJson = { 'X-Merchant-Id': 'm_http', 'Content-Type': 'application/json' };
  const postOrder = (body: unknown): Promise<Response> =>
    fetch(`${base}/api/orders`, { method: 'POST', headers: authJson, body: JSON.stringify(body) });

  test('POST /api/orders rejects invalid payloads with 400', async () => {
    const badVectors = [
      { customer_email: 'a@b.com', total_amount: -5 },
      { customer_email: 'a@b.com', total_amount: 0 },
      { customer_email: 'a@b.com', total_amount: 3.5 },
      { customer_email: 'a@b.com', total_amount: 'lots' },
      { customer_email: 'a@b.com', total_amount: 100, type: 'gift' },
      { total_amount: 100 }, // missing email
    ];
    for (const body of badVectors) {
      const res = await postOrder(body);
      assert.equal(res.status, 400, `expected 400 for ${JSON.stringify(body)}`);
    }
  });

  test('POST /api/orders accepts a valid order with 201', async () => {
    const res = await postOrder({ customer_email: 'a@b.com', total_amount: 100, type: 'sale' });
    assert.equal(res.status, 201);
  });

  test('limit is validated at the boundary: invalid/over-cap → 400, valid → 200', async () => {
    const h = { 'X-Merchant-Id': 'm_http' };
    assert.equal((await fetch(`${base}/api/orders?limit=abc`, { headers: h })).status, 400);
    assert.equal((await fetch(`${base}/api/orders?limit=251`, { headers: h })).status, 400);
    assert.equal((await fetch(`${base}/api/orders?limit=10`, { headers: h })).status, 200);
  });

  test('GET /api/orders/search returns the paginated envelope', async () => {
    const h = { 'X-Merchant-Id': 'm_http' };
    const res = await fetch(`${base}/api/orders/search`, { headers: h });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { data: unknown[]; pagination: { total: number; limit: number; offset: number } };
    assert.ok(Array.isArray(body.data));
    assert.equal(typeof body.pagination.total, 'number');
    assert.equal(body.pagination.limit, 50);
    assert.equal(body.pagination.offset, 0);
  });

  test('GET /api/orders/search rejects invalid filter params with 400', async () => {
    const h = { 'X-Merchant-Id': 'm_http' };
    const badQueries = [
      'min_amount=50&max_amount=10', // inverted range
      'sort_by=id',                  // not in allowlist
      'order=up',                    // not in allowlist
      'type=gift',                   // not in allowlist
      'offset=-1',                   // negative
      'offset=abc',                  // NaN
      'limit=251',                   // over cap
      'from=20-01-01',               // bad date format
      'from=2026-02-10&to=2026-01-10', // inverted dates
      'customer_email=',             // empty filter
    ];
    for (const qs of badQueries) {
      const res = await fetch(`${base}/api/orders/search?${qs}`, { headers: h });
      assert.equal(res.status, 400, `expected 400 for ?${qs}`);
    }
  });

  test('GET /api/orders/search requires auth', async () => {
    assert.equal((await fetch(`${base}/api/orders/search`)).status, 401);
  });
});

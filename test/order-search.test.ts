// Repository-level tests for the order search feature: each filter narrows,
// pagination totals stay correct, sorting obeys the allowlist, and results are
// always tenant-scoped.
if (!process.env.DB_PATH) process.env.DB_PATH = ':memory:';

import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { sequelize, initDb } from '../src/db.js';
import { Merchant, Order } from '../src/models/index.js';
import { ordersRepository } from '../src/repositories/orders-repository.js';
import type { OrderSearchFilters } from '../src/models/order-search.js';

/** Search with resolved defaults, overridable per call. */
function filters(overrides: Partial<OrderSearchFilters> = {}): OrderSearchFilters {
  return { sort_by: 'created_at', order: 'desc', limit: 50, offset: 0, ...overrides };
}

describe('orders repository: search', () => {
  before(async () => {
    await initDb();
    await Merchant.upsert({ id: 'm_search', name: 'Search' });
    await Merchant.upsert({ id: 'm_other', name: 'Other' });

    const rows = [
      { id: 's1', customer_email: 'ana@example.com', total_amount: 1000, type: 'sale', status: 'completed', created_at: '2026-01-10T10:00:00.000Z' },
      { id: 's2', customer_email: 'ana@example.com', total_amount: 3000, type: 'refund', status: 'completed', created_at: '2026-01-20T10:00:00.000Z' },
      { id: 's3', customer_email: 'bruno@example.com', total_amount: 5000, type: 'sale', status: 'pending', created_at: '2026-02-01T10:00:00.000Z' },
      { id: 's4', customer_email: 'carla@example.com', total_amount: 7000, type: 'sale', status: 'completed', created_at: '2026-02-15T10:00:00.000Z' },
      { id: 's5', customer_email: 'bruno@example.com', total_amount: 9000, type: 'refund', status: 'pending', created_at: '2026-03-01T10:00:00.000Z' },
    ] as const;
    for (const r of rows) {
      await Order.create({ ...r, merchant_id: 'm_search' });
    }
    // Same shape of data under another merchant — must never leak into results.
    await Order.create({
      id: 'x1', merchant_id: 'm_other', customer_email: 'ana@example.com',
      total_amount: 1000, type: 'sale', status: 'completed', created_at: '2026-01-10T10:00:00.000Z',
    });
  });

  after(async () => {
    await sequelize.close();
  });

  test('no filters: returns all of the merchant’s orders, newest first, never other tenants', async () => {
    const { data, total } = await ordersRepository.search('m_search', filters());
    assert.equal(total, 5);
    assert.deepEqual(data.map((o) => o.id), ['s5', 's4', 's3', 's2', 's1']);
    assert.ok(data.every((o) => o.merchant_id === 'm_search'));
  });

  test('customer_email: partial case-insensitive match', async () => {
    const { data, total } = await ordersRepository.search('m_search', filters({ customer_email: 'BRUNO' }));
    assert.equal(total, 2);
    assert.ok(data.every((o) => o.customer_email === 'bruno@example.com'));
  });

  test('status and type: exact equality filters', async () => {
    const pending = await ordersRepository.search('m_search', filters({ status: 'pending' }));
    assert.deepEqual(pending.data.map((o) => o.id).sort(), ['s3', 's5']);

    const refunds = await ordersRepository.search('m_search', filters({ type: 'refund' }));
    assert.deepEqual(refunds.data.map((o) => o.id).sort(), ['s2', 's5']);

    const both = await ordersRepository.search('m_search', filters({ status: 'pending', type: 'refund' }));
    assert.deepEqual(both.data.map((o) => o.id), ['s5']);
  });

  test('amount range: inclusive bounds on the stored absolute amount', async () => {
    const { data } = await ordersRepository.search('m_search', filters({ min_amount: 3000, max_amount: 7000 }));
    assert.deepEqual(data.map((o) => o.id).sort(), ['s2', 's3', 's4']);

    const lonelyMin = await ordersRepository.search('m_search', filters({ min_amount: 9000 }));
    assert.deepEqual(lonelyMin.data.map((o) => o.id), ['s5']);
  });

  test('date range: inclusive to-day, reusing whereCreatedAt semantics', async () => {
    const { data } = await ordersRepository.search('m_search', filters({ from: '2026-01-20', to: '2026-02-15' }));
    assert.deepEqual(data.map((o) => o.id).sort(), ['s2', 's3', 's4']);
  });

  test('sorting: total_amount asc/desc via allowlist', async () => {
    const asc = await ordersRepository.search('m_search', filters({ sort_by: 'total_amount', order: 'asc' }));
    assert.deepEqual(asc.data.map((o) => o.total_amount), [1000, 3000, 5000, 7000, 9000]);

    const desc = await ordersRepository.search('m_search', filters({ sort_by: 'total_amount', order: 'desc' }));
    assert.deepEqual(desc.data.map((o) => o.total_amount), [9000, 7000, 5000, 3000, 1000]);
  });

  test('pagination: limit/offset page through while total stays the full match count', async () => {
    const page1 = await ordersRepository.search('m_search', filters({ limit: 2, offset: 0 }));
    const page2 = await ordersRepository.search('m_search', filters({ limit: 2, offset: 2 }));
    const page3 = await ordersRepository.search('m_search', filters({ limit: 2, offset: 4 }));
    assert.equal(page1.total, 5);
    assert.equal(page2.total, 5);
    assert.deepEqual(page1.data.map((o) => o.id), ['s5', 's4']);
    assert.deepEqual(page2.data.map((o) => o.id), ['s3', 's2']);
    assert.deepEqual(page3.data.map((o) => o.id), ['s1']);
  });

  test('combined filters intersect', async () => {
    const { data, total } = await ordersRepository.search(
      'm_search',
      filters({ customer_email: 'bruno', type: 'refund', min_amount: 8000, from: '2026-02-20' }),
    );
    assert.equal(total, 1);
    assert.equal(data[0]!.id, 's5');
  });
});

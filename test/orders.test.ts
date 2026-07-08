// Set DB_PATH before importing the db module — the connection is created on import.
if (!process.env.DB_PATH) process.env.DB_PATH = ':memory:';

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { sequelize, initDb } from '../src/db.js';
import { Merchant, Order } from '../src/models/index.js';
import { ordersRepository } from '../src/repositories/orders-repository.js';
import { metricsService } from '../src/services/metrics-service.js';

after(async () => {
  await sequelize.close();
});

test('orders repository: create + listByMerchant returns the order', async () => {
  await initDb();
  await Merchant.upsert({ id: 'm_test', name: 'Test' });
  const created = await ordersRepository.create({
    id: 'o1',
    merchant_id: 'm_test',
    customer_email: 'a@b.com',
    total_amount: 5000,
    type: 'sale',
    status: 'completed',
  });
  assert.equal(created.id, 'o1');
  const list = await ordersRepository.listByMerchant('m_test');
  assert.equal(list.length, 1);
  assert.equal(list[0]!.total_amount, 5000);
});

test('orders repository: findById returns the order', async () => {
  await initDb();
  await Merchant.upsert({ id: 'm_test', name: 'Test' });
  await ordersRepository.create({
    id: 'o2',
    merchant_id: 'm_test',
    customer_email: 'c@d.com',
    total_amount: 1200,
    type: 'sale',
    status: 'completed',
  });
  const got = await ordersRepository.findById('o2', 'm_test');
  assert.equal(got?.total_amount, 1200);
});

test('orders repository: findById is tenant-scoped (no cross-merchant read / IDOR)', async () => {
  await initDb();
  await Merchant.upsert({ id: 'm_owner', name: 'Owner' });
  await Merchant.upsert({ id: 'm_attacker', name: 'Attacker' });
  await ordersRepository.create({
    id: 'o_secret',
    merchant_id: 'm_owner',
    customer_email: 'owner@b.com',
    total_amount: 9900,
    type: 'sale',
    status: 'completed',
  });

  // The owning merchant can read it.
  assert.equal((await ordersRepository.findById('o_secret', 'm_owner'))?.id, 'o_secret');
  // A different merchant asking for the same id gets nothing (no leak).
  assert.equal(await ordersRepository.findById('o_secret', 'm_attacker'), undefined);
});

test('money totals are net of refunds: revenue == sum(sales) - sum(refunds)', async () => {
  await initDb();
  await Merchant.upsert({ id: 'm_net', name: 'Net' });
  await ordersRepository.create({ id: 'ns1', merchant_id: 'm_net', customer_email: 'a@a.com', total_amount: 10000, type: 'sale', status: 'completed' });
  await ordersRepository.create({ id: 'ns2', merchant_id: 'm_net', customer_email: 'a@a.com', total_amount: 20000, type: 'sale', status: 'completed' });
  await ordersRepository.create({ id: 'nr1', merchant_id: 'm_net', customer_email: 'a@a.com', total_amount: 5000, type: 'refund', status: 'completed' });

  // Revenue is the signed sum: 10000 + 20000 - 5000 = 25000 (NOT 35000).
  const revenue = await ordersRepository.sumAmountByMerchant('m_net', '2000-01-01', '2100-01-01');
  assert.equal(revenue, 25000);

  // avg_order_value follows the same rule: round(25000 / 3 orders).
  const summary = await metricsService.getSummary('m_net');
  assert.equal(summary.avg_order_value_cents, Math.round(25000 / 3));
});

test('date range: `to` day is inclusive and lone bounds filter partially', async () => {
  await initDb();
  await Merchant.upsert({ id: 'm_date', name: 'Date' });
  const mk = (id: string, created_at: string) =>
    Order.create({ id, merchant_id: 'm_date', customer_email: 'd@d.com', total_amount: 1000, type: 'sale', status: 'completed', created_at });
  await mk('d_first', '2026-03-01T00:00:00.000Z');
  await mk('d_mid', '2026-03-15T12:00:00.000Z');
  await mk('d_last', '2026-03-31T23:59:59.999Z'); // last instant of the `to` day
  await mk('d_next', '2026-04-01T00:00:00.000Z'); // first instant of the next day

  // Full range [03-01, 03-31]: includes the 23:59:59.999 order, excludes 04-01 00:00.
  const full = await ordersRepository.listByMerchant('m_date', { from: '2026-03-01', to: '2026-03-31' });
  assert.deepEqual(full.map((o) => o.id).sort(), ['d_first', 'd_last', 'd_mid']);

  // Lone `from`: lower-bounded, open on the top.
  const fromOnly = await ordersRepository.listByMerchant('m_date', { from: '2026-03-15' });
  assert.deepEqual(fromOnly.map((o) => o.id).sort(), ['d_last', 'd_mid', 'd_next']);

  // Lone `to`: upper-bounded (inclusive of the to-day), open at the bottom.
  const toOnly = await ordersRepository.listByMerchant('m_date', { to: '2026-03-01' });
  assert.deepEqual(toOnly.map((o) => o.id), ['d_first']);
});

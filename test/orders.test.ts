// Set DB_PATH before importing the db module — the connection is created on import.
if (!process.env.DB_PATH) process.env.DB_PATH = ':memory:';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initSchema, db } from '../src/db.js';
import { ordersRepository } from '../src/repositories/orders-repository.js';

test('orders repository: create + listByMerchant returns the order', () => {
  initSchema();
  db.prepare(`INSERT OR IGNORE INTO merchants (id, name) VALUES ('m_test', 'Test')`).run();
  const created = ordersRepository.create({
    id: 'o1',
    merchant_id: 'm_test',
    customer_email: 'a@b.com',
    total_amount: 5000,
    type: 'sale',
    status: 'completed',
  });
  assert.equal(created.id, 'o1');
  const list = ordersRepository.listByMerchant('m_test');
  assert.equal(list.length, 1);
  assert.equal(list[0]!.total_amount, 5000);
});

test('orders repository: getById returns the order', () => {
  initSchema();
  db.prepare(`INSERT OR IGNORE INTO merchants (id, name) VALUES ('m_test', 'Test')`).run();
  ordersRepository.create({
    id: 'o2',
    merchant_id: 'm_test',
    customer_email: 'c@d.com',
    total_amount: 1200,
    type: 'sale',
    status: 'completed',
  });
  const got = ordersRepository.findById('o2', 'm_test');
  assert.equal(got?.total_amount, 1200);
});

test('orders repository: findById is tenant-scoped (no cross-merchant read / IDOR)', () => {
  initSchema();
  db.prepare(`INSERT OR IGNORE INTO merchants (id, name) VALUES ('m_owner', 'Owner')`).run();
  db.prepare(`INSERT OR IGNORE INTO merchants (id, name) VALUES ('m_attacker', 'Attacker')`).run();
  ordersRepository.create({
    id: 'o_secret',
    merchant_id: 'm_owner',
    customer_email: 'owner@b.com',
    total_amount: 9900,
    type: 'sale',
    status: 'completed',
  });

  // The owning merchant can read it.
  assert.equal(ordersRepository.findById('o_secret', 'm_owner')?.id, 'o_secret');
  // A different merchant asking for the same id gets nothing (no leak).
  assert.equal(ordersRepository.findById('o_secret', 'm_attacker'), undefined);
});

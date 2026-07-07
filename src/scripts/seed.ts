import { randomUUID } from 'node:crypto';
import { sequelize, initDb } from '../db.js';
import { Merchant, Order } from '../models/index.js';
import type { CreationAttributes } from 'sequelize';

const MERCHANTS = [
  { id: 'm_acme', name: 'Acme Supplies' },
  { id: 'm_bistro', name: 'Bistro Verde' },
];

const CUSTOMERS = [
  'ana@example.com',
  'bruno@example.com',
  'carla@example.com',
  'diego@example.com',
  'elena@example.com',
  'felipe@example.com',
];

function randomDateInLast90Days(): string {
  const now = Date.now();
  const offsetMs = Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000);
  return new Date(now - offsetMs).toISOString();
}

export async function seedIfEmpty(): Promise<void> {
  await initDb();
  const existing = await Order.count();
  if (existing > 0) return;

  await Merchant.bulkCreate(MERCHANTS, { ignoreDuplicates: true });

  const orders: CreationAttributes<Order>[] = [];
  for (let i = 0; i < 80; i++) {
    const merchant = MERCHANTS[i % MERCHANTS.length]!;
    const customer = CUSTOMERS[i % CUSTOMERS.length]!;
    const amount = Math.floor(2000 + Math.random() * 18000);
    const type: 'sale' | 'refund' = Math.random() < 0.15 ? 'refund' : 'sale';
    orders.push({
      id: randomUUID(),
      merchant_id: merchant.id,
      customer_email: customer,
      total_amount: amount,
      type,
      status: 'completed',
      created_at: randomDateInLast90Days(),
    });
  }
  await Order.bulkCreate(orders);
  console.log(`[seed] inserted ${MERCHANTS.length} merchants and 80 orders`);
}

const isMain = import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1] ?? '');
if (isMain) {
  seedIfEmpty()
    .then(() => sequelize.close())
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

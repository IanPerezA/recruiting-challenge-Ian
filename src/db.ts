import { Sequelize } from 'sequelize';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

const DB_PATH = process.env.DB_PATH ?? 'data/dashboard.db';

if (DB_PATH !== ':memory:' && !existsSync(dirname(DB_PATH))) {
  mkdirSync(dirname(DB_PATH), { recursive: true });
}

/** Single shared Sequelize connection (SQLite). */
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PATH,
  logging: false,
});

/**
 * Registers models, applies pragmas, and creates tables if missing. Idempotent —
 * safe to call from both the server bootstrap and the seed script/tests.
 *
 * Models are imported dynamically so `db.ts` has no static dependency on the
 * model files (which import `sequelize` from here) — that keeps the module graph
 * acyclic.
 */
export async function initDb(): Promise<void> {
  await import('./models/index.js');
  await sequelize.query('PRAGMA foreign_keys = ON;');
  if (DB_PATH !== ':memory:') {
    await sequelize.query('PRAGMA journal_mode = WAL;');
  }
  await sequelize.sync();
}

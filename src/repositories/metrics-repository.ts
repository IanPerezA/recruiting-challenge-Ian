import { db } from '../db.js';
import type { TopCustomer } from '../models/metrics.js';

/**
 * Data-access for dashboard metrics. Reads through the shared `db` connection
 * like every other repository — no separate connection, so tests and tenancy
 * filters have a single seam to reason about.
 */
export const metricsRepository = {
  countOrders(merchantId: string): number {
    const row = db
      .prepare(`SELECT COUNT(*) AS n FROM orders WHERE merchant_id = ?`)
      .get(merchantId) as { n: number };
    return row.n;
  },

  countUniqueCustomers(merchantId: string): number {
    const row = db
      .prepare(`SELECT COUNT(DISTINCT customer_email) AS n FROM orders WHERE merchant_id = ?`)
      .get(merchantId) as { n: number };
    return row.n;
  },

  avgOrderAmount(merchantId: string): number {
    const row = db
      .prepare(`SELECT COALESCE(AVG(total_amount), 0) AS avg FROM orders WHERE merchant_id = ?`)
      .get(merchantId) as { avg: number };
    return row.avg;
  },

  topCustomers(merchantId: string, limit: number): TopCustomer[] {
    return db
      .prepare(
        `SELECT customer_email, COUNT(*) AS order_count, SUM(total_amount) AS total_spent
         FROM orders
         WHERE merchant_id = ?
         GROUP BY customer_email
         ORDER BY total_spent DESC
         LIMIT ?`,
      )
      .all(merchantId, limit) as TopCustomer[];
  },
};

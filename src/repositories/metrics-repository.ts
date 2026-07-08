import { fn, col, literal } from 'sequelize';
import { Order } from '../models/order.model.js';
import { signedAmount } from './order-amount.js';
import type { TopCustomer } from '../models/metrics.js';

/**
 * Data-access for dashboard metrics, backed by Sequelize on the shared
 * connection — one seam for tests, tenancy filters, and query patterns.
 */
export const metricsRepository = {
  async countOrders(merchantId: string): Promise<number> {
    return Order.count({ where: { merchant_id: merchantId } });
  },

  async countUniqueCustomers(merchantId: string): Promise<number> {
    return Order.count({ where: { merchant_id: merchantId }, distinct: true, col: 'customer_email' });
  },

  /** Average net order value: refunds subtract, matching the revenue rule. */
  async avgOrderAmount(merchantId: string): Promise<number> {
    const row = (await Order.findOne({
      attributes: [[fn('AVG', signedAmount()), 'avg']],
      where: { merchant_id: merchantId },
      raw: true,
    })) as unknown as { avg: number | null } | null;
    return row?.avg ?? 0;
  },

  async topCustomers(merchantId: string, limit: number): Promise<TopCustomer[]> {
    const rows = await Order.findAll({
      where: { merchant_id: merchantId },
      attributes: [
        'customer_email',
        [fn('COUNT', col('*')), 'order_count'],
        [fn('SUM', signedAmount()), 'total_spent'],
      ],
      group: ['customer_email'],
      order: [[literal('total_spent'), 'DESC']],
      limit,
      raw: true,
    });
    return rows as unknown as TopCustomer[];
  },
};

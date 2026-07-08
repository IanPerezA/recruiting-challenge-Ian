import { fn } from 'sequelize';
import { Order } from '../models/order.model.js';
import { signedAmount } from './order-amount.js';
import { whereCreatedAt } from './date-range.js';
import type { OrderRow, NewOrder, OrderListOptions } from '../models/order.js';

function toRow(order: Order): OrderRow {
  return order.toJSON() as OrderRow;
}

/**
 * Data-access layer for orders. All order queries route through here.
 *
 * - centralized place for query patterns
 * - the place to add auditing, caching, tenancy filters
 * - now backed by Sequelize models instead of raw SQL
 */
export const ordersRepository = {
  async listByMerchant(merchantId: string, opts: OrderListOptions = {}): Promise<OrderRow[]> {
    const limit = opts.limit ?? 100;
    const rows = await Order.findAll({
      where: { merchant_id: merchantId, ...whereCreatedAt(opts.from, opts.to) },
      order: [['created_at', 'DESC']],
      limit,
    });
    return rows.map(toRow);
  },

  /**
   * Look up a single order scoped to its owning merchant. Tenancy is part of the
   * signature on purpose: there is no way to read an order without proving which
   * merchant is asking, so a cross-tenant read (IDOR) cannot compile.
   */
  async findById(id: string, merchantId: string): Promise<OrderRow | undefined> {
    const order = await Order.findOne({ where: { id, merchant_id: merchantId } });
    return order ? toRow(order) : undefined;
  },

  async create(order: NewOrder): Promise<OrderRow> {
    await Order.create({ ...order });
    // Re-read so the returned row carries the DB-assigned created_at.
    return (await this.findById(order.id, order.merchant_id))!;
  },

  /**
   * Net revenue over a date range for a merchant: sales add, refunds subtract.
   * Used by the revenue endpoint.
   */
  async sumAmountByMerchant(merchantId: string, from: string, to: string): Promise<number> {
    const row = (await Order.findOne({
      attributes: [[fn('SUM', signedAmount()), 'total']],
      where: { merchant_id: merchantId, ...whereCreatedAt(from, to) },
      raw: true,
    })) as unknown as { total: number | null } | null;
    return row?.total ?? 0;
  },
};

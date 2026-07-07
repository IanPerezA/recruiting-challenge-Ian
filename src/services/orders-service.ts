import { randomUUID } from 'node:crypto';
import { ordersRepository } from '../repositories/orders-repository.js';
import type { OrderRow, OrderListOptions } from '../models/order.js';

/**
 * Business logic for orders. Controllers talk to this; this talks to the
 * repository. No SQL, no req/res here.
 */
export const ordersService = {
  listOrders(merchantId: string, opts: OrderListOptions): OrderRow[] {
    return ordersRepository.listByMerchant(merchantId, opts);
  },

  getOrder(id: string, merchantId: string): OrderRow | undefined {
    return ordersRepository.findById(id, merchantId);
  },

  createOrder(input: {
    merchant_id: string;
    customer_email: string;
    total_amount: number;
    type: 'sale' | 'refund';
  }): OrderRow {
    return ordersRepository.create({
      id: randomUUID(),
      merchant_id: input.merchant_id,
      customer_email: input.customer_email,
      total_amount: input.total_amount,
      type: input.type,
      status: 'completed',
    });
  },
};

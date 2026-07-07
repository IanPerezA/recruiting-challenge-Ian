import { ordersRepository } from '../repositories/orders-repository.js';

/**
 * Revenue is derived from orders, so it reads through the orders repository.
 */
export const revenueService = {
  getRevenue(merchantId: string, from: string, to: string): number {
    return ordersRepository.sumAmountByMerchant(merchantId, from, to);
  },
};

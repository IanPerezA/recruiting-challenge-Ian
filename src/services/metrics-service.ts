import { metricsRepository } from '../repositories/metrics-repository.js';
import type { MerchantSummary, TopCustomer } from '../models/metrics.js';

/**
 * Assembles dashboard metrics from the repository. Presentation-independent.
 */
export const metricsService = {
  async getSummary(merchantId: string): Promise<MerchantSummary> {
    const [totalOrders, uniqueCustomers, avg] = await Promise.all([
      metricsRepository.countOrders(merchantId),
      metricsRepository.countUniqueCustomers(merchantId),
      metricsRepository.avgOrderAmount(merchantId),
    ]);
    return {
      merchant_id: merchantId,
      total_orders: totalOrders,
      unique_customers: uniqueCustomers,
      avg_order_value_cents: Math.round(avg),
    };
  },

  getTopCustomers(merchantId: string, limit: number): Promise<TopCustomer[]> {
    return metricsRepository.topCustomers(merchantId, limit);
  },
};

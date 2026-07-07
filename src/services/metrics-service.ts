import { metricsRepository } from '../repositories/metrics-repository.js';
import type { MerchantSummary, TopCustomer } from '../models/metrics.js';

/**
 * Assembles dashboard metrics from the repository. Presentation-independent.
 */
export const metricsService = {
  getSummary(merchantId: string): MerchantSummary {
    return {
      merchant_id: merchantId,
      total_orders: metricsRepository.countOrders(merchantId),
      unique_customers: metricsRepository.countUniqueCustomers(merchantId),
      avg_order_value_cents: Math.round(metricsRepository.avgOrderAmount(merchantId)),
    };
  },

  getTopCustomers(merchantId: string, limit: number): TopCustomer[] {
    return metricsRepository.topCustomers(merchantId, limit);
  },
};

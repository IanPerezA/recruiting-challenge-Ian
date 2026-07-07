/** Dashboard metric shapes returned by the metrics endpoints. */
export interface MerchantSummary {
  merchant_id: string;
  total_orders: number;
  unique_customers: number;
  avg_order_value_cents: number;
}

export interface TopCustomer {
  customer_email: string;
  order_count: number;
  total_spent: number;
}

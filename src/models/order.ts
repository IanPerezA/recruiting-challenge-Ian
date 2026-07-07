/**
 * Order domain types.
 *
 * `OrderRow` mirrors the persisted shape (snake_case columns). When the search
 * feature lands we can introduce a richer domain entity + mapper here; for now
 * this is the single source of truth for the order shape across the layers.
 */
export interface OrderRow {
  id: string;
  merchant_id: string;
  customer_email: string;
  total_amount: number;
  type: 'sale' | 'refund';
  status: string;
  created_at: string;
}

/** Fields required to create an order; `created_at` is assigned by the store. */
export type NewOrder = Omit<OrderRow, 'created_at'>;

/** Options accepted when listing a merchant's orders. */
export interface OrderListOptions {
  from?: string;
  to?: string;
  limit?: number;
}

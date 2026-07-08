import type { OrderRow } from './order.js';

/** Sortable columns for order search — allowlist, never arbitrary input. */
export const ORDER_SORT_FIELDS = ['created_at', 'total_amount'] as const;
export type OrderSortField = (typeof ORDER_SORT_FIELDS)[number];

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

/**
 * Validated search criteria, produced by the validation middleware and consumed
 * by service + repository. Optional fields are absent when not filtered on;
 * pagination and sort always carry resolved defaults.
 */
export interface OrderSearchFilters {
  customer_email?: string;
  status?: string;
  type?: 'sale' | 'refund';
  min_amount?: number;
  max_amount?: number;
  from?: string;
  to?: string;
  sort_by: OrderSortField;
  order: SortDirection;
  limit: number;
  offset: number;
}

/** Search result: one page of rows + the total match count for pagination. */
export interface OrderSearchResult {
  data: OrderRow[];
  total: number;
}

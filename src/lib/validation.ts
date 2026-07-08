import { BadRequestError } from './errors.js';

/** Upper ceiling for an order amount, in cents ($10,000,000). */
export const MAX_AMOUNT_CENTS = 1_000_000_000;

/** Hard cap on how many rows a list/metrics query may return. */
export const MAX_LIMIT = 250;

/**
 * A money amount in cents: strictly positive integer, capped. Refunds are
 * modelled with `type: 'refund'`, never a negative amount — so 0 and negatives
 * are rejected, not stored.
 */
export function parseAmount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0 || value > MAX_AMOUNT_CENTS) {
    throw new BadRequestError('invalid_amount', `total_amount must be a positive integer in cents (1..${MAX_AMOUNT_CENTS})`);
  }
  return value;
}

/** Order type: defaults to 'sale' when absent; anything else is rejected. */
export function parseOrderType(value: unknown): 'sale' | 'refund' {
  if (value === undefined) return 'sale';
  if (value !== 'sale' && value !== 'refund') {
    throw new BadRequestError('invalid_type', "type must be 'sale' or 'refund'");
  }
  return value;
}

/**
 * Row limit from a query param. Absent → `fallback`. Anything that is not an
 * integer in `1..MAX_LIMIT` fails fast with a 400 (we do NOT silently clamp —
 * a bad client value should surface, not be guessed at).
 */
export function parseLimit(raw: unknown, fallback: number): number {
  if (raw === undefined) return fallback;
  const value = Array.isArray(raw) ? raw[raw.length - 1] : raw;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(n) || n < 1 || n > MAX_LIMIT) {
    throw new BadRequestError('invalid_limit', `limit must be an integer between 1 and ${MAX_LIMIT}`);
  }
  return n;
}

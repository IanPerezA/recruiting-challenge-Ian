import type { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../lib/errors.js';
import { parseLimit, parseOffset, parseAmountBound, parseEnum, parseDateOnly } from '../lib/validation.js';
import { ORDER_SORT_FIELDS, SORT_DIRECTIONS, type OrderSearchFilters } from '../models/order-search.js';

declare global {
  namespace Express {
    interface Request {
      orderSearch?: OrderSearchFilters;
    }
  }
}

const SEARCH_DEFAULT_LIMIT = 50;

/** First value if the param was repeated; undefined if absent. */
function one(raw: unknown): unknown {
  return Array.isArray(raw) ? raw[0] : raw;
}

/**
 * Validation middleware for GET /api/orders/search. Parses req.query into a
 * typed OrderSearchFilters (attached as req.orderSearch) and fails fast with a
 * BadRequestError on the first invalid param — the controller never sees raw
 * query strings. Sync throws are forwarded to the error handler by Express.
 */
export function validateOrderSearch(req: Request, _res: Response, next: NextFunction): void {
  const q = req.query;

  const filters: OrderSearchFilters = {
    sort_by: q.sort_by === undefined ? 'created_at' : parseEnum(one(q.sort_by), ORDER_SORT_FIELDS, 'invalid_sort'),
    order: q.order === undefined ? 'desc' : parseEnum(one(q.order), SORT_DIRECTIONS, 'invalid_order'),
    limit: parseLimit(q.limit, SEARCH_DEFAULT_LIMIT),
    offset: parseOffset(q.offset),
  };

  const email = one(q.customer_email);
  if (email !== undefined) {
    if (typeof email !== 'string' || email.trim() === '') {
      throw new BadRequestError('invalid_email_filter', 'customer_email must be a non-empty string');
    }
    filters.customer_email = email.trim();
  }

  const status = one(q.status);
  if (status !== undefined) {
    if (typeof status !== 'string' || status.trim() === '') {
      throw new BadRequestError('invalid_status_filter', 'status must be a non-empty string');
    }
    filters.status = status.trim();
  }

  if (q.type !== undefined) {
    filters.type = parseEnum(one(q.type), ['sale', 'refund'] as const, 'invalid_type');
  }

  if (q.min_amount !== undefined) filters.min_amount = parseAmountBound(one(q.min_amount));
  if (q.max_amount !== undefined) filters.max_amount = parseAmountBound(one(q.max_amount));
  if (filters.min_amount !== undefined && filters.max_amount !== undefined && filters.min_amount > filters.max_amount) {
    throw new BadRequestError('invalid_amount_range', 'min_amount must be <= max_amount');
  }

  if (q.from !== undefined) filters.from = parseDateOnly(one(q.from), 'invalid_date');
  if (q.to !== undefined) filters.to = parseDateOnly(one(q.to), 'invalid_date');
  if (filters.from && filters.to && filters.from > filters.to) {
    throw new BadRequestError('invalid_date_range', 'from must be <= to');
  }

  req.orderSearch = filters;
  next();
}

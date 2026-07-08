import { Op } from 'sequelize';

/**
 * Builds a `created_at` filter for an inclusive `[from, to]` day range.
 *
 * - `to` is inclusive of the whole day: it is extended to `<date>T23:59:59.999Z`
 *   so an order at any time on the `to` day is kept (the old `< to` boundary
 *   silently dropped the entire `to` day).
 * - Either bound may be omitted → partial / open-ended range.
 * - Only the date part of each bound is used, so a stray time or offset in the
 *   input can't push the boundary into the wrong calendar day.
 * - Lower bound stays the bare date, which sorts before every timestamp on that
 *   day in BOTH stored formats (`...T..Z` and `CURRENT_TIMESTAMP` with a space).
 *
 * The date-range semantics live here and only here, so every query that filters
 * by day shares one definition of "inclusive range".
 */
export function whereCreatedAt(from?: string, to?: string): { created_at?: { [Op.gte]?: string; [Op.lte]?: string } } {
  const cond: { [Op.gte]?: string; [Op.lte]?: string } = {};
  if (from) cond[Op.gte] = from.slice(0, 10);
  if (to) cond[Op.lte] = `${to.slice(0, 10)}T23:59:59.999Z`;
  return Object.getOwnPropertySymbols(cond).length > 0 ? { created_at: cond } : {};
}

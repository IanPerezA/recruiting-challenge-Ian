import { literal } from 'sequelize';

/**
 * A single order's *signed* contribution to money totals: sales add, refunds
 * subtract. Amounts are stored as absolute values (ledger convention); the sign
 * rule for refunds lives here and ONLY here.
 *
 * Every revenue / average / spend aggregation must build on this expression, so
 * a new metric added tomorrow cannot silently re-introduce the "refunds counted
 * as positive" bug. Returns a fresh literal each call to avoid sharing mutable
 * query state.
 */
export function signedAmount() {
  return literal(`CASE WHEN "type" = 'refund' THEN -"total_amount" ELSE "total_amount" END`);
}

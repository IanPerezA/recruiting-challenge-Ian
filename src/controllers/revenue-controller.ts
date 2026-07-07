import type { Request, Response } from 'express';
import { revenueService } from '../services/revenue-service.js';

export const revenueController = {
  /**
   * GET /api/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD
   * Total revenue for the authenticated merchant in the given date range.
   */
  async get(req: Request, res: Response): Promise<void> {
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;
    if (!from || !to) {
      res.status(400).json({ error: 'missing_date_range', detail: 'from and to are required (YYYY-MM-DD)' });
      return;
    }

    const total = await revenueService.getRevenue(req.merchantId!, from, to);
    res.json({
      merchant_id: req.merchantId,
      from,
      to,
      revenue_cents: total,
      revenue: total / 100,
    });
  },
};

import type { Request, Response } from 'express';
import { metricsService } from '../services/metrics-service.js';
import { parseLimit } from '../lib/validation.js';

export const metricsController = {
  /** GET /api/metrics/summary — dashboard summary stats for the current merchant. */
  async summary(req: Request, res: Response): Promise<void> {
    res.json(await metricsService.getSummary(req.merchantId!));
  },

  /** GET /api/metrics/top-customers?limit=N */
  async topCustomers(req: Request, res: Response): Promise<void> {
    const limit = parseLimit(req.query.limit, 5);
    res.json({ customers: await metricsService.getTopCustomers(req.merchantId!, limit) });
  },
};

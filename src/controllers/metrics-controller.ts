import type { Request, Response } from 'express';
import { metricsService } from '../services/metrics-service.js';

export const metricsController = {
  /** GET /api/metrics/summary — dashboard summary stats for the current merchant. */
  summary(req: Request, res: Response): void {
    res.json(metricsService.getSummary(req.merchantId!));
  },

  /** GET /api/metrics/top-customers?limit=N */
  topCustomers(req: Request, res: Response): void {
    const limit = Number(req.query.limit ?? 5);
    res.json({ customers: metricsService.getTopCustomers(req.merchantId!, limit) });
  },
};

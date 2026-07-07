import type { Request, Response } from 'express';

export const healthController = {
  /** GET /api/health — liveness probe. No auth. */
  check(_req: Request, res: Response): void {
    res.json({ ok: true });
  },
};

import express, { type Express } from 'express';
import { authMiddleware } from './middlewares/auth.js';
import { errorHandler } from './middlewares/error-handler.js';
import { healthRouter } from './routes/health.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { revenueRouter } from './routes/revenue.routes.js';
import { metricsRouter } from './routes/metrics.routes.js';

/**
 * Builds the Express app (routes + middleware) without opening the DB or
 * listening on a port. Kept separate from `server.ts` so tests can drive the
 * real HTTP surface in-process.
 */
export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(express.static('public'));

  app.use('/api/health', healthRouter);
  app.use('/api/orders', authMiddleware, ordersRouter);
  app.use('/api/revenue', authMiddleware, revenueRouter);
  app.use('/api/metrics', authMiddleware, metricsRouter);

  app.use(errorHandler);

  return app;
}

import express from 'express';
import { initSchema } from './db.js';
import { seedIfEmpty } from './scripts/seed.js';
import { authMiddleware } from './middlewares/auth.js';
import { errorHandler } from './middlewares/error-handler.js';
import { healthRouter } from './routes/health.routes.js';
import { ordersRouter } from './routes/orders.routes.js';
import { revenueRouter } from './routes/revenue.routes.js';
import { metricsRouter } from './routes/metrics.routes.js';

initSchema();
seedIfEmpty();

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(express.static('public'));

app.use('/api/health', healthRouter);
app.use('/api/orders', authMiddleware, ordersRouter);
app.use('/api/revenue', authMiddleware, revenueRouter);
app.use('/api/metrics', authMiddleware, metricsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`dashboard server listening on http://localhost:${PORT}`);
});

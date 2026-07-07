import { Router } from 'express';
import { metricsController } from '../controllers/metrics-controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';

export const metricsRouter = Router();

metricsRouter.get('/summary', asyncHandler(metricsController.summary));
metricsRouter.get('/top-customers', asyncHandler(metricsController.topCustomers));

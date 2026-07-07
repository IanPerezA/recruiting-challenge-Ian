import { Router } from 'express';
import { metricsController } from '../controllers/metrics-controller.js';

export const metricsRouter = Router();

metricsRouter.get('/summary', metricsController.summary);
metricsRouter.get('/top-customers', metricsController.topCustomers);

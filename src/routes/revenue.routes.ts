import { Router } from 'express';
import { revenueController } from '../controllers/revenue-controller.js';

export const revenueRouter = Router();

revenueRouter.get('/', revenueController.get);

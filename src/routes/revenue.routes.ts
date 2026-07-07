import { Router } from 'express';
import { revenueController } from '../controllers/revenue-controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';

export const revenueRouter = Router();

revenueRouter.get('/', asyncHandler(revenueController.get));

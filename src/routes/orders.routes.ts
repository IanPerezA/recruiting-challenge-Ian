import { Router } from 'express';
import { ordersController } from '../controllers/orders-controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';

export const ordersRouter = Router();

ordersRouter.get('/', asyncHandler(ordersController.list));
ordersRouter.get('/:id', asyncHandler(ordersController.getById));
ordersRouter.post('/', asyncHandler(ordersController.create));

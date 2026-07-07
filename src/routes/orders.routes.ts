import { Router } from 'express';
import { ordersController } from '../controllers/orders-controller.js';

export const ordersRouter = Router();

ordersRouter.get('/', ordersController.list);
ordersRouter.get('/:id', ordersController.getById);
ordersRouter.post('/', ordersController.create);

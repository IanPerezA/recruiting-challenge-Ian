import { Router } from 'express';
import { ordersController } from '../controllers/orders-controller.js';
import { asyncHandler } from '../middlewares/async-handler.js';
import { validateOrderSearch } from '../middlewares/validate-order-search.js';

export const ordersRouter = Router();

ordersRouter.get('/', asyncHandler(ordersController.list));
// /search MUST be registered before /:id or it would be captured as an id.
ordersRouter.get('/search', validateOrderSearch, asyncHandler(ordersController.search));
ordersRouter.get('/:id', asyncHandler(ordersController.getById));
ordersRouter.post('/', asyncHandler(ordersController.create));

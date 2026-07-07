import type { Request, Response } from 'express';
import { ordersService } from '../services/orders-service.js';

/**
 * HTTP layer for orders: reads the request, delegates to the service, shapes
 * the response. No business logic or data access here.
 */
export const ordersController = {
  list(req: Request, res: Response): void {
    const orders = ordersService.listOrders(req.merchantId!, {
      from: typeof req.query.from === 'string' ? req.query.from : undefined,
      to: typeof req.query.to === 'string' ? req.query.to : undefined,
      limit: typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined,
    });
    res.json({ orders });
  },

  getById(req: Request, res: Response): void {
    const id = req.params.id;
    if (typeof id !== 'string') {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    const order = ordersService.getOrder(id, req.merchantId!);
    if (!order) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json({ order });
  },

  create(req: Request, res: Response): void {
    const body = req.body as {
      customer_email?: string;
      total_amount?: number;
      type?: 'sale' | 'refund';
    };
    if (!body.customer_email || typeof body.total_amount !== 'number') {
      res.status(400).json({ error: 'invalid_body' });
      return;
    }
    const order = ordersService.createOrder({
      merchant_id: req.merchantId!,
      customer_email: body.customer_email,
      total_amount: body.total_amount,
      type: body.type ?? 'sale',
    });
    res.status(201).json({ order });
  },
};

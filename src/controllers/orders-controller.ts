import type { Request, Response } from 'express';
import { ordersService } from '../services/orders-service.js';
import { BadRequestError } from '../lib/errors.js';
import { parseAmount, parseOrderType, parseLimit } from '../lib/validation.js';

/**
 * HTTP layer for orders: reads the request, delegates to the service, shapes
 * the response. No business logic or data access here.
 */
export const ordersController = {
  async list(req: Request, res: Response): Promise<void> {
    const orders = await ordersService.listOrders(req.merchantId!, {
      from: typeof req.query.from === 'string' ? req.query.from : undefined,
      to: typeof req.query.to === 'string' ? req.query.to : undefined,
      limit: parseLimit(req.query.limit, 100),
    });
    res.json({ orders });
  },

  /** GET /api/orders/search — filters come pre-validated on req.orderSearch. */
  async search(req: Request, res: Response): Promise<void> {
    const filters = req.orderSearch!;
    const { data, total } = await ordersService.searchOrders(req.merchantId!, filters);
    res.json({ data, pagination: { total, limit: filters.limit, offset: filters.offset } });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    if (typeof id !== 'string') {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    const order = await ordersService.getOrder(id, req.merchantId!);
    if (!order) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    res.json({ order });
  },

  async create(req: Request, res: Response): Promise<void> {
    const body = req.body as { customer_email?: unknown; total_amount?: unknown; type?: unknown };
    if (typeof body.customer_email !== 'string' || body.customer_email.length === 0) {
      throw new BadRequestError('invalid_body', 'customer_email is required');
    }
    const order = await ordersService.createOrder({
      merchant_id: req.merchantId!,
      customer_email: body.customer_email,
      total_amount: parseAmount(body.total_amount),
      type: parseOrderType(body.type),
    });
    res.status(201).json({ order });
  },
};

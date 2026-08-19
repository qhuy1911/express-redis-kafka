import { Request, Response } from 'express';

import * as orderService from '../services/order.service.js';

export const createOrder = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const order = await orderService.createOrder(req.user!.id);

  res.status(201).json({
    status: 'success',
    data: {
      order,
    },
  });
};

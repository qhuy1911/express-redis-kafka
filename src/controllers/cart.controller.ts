import { Request, Response } from 'express';

import * as cartService from '../services/cart.service.js';
import { AppError } from '../utils/appError.js';

export const getCart = async (req: Request, res: Response): Promise<void> => {
  const cart = await cartService.getCart(req.user!.id);

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
};

export const addItem = async (req: Request, res: Response): Promise<void> => {
  const { variantId, quantity } = req.body;

  const cart = await cartService.addItem(req.user!.id, variantId, quantity);

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
};

export const updateItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { variantId } = req.params;
  const { quantity } = req.body;

  if (Array.isArray(variantId)) {
    throw new AppError('Invalid variant ID', 400);
  }

  const cart = await cartService.updateItem(req.user!.id, variantId, quantity);

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
};

export const removeItem = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { variantId } = req.params;

  if (Array.isArray(variantId)) {
    throw new AppError('Invalid variant ID', 400);
  }

  const cart = await cartService.removeItem(req.user!.id, variantId);

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
};

export const clearCart = async (req: Request, res: Response): Promise<void> => {
  await cartService.clearCart(req.user!.id);

  res.status(204).send();
};

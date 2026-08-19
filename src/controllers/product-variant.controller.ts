import { Request, Response } from 'express';

import * as variantService from '../services/product-variant.service.js';

export const createVariant = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const variant = await variantService.createVariant({
    productId: req.params.productId,
    ...req.body,
  });

  res.status(201).json({
    status: 'success',
    data: {
      variant,
    },
  });
};

export const getProductVariants = async (
  req: Request<{ productId: string }>,
  res: Response,
): Promise<void> => {
  const variants = await variantService.getProductVariants(
    req.params.productId,
  );

  res.status(200).json({
    status: 'success',
    results: variants.length,
    data: {
      variants,
    },
  });
};

export const getVariantById = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const variant = await variantService.getVariantById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      variant,
    },
  });
};

export const updateVariant = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  const variant = await variantService.updateVariant(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      variant,
    },
  });
};

export const deleteVariant = async (
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> => {
  await variantService.deleteVariant(req.params.id);

  res.status(204).send();
};

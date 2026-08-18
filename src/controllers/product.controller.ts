import { Request, Response } from 'express';

import * as productService from '../services/product.service.js';
import {
  CreateProductInput,
  GetProductsQuery,
  UpdateProductInput,
} from '../schemas/product.schema.js';

export const create = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.create(req.body as CreateProductInput);

  res.status(201).json({
    status: 'success',
    data: {
      product,
    },
  });
};

export const findAll = async (req: Request, res: Response): Promise<void> => {
  const result = await productService.findAll(
    req.query as unknown as GetProductsQuery,
  );

  res.status(200).json({
    status: 'success',
    data: result,
  });
};

export const findOne = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.findOne(req.params.id as string);

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const product = await productService.update(
    req.params.id as string,
    req.body as UpdateProductInput,
  );

  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  await productService.remove(req.params.id as string);

  res.status(204).send();
};

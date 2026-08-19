import { Router } from 'express';

import { Role } from '../generated/prisma/enums.js';

import { validate } from '../middlewares/validate.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

import {
  createProductSchema,
  getProductsQuerySchema,
  productIdParamSchema,
  updateProductSchema,
} from '../schemas/product.schema.js';

import {
  create,
  findAll,
  findOne,
  remove,
  update,
} from '../controllers/product.controller.js';
import {
  createVariant,
  getProductVariants,
} from '../controllers/product-variant.controller.js';
import { createProductVariantSchema } from '../schemas/product-variant.schema.js';

const router = Router();

router.get('/', validate(getProductsQuerySchema), findAll);

router.get('/:id', validate(productIdParamSchema), findOne);

router.post(
  '/',
  protect,
  restrictTo(Role.ADMIN),
  validate(createProductSchema),
  create,
);

router.patch(
  '/:id',
  protect,
  restrictTo(Role.ADMIN),
  validate(updateProductSchema),
  update,
);

router.delete(
  '/:id',
  protect,
  restrictTo(Role.ADMIN),
  validate(productIdParamSchema),
  remove,
);

// Product variant
router.post(
  '/:productId/variants',
  protect,
  restrictTo('ADMIN'),
  validate(createProductVariantSchema),
  createVariant,
);

router.get(
  '/:productId/variants',
  validate(productIdParamSchema),
  getProductVariants,
);

export default router;

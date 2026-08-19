import { Router } from 'express';

import {
  getVariantById,
  updateVariant,
  deleteVariant,
} from '../controllers/product-variant.controller.js';

import {
  updateProductVariantSchema,
  getProductVariantSchema,
} from '../schemas/product-variant.schema.js';

import { validate } from '../middlewares/validate.js';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:id', validate(getProductVariantSchema), getVariantById);

router.patch(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  validate(updateProductVariantSchema),
  updateVariant,
);

router.delete(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  validate(getProductVariantSchema),
  deleteVariant,
);

export default router;

import { Router } from 'express';

import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.js';

import {
  addCartItemSchema,
  cartVariantParamSchema,
  updateCartItemSchema,
} from '../schemas/cart.schema.js';

import {
  addItem,
  clearCart,
  getCart,
  removeItem,
  updateItem,
} from '../controllers/cart.controller.js';

const router = Router();

router.use(protect);

router.get('/', getCart);

router.post('/items', validate(addCartItemSchema), addItem);

router.patch('/items/:variantId', validate(updateCartItemSchema), updateItem);

router.delete(
  '/items/:variantId',
  validate(cartVariantParamSchema),
  removeItem,
);

router.delete('/', clearCart);

export default router;

import { Router } from 'express';
import { validate } from '../middlewares/validate.js';
import { registerSchema } from '../schemas/auth.schema.js';

const router = Router();

router.post('/register', validate(registerSchema), (req, res) => {
  res.status(200).json({
    status: 'success',
    data: req.body,
  });
});

export default router;

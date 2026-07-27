import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller.js';
import { authenticate, validate } from '../middlewares/index.js';
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/categories.validator.js';

const router = Router();

router.get('/', categoriesController.getAll);
router.get('/:id', categoriesController.getById);

router.post(
  '/',
  authenticate,
  validate(createCategorySchema),
  categoriesController.create
);
router.put(
  '/:id',
  authenticate,
  validate(updateCategorySchema),
  categoriesController.update
);
router.delete('/:id', authenticate, categoriesController.remove);

export default router;

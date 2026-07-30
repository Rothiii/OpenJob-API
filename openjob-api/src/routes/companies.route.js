import { Router } from 'express';
import * as companiesController from '../controllers/companies.controller.js';
import { authenticate, cache, validate } from '../middlewares/index.js';
import { cacheKeys } from '../utils/cacheKeys.js';
import {
  createCompanySchema,
  updateCompanySchema,
} from '../validators/companies.validator.js';

const router = Router();

router.get('/', companiesController.getAll);
router.get(
  '/:id',
  cache((req) => cacheKeys.companyDetail(req.params.id)),
  companiesController.getById
);

router.post(
  '/',
  authenticate,
  validate(createCompanySchema),
  companiesController.create
);
router.put(
  '/:id',
  authenticate,
  validate(updateCompanySchema),
  companiesController.update
);
router.delete('/:id', authenticate, companiesController.remove);

export default router;

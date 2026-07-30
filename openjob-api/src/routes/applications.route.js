import { Router } from 'express';
import * as applicationsController from '../controllers/applications.controller.js';
import { authenticate, cache, validate } from '../middlewares/index.js';
import { cacheKeys } from '../utils/cacheKeys.js';
import {
  createApplicationSchema,
  updateApplicationSchema,
} from '../validators/applications.validator.js';

const router = Router();

// Every application endpoint requires a logged-in user.
router.use(authenticate);

router.get('/', applicationsController.getAll);
router.get(
  '/user/:userId',
  cache((req) => cacheKeys.applicationsByUser(req.params.userId)),
  applicationsController.getByUserId
);
router.get(
  '/job/:jobId',
  cache((req) => cacheKeys.applicationsByJob(req.params.jobId)),
  applicationsController.getByJobId
);
router.get(
  '/:id',
  cache((req) => cacheKeys.applicationDetail(req.params.id)),
  applicationsController.getById
);

router.post(
  '/',
  validate(createApplicationSchema),
  applicationsController.create
);
router.put(
  '/:id',
  validate(updateApplicationSchema),
  applicationsController.update
);
router.delete('/:id', applicationsController.remove);

export default router;

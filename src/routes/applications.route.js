import { Router } from 'express';
import * as applicationsController from '../controllers/applications.controller.js';
import { authenticate, validate } from '../middlewares/index.js';
import {
  createApplicationSchema,
  updateApplicationSchema,
} from '../validators/applications.validator.js';

const router = Router();

// Every application endpoint requires a logged-in user.
router.use(authenticate);

router.get('/', applicationsController.getAll);
router.get('/user/:userId', applicationsController.getByUserId);
router.get('/job/:jobId', applicationsController.getByJobId);
router.get('/:id', applicationsController.getById);

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

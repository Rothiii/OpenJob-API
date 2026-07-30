import { Router } from 'express';
import * as jobsController from '../controllers/jobs.controller.js';
import * as bookmarksController from '../controllers/bookmarks.controller.js';
import { authenticate, validate } from '../middlewares/index.js';
import { createJobSchema, updateJobSchema } from '../validators/jobs.validator.js';

const router = Router();

// Static segments first so they are not captured by '/:id'.
router.get('/', jobsController.getAll);
router.get('/company/:companyId', jobsController.getByCompanyId);
router.get('/category/:categoryId', jobsController.getByCategoryId);
router.get('/:id', jobsController.getById);

router.post('/', authenticate, validate(createJobSchema), jobsController.create);
router.put(
  '/:id',
  authenticate,
  validate(updateJobSchema),
  jobsController.update
);
router.delete('/:id', authenticate, jobsController.remove);

// Bookmarks are scoped to a job.
router.post('/:jobId/bookmark', authenticate, bookmarksController.create);
router.get('/:jobId/bookmark/:id', authenticate, bookmarksController.getById);
router.delete('/:jobId/bookmark', authenticate, bookmarksController.removeByJob);

export default router;

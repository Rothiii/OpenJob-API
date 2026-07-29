import { Router } from 'express';
import * as bookmarksController from '../controllers/bookmarks.controller.js';
import { authenticate, cache } from '../middlewares/index.js';
import { cacheKeys } from '../utils/cacheKeys.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  // Keyed by user: the list is whatever the caller bookmarked, not a shared page.
  cache((req) => cacheKeys.bookmarksByUser(req.user.id)),
  bookmarksController.getAll
);

export default router;

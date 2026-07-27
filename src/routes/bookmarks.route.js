import { Router } from 'express';
import * as bookmarksController from '../controllers/bookmarks.controller.js';
import { authenticate } from '../middlewares/index.js';

const router = Router();

router.use(authenticate);

router.get('/', bookmarksController.getAll);

export default router;

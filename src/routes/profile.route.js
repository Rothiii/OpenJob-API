import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';
import { authenticate } from '../middlewares/index.js';

const router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.get('/applications', profileController.getApplications);
router.get('/bookmarks', profileController.getBookmarks);

export default router;

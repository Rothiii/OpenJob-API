import { Router } from 'express';
import * as documentsController from '../controllers/documents.controller.js';
import { authenticate, uploadDocument } from '../middlewares/index.js';

const router = Router();

router.get('/', documentsController.getAll);
router.get('/:id', documentsController.getById);

router.post('/', authenticate, uploadDocument, documentsController.create);
router.delete('/:id', authenticate, documentsController.remove);

export default router;

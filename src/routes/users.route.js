import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { validate } from '../middlewares/index.js';
import { registerUserSchema } from '../validators/users.validator.js';

const router = Router();

router.post('/', validate(registerUserSchema), usersController.register);
router.get('/:id', usersController.getById);

export default router;

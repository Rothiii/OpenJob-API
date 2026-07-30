import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { cache, validate } from '../middlewares/index.js';
import { registerUserSchema } from '../validators/users.validator.js';
import { cacheKeys } from '../utils/cacheKeys.js';

const router = Router();

router.post('/', validate(registerUserSchema), usersController.register);
router.get(
  '/:id',
  cache((req) => cacheKeys.userDetail(req.params.id)),
  usersController.getById
);

export default router;

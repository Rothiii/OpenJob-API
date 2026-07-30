import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/index.js';
import { loginSchema, refreshTokenSchema } from '../validators/auth.validator.js';

const router = Router();

// These endpoints are authenticated by the refresh token in the body,
// so they must not require an access token.
router.post('/', validate(loginSchema), authController.login);
router.put('/', validate(refreshTokenSchema), authController.refresh);
router.delete('/', validate(refreshTokenSchema), authController.logout);

export default router;

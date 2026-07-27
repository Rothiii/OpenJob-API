import Joi from 'joi';
import { passwordSchema } from './common/password-validation.js';
import { uuidValidation } from './common/uuid-validation.js';

export const usersValidation = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: passwordSchema,
  role: Joi.string().valid('user', 'admin', 'company').required(),
});

export const usersIdValidation = Joi.object({
  userId: uuidValidation,
});

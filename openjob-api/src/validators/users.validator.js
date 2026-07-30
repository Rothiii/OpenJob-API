import Joi from 'joi';
import { password } from './common/password.validation.js';

export const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string().email().max(255).required(),
  password: password.required(),
  role: Joi.string().valid('user', 'admin', 'company').default('user'),
});

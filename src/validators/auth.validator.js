import Joi from 'joi';
import { passwordInput } from './common/password.validation.js';

export const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: passwordInput.required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

import Joi from 'joi';

export const passwordSchema = Joi.string().required('Password is required');

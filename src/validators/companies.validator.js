import Joi from 'joi';

export const createCompanySchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  location: Joi.string().min(1).max(255).required(),
  description: Joi.string().allow('', null),
});

export const updateCompanySchema = Joi.object({
  name: Joi.string().min(1).max(255),
  location: Joi.string().min(1).max(255),
  description: Joi.string().allow('', null),
}).min(1);

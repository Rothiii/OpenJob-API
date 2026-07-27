import Joi from 'joi';

export const uuidValidation = Joi.string()
  .guid({ version: 'uuidv4' })
  .required();

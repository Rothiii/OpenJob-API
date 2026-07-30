import Joi from 'joi';
import { uuid } from './common/uuid.validation.js';

export const APPLICATION_STATUSES = ['pending', 'accepted', 'rejected'];

export const createApplicationSchema = Joi.object({
  job_id: uuid.required(),
  status: Joi.string().valid(...APPLICATION_STATUSES),
  // The applicant is always taken from the access token; ignore any client value.
  user_id: Joi.any().strip(),
});

export const updateApplicationSchema = Joi.object({
  status: Joi.string()
    .valid(...APPLICATION_STATUSES)
    .required(),
});

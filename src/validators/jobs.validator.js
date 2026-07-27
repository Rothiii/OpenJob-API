import Joi from 'joi';
import { uuid } from './common/uuid.validation.js';

export const JOB_STATUSES = ['draft', 'open', 'close', 'closed'];

const jobFields = {
  company_id: uuid,
  category_id: uuid,
  title: Joi.string().min(1).max(255),
  description: Joi.string().allow('', null),
  job_type: Joi.string().max(255).allow('', null),
  experience_level: Joi.string().max(255).allow('', null),
  location_type: Joi.string().max(255).allow('', null),
  location_city: Joi.string().max(255).allow('', null),
  salary_min: Joi.number().integer().min(0).allow(null),
  salary_max: Joi.number().integer().min(0).allow(null),
  is_salary_visible: Joi.boolean(),
  status: Joi.string().valid(...JOB_STATUSES),
};

export const createJobSchema = Joi.object({
  ...jobFields,
  company_id: jobFields.company_id.required(),
  category_id: jobFields.category_id.required(),
  title: jobFields.title.required(),
});

export const updateJobSchema = Joi.object(jobFields).min(1);

export const searchJobsSchema = Joi.object({
  title: Joi.string().allow(''),
  'company-name': Joi.string().allow(''),
});

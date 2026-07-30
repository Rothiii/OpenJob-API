import * as jobsRepository from '../repositories/jobs.repository.js';
import { NotFoundError } from '../errors/index.js';
import { generateId, isUuid } from '../utils/uuid.js';

const NOT_FOUND = 'Job not found';

/** Columns that are NOT NULL in the database need an explicit fallback. */
const withDefaults = (job) => ({
  description: null,
  job_type: null,
  experience_level: null,
  location_type: null,
  location_city: null,
  salary_min: null,
  salary_max: null,
  ...job,
  is_salary_visible: job.is_salary_visible ?? false,
  status: job.status ?? 'draft',
});

export const getAll = ({ title, companyName } = {}) =>
  jobsRepository.findAll({ title, companyName });

export const getById = async (id) => {
  const job = isUuid(id) ? await jobsRepository.findById(id) : null;

  if (!job) throw new NotFoundError(NOT_FOUND);

  return job;
};

/** Unknown company/category ids simply have no jobs — not an error. */
export const getByCompanyId = (companyId) =>
  isUuid(companyId) ? jobsRepository.findByCompanyId(companyId) : [];

export const getByCategoryId = (categoryId) =>
  isUuid(categoryId) ? jobsRepository.findByCategoryId(categoryId) : [];

export const create = (payload) =>
  jobsRepository.insert(withDefaults({ id: generateId(), ...payload }));

export const update = async (id, payload) => {
  const current = await getById(id);

  return jobsRepository.update(id, withDefaults({ ...current, ...payload }));
};

export const remove = async (id) => {
  const deleted = isUuid(id) ? await jobsRepository.remove(id) : false;

  if (!deleted) throw new NotFoundError(NOT_FOUND);
};

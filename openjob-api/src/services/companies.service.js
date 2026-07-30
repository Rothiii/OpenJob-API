import * as companiesRepository from '../repositories/companies.repository.js';
import { NotFoundError } from '../errors/index.js';
import { generateId, isUuid } from '../utils/uuid.js';
import { deleteCachePattern } from '../utils/redis.js';
import { cachePatterns } from '../utils/cacheKeys.js';

const NOT_FOUND = 'Company not found';

const invalidate = () => deleteCachePattern(cachePatterns.companies);

export const getAll = () => companiesRepository.findAll();

export const getById = async (id) => {
  const company = isUuid(id) ? await companiesRepository.findById(id) : null;

  if (!company) throw new NotFoundError(NOT_FOUND);

  return company;
};

/** The creator becomes the owner: job-application notifications go to them. */
export const create = async ({ name, location, description = null, userId }) => {
  const company = await companiesRepository.insert({
    id: generateId(),
    name,
    location,
    description,
    userId,
  });

  await invalidate();

  return company;
};

export const update = async (id, payload) => {
  const current = await getById(id);

  const updated = await companiesRepository.update(id, {
    ...current,
    ...payload,
  });

  await invalidate();

  return updated;
};

export const remove = async (id) => {
  const deleted = isUuid(id) ? await companiesRepository.remove(id) : false;

  if (!deleted) throw new NotFoundError(NOT_FOUND);

  await invalidate();
};

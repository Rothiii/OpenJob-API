import * as companiesRepository from '../repositories/companies.repository.js';
import { NotFoundError } from '../errors/index.js';
import { generateId, isUuid } from '../utils/uuid.js';

const NOT_FOUND = 'Company not found';

export const getAll = () => companiesRepository.findAll();

export const getById = async (id) => {
  const company = isUuid(id) ? await companiesRepository.findById(id) : null;

  if (!company) throw new NotFoundError(NOT_FOUND);

  return company;
};

export const create = ({ name, location, description = null }) =>
  companiesRepository.insert({
    id: generateId(),
    name,
    location,
    description,
  });

export const update = async (id, payload) => {
  const current = await getById(id);

  return companiesRepository.update(id, { ...current, ...payload });
};

export const remove = async (id) => {
  const deleted = isUuid(id) ? await companiesRepository.remove(id) : false;

  if (!deleted) throw new NotFoundError(NOT_FOUND);
};

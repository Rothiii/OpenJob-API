import * as categoriesRepository from '../repositories/categories.repository.js';
import { NotFoundError } from '../errors/index.js';
import { generateId, isUuid } from '../utils/uuid.js';

const NOT_FOUND = 'Category not found';

export const getAll = () => categoriesRepository.findAll();

export const getById = async (id) => {
  const category = isUuid(id) ? await categoriesRepository.findById(id) : null;

  if (!category) throw new NotFoundError(NOT_FOUND);

  return category;
};

/** Category names are unique; creating an existing one returns it as-is. */
export const create = async ({ name }) => {
  const existing = await categoriesRepository.findByName(name);
  if (existing) return existing;

  return categoriesRepository.insert({ id: generateId(), name });
};

export const update = async (id, { name }) => {
  await getById(id);

  return categoriesRepository.update(id, { name });
};

export const remove = async (id) => {
  const deleted = isUuid(id) ? await categoriesRepository.remove(id) : false;

  if (!deleted) throw new NotFoundError(NOT_FOUND);
};

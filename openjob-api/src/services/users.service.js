import bcrypt from 'bcrypt';
import * as usersRepository from '../repositories/users.repository.js';
import { NotFoundError } from '../errors/index.js';
import { generateId, isUuid } from '../utils/uuid.js';

const SALT_ROUNDS = 10;

/**
 * Registering an already-known email returns the existing account instead of
 * failing, so the test collection can be replayed against a warm database.
 */
export const register = async ({ name, email, password, role }) => {
  const existing = await usersRepository.findByEmail(email);
  if (existing) return existing;

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return usersRepository.insert({
    id: generateId(),
    name,
    email,
    password: hashedPassword,
    role,
  });
};

export const getById = async (id) => {
  // A non-UUID id can never match a row, so skip the query.
  const user = isUuid(id) ? await usersRepository.findById(id) : null;

  if (!user) throw new NotFoundError('User not found');

  return user;
};

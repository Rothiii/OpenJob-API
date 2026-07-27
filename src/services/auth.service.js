import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import * as usersRepository from '../repositories/users.repository.js';
import * as authenticationsRepository from '../repositories/authentications.repository.js';
import { AuthenticationError, InvariantError } from '../errors/index.js';
import { generateId } from '../utils/uuid.js';

const createAccessToken = (userId) =>
  jwt.sign({ id: userId }, env.ACCESS_TOKEN_KEY, {
    expiresIn: env.ACCESS_TOKEN_AGE,
  });

const createRefreshToken = (userId) =>
  jwt.sign({ id: userId }, env.REFRESH_TOKEN_KEY);

export const login = async ({ email, password }) => {
  const user = await usersRepository.findCredentialsByEmail(email);

  if (!user) throw new AuthenticationError('Invalid credentials');

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) throw new AuthenticationError('Invalid credentials');

  const accessToken = createAccessToken(user.id);
  const refreshToken = createRefreshToken(user.id);

  await authenticationsRepository.insertToken({
    id: generateId(),
    token: refreshToken,
    userId: user.id,
  });

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken) => {
  let decoded;

  try {
    decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_KEY);
  } catch {
    throw new InvariantError('Invalid refresh token');
  }

  const stored = await authenticationsRepository.findToken(refreshToken);
  if (!stored) throw new InvariantError('Invalid refresh token');

  return { accessToken: createAccessToken(decoded.id) };
};

export const logout = async (refreshToken) => {
  try {
    jwt.verify(refreshToken, env.REFRESH_TOKEN_KEY);
  } catch {
    throw new InvariantError('Invalid refresh token');
  }

  const deleted = await authenticationsRepository.deleteToken(refreshToken);
  if (!deleted) throw new InvariantError('Refresh token not found');
};

import * as bookmarksRepository from '../repositories/bookmarks.repository.js';
import { InvariantError, NotFoundError } from '../errors/index.js';
import { generateId, isUuid } from '../utils/uuid.js';

const NOT_FOUND = 'Bookmark not found';
const PG_UNIQUE_VIOLATION = '23505';

export const getByUserId = (userId) => bookmarksRepository.findByUserId(userId);

export const getById = async ({ id, jobId, userId }) => {
  const bookmark =
    isUuid(id) && isUuid(jobId)
      ? await bookmarksRepository.findByIdForUser({ id, jobId, userId })
      : null;

  if (!bookmark) throw new NotFoundError(NOT_FOUND);

  return bookmark;
};

export const create = async ({ jobId, userId }) => {
  if (!isUuid(jobId)) throw new NotFoundError('Job not found');

  try {
    return await bookmarksRepository.insert({
      id: generateId(),
      userId,
      jobId,
    });
  } catch (error) {
    if (error.code === PG_UNIQUE_VIOLATION) {
      throw new InvariantError('Bookmark already exists');
    }
    throw error;
  }
};

export const removeByJob = async ({ jobId, userId }) => {
  const deleted = isUuid(jobId)
    ? await bookmarksRepository.removeByUserAndJob({ userId, jobId })
    : false;

  if (!deleted) throw new NotFoundError(NOT_FOUND);
};

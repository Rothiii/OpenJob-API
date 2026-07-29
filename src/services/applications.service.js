import * as applicationsRepository from '../repositories/applications.repository.js';
import { InvariantError, NotFoundError } from '../errors/index.js';
import { generateId, isUuid } from '../utils/uuid.js';
import { deleteCachePattern } from '../utils/redis.js';
import { cachePatterns } from '../utils/cacheKeys.js';
import { publishToQueue } from '../utils/rabbitmq.js';

const NOT_FOUND = 'Application not found';
const PG_UNIQUE_VIOLATION = '23505';

/**
 * Any write changes the detail row and both list endpoints at once, so the
 * whole `applications:*` family is dropped rather than guessed at key by key.
 */
const invalidate = () => deleteCachePattern(cachePatterns.applications);

export const getAll = () => applicationsRepository.findAll();

export const getById = async (id) => {
  const application = isUuid(id)
    ? await applicationsRepository.findById(id)
    : null;

  if (!application) throw new NotFoundError(NOT_FOUND);

  return application;
};

/** Unknown user/job ids simply have no applications — not an error. */
export const getByUserId = (userId) =>
  isUuid(userId) ? applicationsRepository.findByUserId(userId) : [];

export const getByJobId = (jobId) =>
  isUuid(jobId) ? applicationsRepository.findByJobId(jobId) : [];

export const getDetailedByUserId = (userId) =>
  applicationsRepository.findDetailedByUserId(userId);

export const create = async ({ userId, job_id: jobId, status = 'pending' }) => {
  const existing = await applicationsRepository.findByUserAndJob({
    userId,
    jobId,
  });

  if (existing) {
    throw new InvariantError('You have already applied for this job');
  }

  let application;
  try {
    application = await applicationsRepository.insert({
      id: generateId(),
      userId,
      jobId,
      status,
    });
  } catch (error) {
    // Two concurrent applies: the constraint decides, the client still gets 400.
    if (error.code === PG_UNIQUE_VIOLATION) {
      throw new InvariantError('You have already applied for this job');
    }
    throw error;
  }

  await invalidate();

  // Notifying the job owner happens out of band; the applicant does not wait.
  publishToQueue({ application_id: application.id });

  return application;
};

export const updateStatus = async (id, status) => {
  const updated = isUuid(id)
    ? await applicationsRepository.updateStatus(id, status)
    : null;

  if (!updated) throw new NotFoundError(NOT_FOUND);

  await invalidate();

  return updated;
};

export const remove = async (id) => {
  const deleted = isUuid(id) ? await applicationsRepository.remove(id) : false;

  if (!deleted) throw new NotFoundError(NOT_FOUND);

  await invalidate();
};

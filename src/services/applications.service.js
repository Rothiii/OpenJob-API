import * as applicationsRepository from '../repositories/applications.repository.js';
import { NotFoundError } from '../errors/index.js';
import { generateId, isUuid } from '../utils/uuid.js';

const NOT_FOUND = 'Application not found';

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

export const create = ({ userId, job_id: jobId, status = 'pending' }) =>
  applicationsRepository.insert({
    id: generateId(),
    userId,
    jobId,
    status,
  });

export const updateStatus = async (id, status) => {
  const updated = isUuid(id)
    ? await applicationsRepository.updateStatus(id, status)
    : null;

  if (!updated) throw new NotFoundError(NOT_FOUND);

  return updated;
};

export const remove = async (id) => {
  const deleted = isUuid(id) ? await applicationsRepository.remove(id) : false;

  if (!deleted) throw new NotFoundError(NOT_FOUND);
};

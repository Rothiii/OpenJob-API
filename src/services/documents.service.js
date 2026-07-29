import fs from 'node:fs/promises';
import * as documentsRepository from '../repositories/documents.repository.js';
import {
  AuthorizationError,
  InvariantError,
  NotFoundError,
} from '../errors/index.js';
import { generateId, isUuid } from '../utils/uuid.js';

const NOT_FOUND = 'Document not found';

export const getAll = () => documentsRepository.findAll();

export const getByUserId = (userId) =>
  documentsRepository.findByUserId(userId);

export const getById = async (id) => {
  const document = isUuid(id) ? await documentsRepository.findById(id) : null;

  if (!document) throw new NotFoundError(NOT_FOUND);

  return document;
};

export const create = async ({ userId, file }) => {
  if (!file) throw new InvariantError('File is required');

  return documentsRepository.insert({
    id: generateId(),
    userId,
    filename: file.filename,
    originalFilename: file.originalname,
    filePath: file.path,
    fileSize: file.size,
    mimeType: file.mimetype,
  });
};

export const remove = async ({ id, userId }) => {
  const document = await getById(id);

  if (document.user_id !== userId) {
    throw new AuthorizationError('You do not own this document');
  }

  await documentsRepository.remove(id);

  // The row is gone either way; a missing file on disk must not fail the call.
  await fs.unlink(document.file_path).catch(() => {});
};

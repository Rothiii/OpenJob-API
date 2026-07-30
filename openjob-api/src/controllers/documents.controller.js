import fs from 'node:fs';
import path from 'node:path';
import * as documentsService from '../services/documents.service.js';
import { NotFoundError } from '../errors/index.js';

export const getAll = async (req, res) => {
  const documents = await documentsService.getAll();

  res.json({ status: 'success', data: { documents } });
};

/** Streams the stored PDF back so it can be viewed or downloaded directly. */
export const getById = async (req, res) => {
  const document = await documentsService.getById(req.params.id);

  const filePath = path.resolve(document.file_path);
  if (!fs.existsSync(filePath)) {
    throw new NotFoundError('Document file is missing on the server');
  }

  res.setHeader('Content-Type', document.mime_type || 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="${document.original_filename}"`
  );

  fs.createReadStream(filePath).pipe(res);
};

export const create = async (req, res) => {
  const document = await documentsService.create({
    userId: req.user.id,
    file: req.file,
  });

  res.status(201).json({
    status: 'success',
    message: 'Document uploaded',
    data: {
      documentId: document.id,
      filename: document.filename,
      originalName: document.original_filename,
      size: Number(document.file_size),
    },
  });
};

export const remove = async (req, res) => {
  await documentsService.remove({ id: req.params.id, userId: req.user.id });

  res.json({ status: 'success', message: 'Document deleted' });
};

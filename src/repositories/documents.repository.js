import { query } from '../config/database.js';

const COLUMNS = `id, user_id, filename, original_filename, file_path,
                 file_size, mime_type, created_at`;

export const findAll = async () => {
  const result = await query(
    `SELECT ${COLUMNS} FROM documents ORDER BY created_at DESC`
  );
  return result.rows;
};

export const findByUserId = async (userId) => {
  const result = await query(
    `SELECT ${COLUMNS} FROM documents WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await query(`SELECT ${COLUMNS} FROM documents WHERE id = $1`, [
    id,
  ]);
  return result.rows[0] ?? null;
};

export const insert = async ({
  id,
  userId,
  filename,
  originalFilename,
  filePath,
  fileSize,
  mimeType,
}) => {
  const result = await query(
    `INSERT INTO documents
       (id, user_id, filename, original_filename, file_path, file_size, mime_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${COLUMNS}`,
    [id, userId, filename, originalFilename, filePath, fileSize, mimeType]
  );
  return result.rows[0];
};

export const remove = async (id) => {
  const result = await query(
    'DELETE FROM documents WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
};

import { query } from '../config/database.js';

const SELECT_APPLICATION = `
  SELECT a.id, a.status, a.user_id, u.name AS user_name,
         a.job_id, j.title AS job_title, a.created_at, a.updated_at
  FROM applications a
  JOIN users u ON a.user_id = u.id
  JOIN jobs j ON a.job_id = j.id
`;

export const findAll = async () => {
  const result = await query(`${SELECT_APPLICATION} ORDER BY a.created_at DESC`);
  return result.rows;
};

export const findById = async (id) => {
  const result = await query(`${SELECT_APPLICATION} WHERE a.id = $1`, [id]);
  return result.rows[0] ?? null;
};

export const findByUserId = async (userId) => {
  const result = await query(
    `${SELECT_APPLICATION} WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const findByJobId = async (jobId) => {
  const result = await query(
    `${SELECT_APPLICATION} WHERE a.job_id = $1 ORDER BY a.created_at DESC`,
    [jobId]
  );
  return result.rows;
};

/** Applications joined with job details, used by the profile endpoints. */
export const findDetailedByUserId = async (userId) => {
  const result = await query(
    `SELECT a.id, a.status, a.job_id, j.title, j.company_id, j.category_id,
            a.created_at
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     WHERE a.user_id = $1
     ORDER BY a.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const insert = async ({ id, userId, jobId, status }) => {
  const result = await query(
    `INSERT INTO applications (id, user_id, job_id, status)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, userId, jobId, status]
  );
  return result.rows[0];
};

export const updateStatus = async (id, status) => {
  const result = await query(
    `UPDATE applications
     SET status = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );
  return result.rows[0] ?? null;
};

export const remove = async (id) => {
  const result = await query(
    'DELETE FROM applications WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
};

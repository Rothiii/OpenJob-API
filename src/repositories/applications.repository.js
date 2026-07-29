import { query } from '../config/database.js';

const SELECT_APPLICATION = `
  SELECT a.id, a.status, a.user_id, u.name AS user_name, u.email AS user_email,
         a.job_id, j.title AS job_title, j.job_type,
         j.company_id, c.name AS company_name, j.category_id,
         a.created_at, a.updated_at
  FROM applications a
  JOIN users u ON a.user_id = u.id
  JOIN jobs j ON a.job_id = j.id
  JOIN companies c ON j.company_id = c.id
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
    `SELECT a.id, a.user_id, a.job_id, a.status, a.created_at, a.updated_at,
            j.title AS job_title, j.description AS job_description,
            j.job_type, j.experience_level, j.location_type, j.location_city,
            j.company_id, c.name AS company_name, j.category_id
     FROM applications a
     JOIN jobs j ON a.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     WHERE a.user_id = $1
     ORDER BY a.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const findByUserAndJob = async ({ userId, jobId }) => {
  const result = await query(
    'SELECT id FROM applications WHERE user_id = $1 AND job_id = $2',
    [userId, jobId]
  );
  return result.rows[0] ?? null;
};

/** Everything the notification consumer needs, in one round trip. */
export const findNotificationDetails = async (id) => {
  const result = await query(
    `SELECT a.id AS application_id, a.status, a.created_at AS applied_at,
            applicant.id AS applicant_id, applicant.name AS applicant_name,
            applicant.email AS applicant_email,
            j.id AS job_id, j.title AS job_title,
            c.id AS company_id, c.name AS company_name,
            owner.id AS owner_id, owner.name AS owner_name,
            owner.email AS owner_email
     FROM applications a
     JOIN users applicant ON a.user_id = applicant.id
     JOIN jobs j ON a.job_id = j.id
     JOIN companies c ON j.company_id = c.id
     LEFT JOIN users owner ON c.user_id = owner.id
     WHERE a.id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
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

import { query } from '../config/database.js';

// Exactly the fields a job listing needs: the job itself plus the company name
// it is filtered and searched by. Timestamps stay out of the listing payload.
const SELECT_JOB = `
  SELECT j.id, j.company_id, c.name AS company_name, j.category_id,
         j.title, j.description, j.job_type, j.experience_level,
         j.location_type, j.location_city, j.salary_min, j.salary_max,
         j.status
  FROM jobs j
  JOIN companies c ON j.company_id = c.id
  JOIN categories cat ON j.category_id = cat.id
`;

/** @param {{ title?: string, companyName?: string }} filters */
export const findAll = async ({ title, companyName } = {}) => {
  const conditions = [];
  const values = [];

  if (title) {
    values.push(`%${title}%`);
    conditions.push(`j.title ILIKE $${values.length}`);
  }

  if (companyName) {
    values.push(`%${companyName}%`);
    conditions.push(`c.name ILIKE $${values.length}`);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(
    `${SELECT_JOB}${where} ORDER BY j.created_at DESC`,
    values
  );
  return result.rows;
};

export const findById = async (id) => {
  const result = await query(`${SELECT_JOB} WHERE j.id = $1`, [id]);
  return result.rows[0] ?? null;
};

export const findByCompanyId = async (companyId) => {
  const result = await query(
    `${SELECT_JOB} WHERE j.company_id = $1 ORDER BY j.created_at DESC`,
    [companyId]
  );
  return result.rows;
};

export const findByCategoryId = async (categoryId) => {
  const result = await query(
    `${SELECT_JOB} WHERE j.category_id = $1 ORDER BY j.created_at DESC`,
    [categoryId]
  );
  return result.rows;
};

export const insert = async (job) => {
  const result = await query(
    `INSERT INTO jobs (
       id, company_id, category_id, title, description, job_type,
       experience_level, location_type, location_city, salary_min,
       salary_max, is_salary_visible, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING *`,
    [
      job.id,
      job.company_id,
      job.category_id,
      job.title,
      job.description,
      job.job_type,
      job.experience_level,
      job.location_type,
      job.location_city,
      job.salary_min,
      job.salary_max,
      job.is_salary_visible,
      job.status,
    ]
  );
  return result.rows[0];
};

export const update = async (id, job) => {
  const result = await query(
    `UPDATE jobs SET
       company_id = $1, category_id = $2, title = $3, description = $4,
       job_type = $5, experience_level = $6, location_type = $7,
       location_city = $8, salary_min = $9, salary_max = $10,
       is_salary_visible = $11, status = $12, updated_at = CURRENT_TIMESTAMP
     WHERE id = $13
     RETURNING *`,
    [
      job.company_id,
      job.category_id,
      job.title,
      job.description,
      job.job_type,
      job.experience_level,
      job.location_type,
      job.location_city,
      job.salary_min,
      job.salary_max,
      job.is_salary_visible,
      job.status,
      id,
    ]
  );
  return result.rows[0] ?? null;
};

export const remove = async (id) => {
  const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING id', [
    id,
  ]);
  return result.rowCount > 0;
};

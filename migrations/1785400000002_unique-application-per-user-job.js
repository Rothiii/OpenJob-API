/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * A candidate applies to a given job once. The service checks first for a clean
 * error message; this constraint is what makes it true under concurrency.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  // Drop duplicates left by earlier runs, keeping the oldest application.
  pgm.sql(`
    DELETE FROM applications a
    USING applications b
    WHERE a.user_id = b.user_id
      AND a.job_id = b.job_id
      AND a.created_at > b.created_at
  `);

  pgm.addConstraint('applications', 'unique_user_job_application', {
    unique: ['user_id', 'job_id'],
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropConstraint('applications', 'unique_user_job_application');
};

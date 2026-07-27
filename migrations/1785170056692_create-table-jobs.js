/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
	pgm.createTable("jobs", {
    id: {
      type: "uuid",
      primaryKey: true,
      notNull: true,
      default: pgm.func("uuid_generate_v4()"),
    },
    company_id: {
      type: "uuid",
      notNull: true,
      references: 'companies',
      onDelete: "CASCADE",
    },
    category_id: {
      type: "uuid",
      notNull: true,
      references: 'categories',
      onDelete: "CASCADE",
    },
    title: {
      type: "varchar(255)",
      notNull: true,
    },
    description: {
      type: "text",
    },
    job_type: {
      type: "varchar(255)",
    },
    experience_level: {
      type: "varchar(255)",
    },
    location_type: {
      type: "varchar(255)",
    },
    location_city: {
      type: "varchar(255)",
    },
    salary_min: {
      type: "integer",
    },
    salary_max: {
      type: "integer",
    },
    is_salary_visible: {
      type: "boolean",
      notNull: true,
      default: false,
    },
    status: {
      type: "varchar(255)",
      notNull: true,
      default: "draft",
    },
    created_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamp",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {};

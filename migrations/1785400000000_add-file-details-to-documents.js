/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * The upload response has to report where the file lives and how big it is, so
 * those details are stored next to the filename instead of being re-derived.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.addColumns('documents', {
    file_path: { type: 'text', notNull: true, default: '' },
    file_size: { type: 'integer', notNull: true, default: 0 },
    mime_type: { type: 'varchar(255)', notNull: true, default: 'application/pdf' },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropColumns('documents', ['file_path', 'file_size', 'mime_type']);
};

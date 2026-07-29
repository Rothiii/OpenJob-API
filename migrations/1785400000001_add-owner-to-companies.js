/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * The application-notification consumer has to reach the person who owns the
 * job, and a job only knows its company — so the company records its owner.
 * Nullable, because rows created before this migration have no known owner.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const up = (pgm) => {
  pgm.addColumns('companies', {
    user_id: {
      type: 'uuid',
      references: 'users',
      onDelete: 'SET NULL',
    },
  });

  pgm.createIndex('companies', 'user_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
export const down = (pgm) => {
  pgm.dropColumns('companies', ['user_id']);
};

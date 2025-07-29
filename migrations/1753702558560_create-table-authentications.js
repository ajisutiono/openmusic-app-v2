/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

module.exports = {
  shorthands: undefined,

  up(pgm) {
    pgm.createTable('authentications', {
      token: {
        type: 'TEXT',
        notNull: true,
      },
    });
  },

  down(pgm) {
    pgm.dropTable('authentications');
  },
};

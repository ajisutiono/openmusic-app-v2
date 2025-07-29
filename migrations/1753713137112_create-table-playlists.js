/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

module.exports = {
  shorthands: undefined,

  // membuat table playlists
  up(pgm) {
    pgm.createTable('playlists', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      name: {
        type: 'TEXT',
        notNull: true,
      },
      owner: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
    });

    // menambahkan foreign key untuk owner
    pgm.addConstraint('playlists', 'fk_playlists.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE');
  },

  down(pgm) {
    // menghapus tabel playlists
    pgm.dropTable('playlists');
  },
};

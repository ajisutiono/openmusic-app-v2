/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

module.exports = {
  up(pgm) {
    pgm.addConstraint('songs', 'fk_songs.album_id_albums.id', 'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE');
  },

  down(pgm) {
    pgm.dropConstraint('songs', 'fk_songs.album_id_albums.id');
  },
};
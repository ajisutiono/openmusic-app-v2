/* eslint-disable camelcase */
/**
 * @type {import('node-pg-migrate').MigrationBuilder}
 */

module.exports = {
  shorthands: undefined,

  // membuat table playlists_song
  up(pgm) {
    pgm.createTable('playlist_songs', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      playlist_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
      song_id: {
        type: 'VARCHAR(50)',
        notNull: true,
      },
    });

    // menambahkan foreign key untuk playlist_id dan song_id
    pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE');
    pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE');
  },

  down(pgm) {
    // menghapus tabel playlist_songs
    pgm.dropTable('playlist_songs');
  },
};

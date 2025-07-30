const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists (id, name, owner) VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new InvariantError('Playlist gagal ditambahkan');
    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `
      SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
      WHERE playlists.owner = $1 OR collaborations.user_id = $1
      GROUP BY playlists.id, users.username
    `,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT owner FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        // throw error;
        throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
      }
    }
  }

  async addSongToPlaylistById(playlistId, songId) {
    // check song availablity
    const songCheckQuery = {
      text: 'SELECT id FROM songs WHERE id = $1',
      values: [songId],
    };
    const songResult = await this._pool.query(songCheckQuery);
    if (!songResult.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    // jika ada song maka bisa diinsert ke playlist
    const id = `playlist-song-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3)',
      values: [id, playlistId, songId],
    };
    await this._pool.query(query);
  }

  async getSongsFromPlaylistById(playlistId) {
    const playlistQuery = {
      text: `
      SELECT playlists.id, playlists.name, users.username
      FROM playlists
      JOIN users ON playlists.owner = users.id
      WHERE playlists.id = $1
    `,
      values: [playlistId],
    };
    const songsQuery = {
      text: `
      SELECT songs.id, songs.title, songs.performer
      FROM playlist_songs
      JOIN songs ON playlist_songs.song_id = songs.id
      WHERE playlist_songs.playlist_id = $1
    `,
      values: [playlistId],
    };

    const playlistResult = await this._pool.query(playlistQuery);
    const songsResult = await this._pool.query(songsQuery);

    if (!playlistResult.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = playlistResult.rows[0];
    playlist.songs = songsResult.rows;
    return playlist;
  }

  async deleteSongFromPlaylistById(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [playlistId, songId],
    };
    await this._pool.query(query);
  }
}

module.exports = PlaylistsService;
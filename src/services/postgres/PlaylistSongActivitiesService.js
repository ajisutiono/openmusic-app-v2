const { nanoid } = require('nanoid');
const { Pool } = require('pg');

class PlaylistSongActivitiesService {
  constructor() {
    this._pool = new Pool();
  }

  async addActivity({ playlistId, songId, userId, action }) {
    const id = `activity-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO playlist_song_activities 
        (id, playlist_id, song_id, user_id, action)
        VALUES ($1, $2, $3, $4, $5)`,
      values: [id, playlistId, songId, userId, action],
    };

    await this._pool.query(query);
  }

  async getActivities(playlistId) {
    const query = {
      text: `
        SELECT users.username, songs.title, act.action, act.time
        FROM playlist_song_activities act
        JOIN users ON act.user_id = users.id
        JOIN songs ON act.song_id = songs.id
        WHERE act.playlist_id = $1
        ORDER BY act.time ASC
      `,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;

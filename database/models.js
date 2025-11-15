// Database Models

export const SongModel = {
  tableName: 'songs',
  schema: `
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      thumbnail_location TEXT,
      song_location TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
};

export const PlaylistModel = {
  tableName: 'playlists',
  schema: `
    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      thumbnail_location TEXT,
      songs_queue TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
};

// Model Classes
export class Song {
  constructor(id, title, thumbnailLocation, songLocation) {
    this.id = id;
    this.title = title;
    this.thumbnailLocation = thumbnailLocation;
    this.songLocation = songLocation;
  }
}

export class Playlist {
  constructor(id, title, thumbnailLocation, songsQueue) {
    this.id = id;
    this.title = title;
    this.thumbnailLocation = thumbnailLocation;
    this.songsQueue = songsQueue; // Array of song IDs
  }
}

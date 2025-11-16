// Database Models

export const SongModel = {
  tableName: 'songs',
  schema: `
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      thumbnail_location TEXT,
      song_location TEXT NOT NULL,
      duration INTEGER DEFAULT 0,
      video_id TEXT,
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
      playing_queue TEXT,
      total_duration INTEGER DEFAULT 0,
      description TEXT,
      sort_method TEXT DEFAULT 'recently_added',
      is_shuffle INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
};

export const CategoryModel = {
  tableName: 'categories',
  schema: `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      playlist_ids TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      is_pinned INTEGER DEFAULT 0,
      is_hidden INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,
};

// Model Classes
export class Song {
  constructor(id, title, thumbnailLocation, songLocation, duration, videoId, createdAt) {
    this.id = id;
    this.title = title;
    this.thumbnailLocation = thumbnailLocation;
    this.songLocation = songLocation;
    this.duration = duration;
    this.videoId = videoId;
    this.createdAt = createdAt;
  }
}

export class Playlist {
  constructor(id, title, thumbnailLocation, songsQueue, totalDuration, description, playingQueue, sortMethod, isShuffle) {
    this.id = id;
    this.title = title;
    this.thumbnailLocation = thumbnailLocation;
    this.songsQueue = songsQueue;
    this.totalDuration = totalDuration;
    this.description = description;
    this.playingQueue = playingQueue || songsQueue;
    this.sortMethod = sortMethod || 'recently_added';
    this.isShuffle = isShuffle || false;
  }
}

export class Category {
  constructor(id, title, playlistIds, orderIndex = 0, isPinned = false, isHidden = false) {
    this.id = id;
    this.title = title;
    this.playlistIds = playlistIds;
    this.orderIndex = orderIndex;
    this.isPinned = isPinned;
    this.isHidden = isHidden;
  }
}

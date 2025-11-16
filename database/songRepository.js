import { getDatabase } from './db';
import { Song } from './models';

export const getAllSongs = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync('SELECT * FROM songs ORDER BY created_at DESC');
  return result.map(
    (row) => new Song(row.id, row.title, row.thumbnail_location, row.song_location, row.duration, row.video_id, row.created_at)
  );
};

export const getSongById = async (id) => {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT * FROM songs WHERE id = ?', [id]);
  if (!result) return null;
  return new Song(result.id, result.title, result.thumbnail_location, result.song_location, result.duration, result.video_id, result.created_at);
};

export const getSongByVideoId = async (videoId) => {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT * FROM songs WHERE video_id = ?', [videoId]);
  if (!result) return null;
  return new Song(result.id, result.title, result.thumbnail_location, result.song_location, result.duration, result.video_id, result.created_at);
};

export const getSongsByPlaylistId = async (playlistId) => {
  const db = getDatabase();
  const playlist = await db.getFirstAsync('SELECT songs_queue FROM playlists WHERE id = ?', [
    playlistId,
  ]);
  if (!playlist) return [];

  const songIds = JSON.parse(playlist.songs_queue);
  if (!songIds.length) return [];

  const placeholders = songIds.map(() => '?').join(',');
  const songs = await db.getAllAsync(`SELECT * FROM songs WHERE id IN (${placeholders})`, songIds);

  const songMap = new Map(
    songs.map((s) => [s.id, new Song(s.id, s.title, s.thumbnail_location, s.song_location, s.duration, s.video_id, s.created_at)])
  );
  return songIds.map((id) => songMap.get(id)).filter(Boolean);
};

export const addSong = async (title, thumbnailLocation, songLocation, duration = 0, videoId = null) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO songs (title, thumbnail_location, song_location, duration, video_id) VALUES (?, ?, ?, ?, ?)',
    [title, thumbnailLocation, songLocation, duration, videoId]
  );
  return result.lastInsertRowId;
};

export const deleteSong = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM songs WHERE id = ?', [id]);
};

export const updateSong = async (id, title, thumbnailLocation, songLocation, duration, videoId) => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE songs SET title = ?, thumbnail_location = ?, song_location = ?, duration = ?, video_id = ? WHERE id = ?',
    [title, thumbnailLocation, songLocation, duration, videoId, id]
  );
};

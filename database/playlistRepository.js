import { getDatabase } from './db';
import { Playlist } from './models';

export const getAllPlaylists = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync('SELECT * FROM playlists ORDER BY created_at DESC');
  return result.map(row => new Playlist(row.id, row.title, row.thumbnail_location, JSON.parse(row.songs_queue)));
};

export const getPlaylistById = async (id) => {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT * FROM playlists WHERE id = ?', [id]);
  if (!result) return null;
  return new Playlist(result.id, result.title, result.thumbnail_location, JSON.parse(result.songs_queue));
};

export const addPlaylist = async (title, thumbnailLocation, songsQueue = []) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO playlists (title, thumbnail_location, songs_queue) VALUES (?, ?, ?)',
    [title, thumbnailLocation, JSON.stringify(songsQueue)]
  );
  return result.lastInsertRowId;
};

export const deletePlaylist = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM playlists WHERE id = ?', [id]);
};

export const updatePlaylist = async (id, title, thumbnailLocation, songsQueue) => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE playlists SET title = ?, thumbnail_location = ?, songs_queue = ? WHERE id = ?',
    [title, thumbnailLocation, JSON.stringify(songsQueue), id]
  );
};

export const updatePlaylistQueue = async (id, songsQueue) => {
  const db = getDatabase();
  await db.runAsync('UPDATE playlists SET songs_queue = ? WHERE id = ?', [JSON.stringify(songsQueue), id]);
};

export const addSongToPlaylist = async (playlistId, songId) => {
  const playlist = await getPlaylistById(playlistId);
  if (!playlist) throw new Error('Playlist not found');
  
  const updatedQueue = [...playlist.songsQueue, songId];
  await updatePlaylistQueue(playlistId, updatedQueue);
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
  const playlist = await getPlaylistById(playlistId);
  if (!playlist) throw new Error('Playlist not found');
  
  const updatedQueue = playlist.songsQueue.filter(id => id !== songId);
  await updatePlaylistQueue(playlistId, updatedQueue);
};

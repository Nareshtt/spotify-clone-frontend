import { getDatabase } from './db';
import { Playlist } from './models';

export const getAllPlaylists = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync('SELECT * FROM playlists ORDER BY created_at DESC');
  return result.map(
    (row) =>
      new Playlist(
        row.id,
        row.title,
        row.thumbnail_location,
        JSON.parse(row.songs_queue),
        row.total_duration,
        row.description,
        row.playing_queue ? JSON.parse(row.playing_queue) : null,
        row.sort_method,
        row.is_shuffle === 1
      )
  );
};

export const getPlaylistById = async (id) => {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT * FROM playlists WHERE id = ?', [id]);
  if (!result) return null;
  return new Playlist(
    result.id,
    result.title,
    result.thumbnail_location,
    JSON.parse(result.songs_queue),
    result.total_duration,
    result.description,
    result.playing_queue ? JSON.parse(result.playing_queue) : null,
    result.sort_method,
    result.is_shuffle === 1
  );
};

export const addPlaylist = async (
  title,
  thumbnailLocation,
  songsQueue = [],
  totalDuration = 0,
  description = ''
) => {
  const db = getDatabase();
  const result = await db.runAsync(
    'INSERT INTO playlists (title, thumbnail_location, songs_queue, total_duration, description) VALUES (?, ?, ?, ?, ?)',
    [title, thumbnailLocation, JSON.stringify(songsQueue), totalDuration, description]
  );
  return result.lastInsertRowId;
};

export const deletePlaylist = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM playlists WHERE id = ?', [id]);
};

export const updatePlaylist = async (
  id,
  title,
  thumbnailLocation,
  songsQueue,
  totalDuration,
  description
) => {
  const db = getDatabase();
  await db.runAsync(
    'UPDATE playlists SET title = ?, thumbnail_location = ?, songs_queue = ?, total_duration = ?, description = ? WHERE id = ?',
    [title, thumbnailLocation, JSON.stringify(songsQueue), totalDuration, description, id]
  );
};

export const updatePlaylistQueue = async (id, songsQueue) => {
  const db = getDatabase();
  await db.runAsync('UPDATE playlists SET songs_queue = ? WHERE id = ?', [
    JSON.stringify(songsQueue),
    id,
  ]);
};

export const updatePlayingQueue = async (id, playingQueue) => {
  const db = getDatabase();
  await db.runAsync('UPDATE playlists SET playing_queue = ? WHERE id = ?', [
    JSON.stringify(playingQueue),
    id,
  ]);
};

export const rebuildPlaylistQueues = async (playlistId, currentPlayingVideoId = null) => {
  const db = getDatabase();
  const playlist = await getPlaylistById(playlistId);
  if (!playlist) return;

  console.log('\n=== REBUILD QUEUES START ===');
  console.log('Playlist ID:', playlistId);
  console.log('Current Playing VideoId:', currentPlayingVideoId);
  console.log('Shuffle:', playlist.isShuffle);
  console.log('Sort Method:', playlist.sortMethod);

  const { getAllSongs, getSongByVideoId } = require('./songRepository');
  const allSongs = await getAllSongs();
  const playlistSongs = allSongs.filter((s) => playlist.songsQueue.includes(s.id));

  // Convert videoId to songId if provided
  let currentPlayingSongId = null;
  if (currentPlayingVideoId) {
    const currentSong = await getSongByVideoId(currentPlayingVideoId);
    if (currentSong) {
      currentPlayingSongId = currentSong.id;
      console.log('Current Playing SongId:', currentPlayingSongId);
    }
  }

  // Sort songs_queue based on sort_method
  let sortedQueue = [...playlist.songsQueue];
  if (playlist.sortMethod === 'title') {
    const songMap = Object.fromEntries(playlistSongs.map((s) => [s.id, s.title]));
    sortedQueue.sort((a, b) => (songMap[a] || '').localeCompare(songMap[b] || ''));
  } else if (playlist.sortMethod === 'duration') {
    const songMap = Object.fromEntries(playlistSongs.map((s) => [s.id, s.duration]));
    sortedQueue.sort((a, b) => (songMap[a] || 0) - (songMap[b] || 0));
  } else if (playlist.sortMethod === 'recently_added') {
    const songMap = Object.fromEntries(playlistSongs.map((s) => [s.id, s.createdAt]));
    sortedQueue.sort((a, b) => new Date(songMap[b] || 0) - new Date(songMap[a] || 0));
  } else if (playlist.sortMethod === 'random') {
    sortedQueue = [...playlist.songsQueue].sort(() => Math.random() - 0.5);
  }

  console.log('Sorted Queue:', sortedQueue);

  // Build playing_queue
  let playingQueue = [...sortedQueue];

  if (playlist.isShuffle) {
    // SHUFFLE ON: Create a shuffled version
    // Fisher-Yates shuffle
    for (let i = playingQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [playingQueue[i], playingQueue[j]] = [playingQueue[j], playingQueue[i]];
    }
    console.log('Shuffled Playing Queue:', playingQueue);

    // Put current playing song first
    if (currentPlayingSongId && playingQueue.includes(currentPlayingSongId)) {
      const currentIdx = playingQueue.indexOf(currentPlayingSongId);
      playingQueue = [...playingQueue.slice(currentIdx), ...playingQueue.slice(0, currentIdx)];
      console.log('Adjusted Playing Queue (current song first):', playingQueue);
    }
  } else {
    // SHUFFLE OFF: playing_queue should match songs_queue exactly
    // If there's a current playing song, start from that position in the sorted order
    if (currentPlayingSongId && playingQueue.includes(currentPlayingSongId)) {
      const currentIdx = playingQueue.indexOf(currentPlayingSongId);
      playingQueue = [...playingQueue.slice(currentIdx), ...playingQueue.slice(0, currentIdx)];
      console.log('Shuffle OFF - Adjusted to start from current song:', playingQueue);
    } else {
      console.log('Shuffle OFF - playing_queue same as songs_queue:', playingQueue);
    }
  }

  await db.runAsync('UPDATE playlists SET songs_queue = ?, playing_queue = ? WHERE id = ?', [
    JSON.stringify(sortedQueue),
    JSON.stringify(playingQueue),
    playlistId,
  ]);

  console.log('=== REBUILD QUEUES END ===\n');
};

export const addSongToPlaylist = async (
  playlistId,
  songId,
  songDuration = 0,
  songThumbnail = null,
  currentPlayingVideoId = null
) => {
  const db = getDatabase();
  const playlist = await getPlaylistById(playlistId);
  if (!playlist) throw new Error('Playlist not found');

  const updatedQueue = [...playlist.songsQueue, songId];
  const newTotalDuration = (playlist.totalDuration || 0) + songDuration;

  // If playlist has no thumbnail and this is the first song, use song's thumbnail
  if (!playlist.thumbnailLocation && updatedQueue.length === 1 && songThumbnail) {
    await db.runAsync(
      'UPDATE playlists SET songs_queue = ?, total_duration = ?, thumbnail_location = ? WHERE id = ?',
      [JSON.stringify(updatedQueue), newTotalDuration, songThumbnail, playlistId]
    );
  } else {
    await db.runAsync('UPDATE playlists SET songs_queue = ?, total_duration = ? WHERE id = ?', [
      JSON.stringify(updatedQueue),
      newTotalDuration,
      playlistId,
    ]);
  }

  await rebuildPlaylistQueues(playlistId, currentPlayingVideoId);
};

export const removeSongFromPlaylist = async (
  playlistId,
  songId,
  songDuration = 0,
  currentPlayingVideoId = null
) => {
  const db = getDatabase();
  const playlist = await getPlaylistById(playlistId);
  if (!playlist) throw new Error('Playlist not found');

  const updatedQueue = playlist.songsQueue.filter((id) => id !== songId);
  const newTotalDuration = Math.max(0, (playlist.totalDuration || 0) - songDuration);

  await db.runAsync('UPDATE playlists SET songs_queue = ?, total_duration = ? WHERE id = ?', [
    JSON.stringify(updatedQueue),
    newTotalDuration,
    playlistId,
  ]);

  await rebuildPlaylistQueues(playlistId, currentPlayingVideoId);
};

export const updatePlaylistSortMethod = async (
  playlistId,
  sortMethod,
  currentPlayingVideoId = null
) => {
  const db = getDatabase();
  console.log('\nUpdating sort method in DB:', sortMethod, 'for playlist:', playlistId);
  await db.runAsync('UPDATE playlists SET sort_method = ? WHERE id = ?', [sortMethod, playlistId]);
  console.log('Sort method updated, rebuilding queues...');
  await rebuildPlaylistQueues(playlistId, currentPlayingVideoId);
};

export const updatePlaylistShuffle = async (
  playlistId,
  isShuffle,
  currentPlayingVideoId = null
) => {
  const db = getDatabase();
  console.log('\nUpdating shuffle in DB:', isShuffle, 'for playlist:', playlistId);
  await db.runAsync('UPDATE playlists SET is_shuffle = ? WHERE id = ?', [
    isShuffle ? 1 : 0,
    playlistId,
  ]);
  console.log('Shuffle updated, rebuilding queues...');
  await rebuildPlaylistQueues(playlistId, currentPlayingVideoId);
};

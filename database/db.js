import * as SQLite from 'expo-sqlite';
import { SongModel, PlaylistModel, CategoryModel } from './models';
import { Asset } from 'expo-asset';

let db = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('juxtify.db');
    
    await db.execAsync(SongModel.schema);
    await db.execAsync(PlaylistModel.schema);
    await db.execAsync(CategoryModel.schema);
    
    // Migration: Add new fields if they don't exist
    try {
      await db.execAsync('ALTER TABLE playlists ADD COLUMN sort_method TEXT DEFAULT "recently_added"');
      await db.execAsync('ALTER TABLE playlists ADD COLUMN is_shuffle INTEGER DEFAULT 0');
    } catch (e) {
      // Columns already exist
    }
    
    const playlists = await db.getAllAsync('SELECT * FROM playlists');
    let allSongsId, likedSongsId;
    if (playlists.length === 0) {
      const allSongsThumb = Asset.fromModule(require('../assets/allSongsThumbnail.jpeg')).uri;
      const likedSongsThumb = Asset.fromModule(require('../assets/likedSongsThumbnail.jpeg')).uri;
      
      const allSongsResult = await db.runAsync(
        'INSERT INTO playlists (title, thumbnail_location, songs_queue) VALUES (?, ?, ?)',
        ['All Songs', allSongsThumb, '[]']
      );
      allSongsId = allSongsResult.lastInsertRowId;
      
      const likedSongsResult = await db.runAsync(
        'INSERT INTO playlists (title, thumbnail_location, songs_queue) VALUES (?, ?, ?)',
        ['Liked Songs', likedSongsThumb, '[]']
      );
      likedSongsId = likedSongsResult.lastInsertRowId;
      
      console.log('✓ Default playlists created');
    }
    
    const categories = await db.getAllAsync('SELECT * FROM categories');
    if (categories.length === 0) {
      const playlistIds = allSongsId && likedSongsId ? [allSongsId, likedSongsId] : [];
      
      await db.runAsync(
        'INSERT INTO categories (title, playlist_ids) VALUES (?, ?)',
        ['Playlists', JSON.stringify(playlistIds)]
      );
      
      const otherCategories = ['Albums', 'Podcasts', 'Motivational'];
      for (const category of otherCategories) {
        await db.runAsync(
          'INSERT INTO categories (title, playlist_ids) VALUES (?, ?)',
          [category, '[]']
        );
      }
      console.log('✓ Default categories created');
    }
    
    console.log('✓ Database initialized');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

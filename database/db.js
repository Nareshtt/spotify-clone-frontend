import * as SQLite from 'expo-sqlite';
import { SongModel, PlaylistModel } from './models';

let db = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('juxtify.db');
    
    await db.execAsync(SongModel.schema);
    await db.execAsync(PlaylistModel.schema);
    
    console.log('Database initialized successfully');
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

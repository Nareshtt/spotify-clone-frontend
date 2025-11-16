import { cacheDirectory, downloadAsync, copyAsync, makeDirectoryAsync, getInfoAsync } from 'expo-file-system/legacy';
import { addSong } from './songRepository';

const THUMBNAIL_DIR = cacheDirectory + 'Juxtify/thumbnails/';
const SONG_DIR = cacheDirectory + 'Juxtify/songs/';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

async function ensureDirectoriesExist() {
  const thumbInfo = await getInfoAsync(THUMBNAIL_DIR);
  if (!thumbInfo.exists) {
    await makeDirectoryAsync(THUMBNAIL_DIR, { intermediates: true });
  }
  const songInfo = await getInfoAsync(SONG_DIR);
  if (!songInfo.exists) {
    await makeDirectoryAsync(SONG_DIR, { intermediates: true });
  }
}

export async function downloadAndStoreSong(title, remoteThumbnailUrl, remoteSongUrl, duration = 0, videoId = null) {
  console.log('\n=== DOWNLOAD AND STORE SONG STARTED ===');
  console.log('Song Title:', title);
  console.log('Duration:', duration, 'seconds');
  console.log('Video ID:', videoId);

  try {
    await ensureDirectoriesExist();

    const thumbnailFilename = `${generateUUID()}.jpg`;
    const songFilename = `${generateUUID()}.mp3`;
    const localThumbnailUri = THUMBNAIL_DIR + thumbnailFilename;
    const localSongUri = SONG_DIR + songFilename;

    console.log('\n📥 Downloading thumbnail...');
    await downloadAsync(remoteThumbnailUrl, localThumbnailUri);
    console.log('✓ Thumbnail downloaded');

    console.log('\n📥 Copying song...');
    await copyAsync({ from: remoteSongUrl, to: localSongUri });
    console.log('✓ Song copied');

    console.log('\n💾 Storing in database...');
    const songId = await addSong(title, localThumbnailUri, localSongUri, duration, videoId);
    console.log('✓ Stored in database with ID:', songId);
    console.log('=== COMPLETED ===\n');

    return { songId, localThumbnailUri, localSongUri, duration };
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

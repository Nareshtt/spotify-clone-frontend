import { documentDirectory, downloadAsync, copyAsync } from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { addSong } from './songRepository';

const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

async function requestPermissions() {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Media library permission denied');
  }
  console.log('✓ Media library permission granted');
}

async function getOrCreateAlbum(albumName) {
  const album = await MediaLibrary.getAlbumAsync(albumName);
  if (album) {
    console.log(`✓ Album "${albumName}" exists`);
    return album;
  }
  console.log(`Creating album "${albumName}"...`);
  const asset = await MediaLibrary.createAssetAsync(documentDirectory + 'temp.mp3');
  const newAlbum = await MediaLibrary.createAlbumAsync(albumName, asset, false);
  await MediaLibrary.deleteAssetsAsync([asset]);
  console.log(`✓ Album "${albumName}" created`);
  return newAlbum;
}

export async function downloadAndStoreSong(title, remoteThumbnailUrl, remoteSongUrl) {
  console.log('\n=== DOWNLOAD AND STORE SONG STARTED ===');
  console.log('Song Title:', title);

  try {
    await requestPermissions();

    const tempThumbnail = documentDirectory + `${generateUUID()}.jpg`;
    const tempSong = documentDirectory + `${generateUUID()}.mp3`;

    console.log('\n📥 Downloading thumbnail...');
    await downloadAsync(remoteThumbnailUrl, tempThumbnail);
    console.log('✓ Thumbnail downloaded');

    console.log('\n📥 Copying song to temp...');
    await copyAsync({ from: remoteSongUrl, to: tempSong });
    console.log('✓ Song copied');

    console.log('\n💾 Saving to Music folder...');
    const songAsset = await MediaLibrary.createAssetAsync(tempSong);
    await MediaLibrary.createAlbumAsync('Juxtify', songAsset, false);
    console.log('✓ Song saved to /Music/Juxtify/');
    console.log('  Asset URI:', songAsset.uri);

    const thumbnailAsset = await MediaLibrary.createAssetAsync(tempThumbnail);
    console.log('✓ Thumbnail saved to gallery');

    console.log('\n💾 Storing in database...');
    const songId = await addSong(title, thumbnailAsset.uri, songAsset.uri);
    console.log('✓ Stored in database with ID:', songId);
    console.log('\n=== COMPLETED ===\n');

    return { songId, localThumbnailUri: thumbnailAsset.uri, localSongUri: songAsset.uri };
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

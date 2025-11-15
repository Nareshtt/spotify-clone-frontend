import {
  createDownloadResumable,
  documentDirectory,
  getInfoAsync,
  readAsStringAsync,
  EncodingType,
} from 'expo-file-system/legacy';
import { downloadAndStoreSong } from '../database/songStoring';

export const downloadVideo = async (video, onProgress) => {
  try {
    const fileName = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
    const fileUri = `${documentDirectory}${fileName}`;

    console.log('📥 Starting download for:', video.title);
    console.log('📁 Saving to:', fileUri);

    const downloadUrl = `https://juxtify-music.loca.lt/api/download/?url=${encodeURIComponent(video.url)}`;
    console.log('🔗 Download URL:', downloadUrl);

    // Create progress callback
    const callback = (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      const progressPercent = progress * 100;
      if (onProgress && !isNaN(progressPercent)) {
        onProgress(progressPercent);
      }
    };

    // Create download resumable with progress tracking
    const downloadResumable = createDownloadResumable(
      downloadUrl,
      fileUri,
      {
        headers: {
          Accept: 'audio/mpeg, audio/*, */*',
        },
      },
      callback
    );

    // Start the download
    const result = await downloadResumable.downloadAsync();

    console.log('📊 Download complete');
    console.log('📊 Result:', result);

    if (result && result.uri) {
      // Verify the file exists and get its info
      const fileInfo = await getInfoAsync(result.uri);
      console.log('📄 File exists:', fileInfo.exists);
      console.log('📄 File size:', fileInfo.size, 'bytes');

      if (!fileInfo.exists) {
        throw new Error('File was downloaded but does not exist');
      }

      if (fileInfo.size === 0) {
        throw new Error('Downloaded file is empty (0 bytes)');
      }

      // Verify file is at least 100KB (a very short audio clip)
      if (fileInfo.size < 100000) {
        throw new Error(
          `File too small (${fileInfo.size} bytes) - likely an error page. Check backend logs!`
        );
      }

      // Read first few bytes to check file type
      try {
        const firstChars = await readAsStringAsync(result.uri, {
          encoding: EncodingType.UTF8,
          length: 50,
          position: 0,
        });
        console.log('📝 First 50 chars:', firstChars.substring(0, 50));

        // Check if it's HTML error page
        if (
          firstChars.toLowerCase().includes('<!doctype') ||
          firstChars.toLowerCase().includes('<html') ||
          firstChars.toLowerCase().includes('{"error')
        ) {
          throw new Error('Backend returned error/HTML instead of audio. Check Django logs!');
        }
      } catch (readError) {
        // This is OK - binary MP3 files can't be read as UTF8
        console.log('⚠️ Cannot read as text (expected for binary MP3)');
      }

      // Ensure the URI has file:// prefix
      const finalUri = result.uri.startsWith('file://') ? result.uri : `file://${result.uri}`;

      console.log('✓ Download complete:', finalUri);
      console.log('✓ File size:', (fileInfo.size / 1024 / 1024).toFixed(2), 'MB');

      // Store in database with thumbnail
      const thumbnailUrl = video.thumbnail || 'https://via.placeholder.com/300';
      const storeResult = await downloadAndStoreSong(video.title, thumbnailUrl, finalUri);
      console.log('✓ Stored in database with ID:', storeResult.songId);

      return {
        success: true,
        uri: finalUri,
        fileName: fileName,
        size: fileInfo.size,
        songId: storeResult.songId,
      };
    } else {
      throw new Error('Download failed - no result URI');
    }
  } catch (error) {
    console.error('✗ Download error:', error.message);
    throw new Error(error.message || 'Failed to download audio');
  }
};

export const sanitizeFileName = (title) => {
  return title.replace(/[^a-zA-Z0-9]/g, '_');
};

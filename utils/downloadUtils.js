import {
  downloadAsync,
  documentDirectory,
  getInfoAsync,
  readAsStringAsync,
} from 'expo-file-system/legacy';

export const downloadVideo = async (video) => {
  try {
    const fileName = `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
    const fileUri = `${documentDirectory}${fileName}`;

    console.log('📥 Starting download for:', video.title);
    console.log('📁 Saving to:', fileUri);

    const downloadUrl = `https://juxtify-music.loca.lt/api/download/?url=${encodeURIComponent(video.url)}`;
    console.log('🔗 Download URL:', downloadUrl);

    const result = await downloadAsync(downloadUrl, fileUri, {
      headers: {
        Accept: 'audio/mpeg, audio/*, */*',
      },
    });

    console.log('📊 Response status:', result.status);
    console.log('📊 Response headers:', JSON.stringify(result.headers, null, 2));

    if (result.status !== 200) {
      throw new Error(`Server returned status ${result.status}`);
    }

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
          encoding: 'utf8',
          length: 50,
          position: 0,
        });
        console.log('📝 First 50 chars:', firstChars.substring(0, 50));

        // Check if it's HTML error page
        if (
          firstChars.toLowerCase().includes('<!doctype') ||
          firstChars.toLowerCase().includes('<html') ||
          firstChars.toLowerCase().includes('{\"error')
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

      return {
        success: true,
        uri: finalUri,
        fileName: fileName,
        size: fileInfo.size,
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

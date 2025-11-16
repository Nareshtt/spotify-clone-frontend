import { View, Text, Image, TouchableOpacity, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { getThumbnailUrl } from '@/utils/uiUtils';
import { downloadVideo } from '@/utils/downloadUtils';
import icons from '@/constants/icons';
import AddToPlaylist from '../AddToPlaylist';
import { addSongToPlaylist } from '@/database/playlistRepository';
import { getSongByVideoId } from '@/database/songRepository';

const YoutubeVideoHolder = ({ thumbnail, videoDuration, channelName, title, url, videoId }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [downloadedSongId, setDownloadedSongId] = useState(null);
  const [songDuration, setSongDuration] = useState(0);

  useEffect(() => {
    checkIfDownloaded();
  }, [videoId]);

  const checkIfDownloaded = async () => {
    if (videoId) {
      const song = await getSongByVideoId(videoId);
      if (song) {
        setIsDownloaded(true);
        setDownloadedSongId(song.id);
        setSongDuration(song.duration);
      }
    }
  };

  const handleDownload = async () => {
    console.log('\n\n👆 DOWNLOAD BUTTON CLICKED');
    console.log('Video Title:', title);
    console.log('Video URL:', url);
    console.log('Thumbnail URL:', thumbnail);
    
    if (isDownloading || isDownloaded) {
      console.log('⚠️ Download already in progress or completed');
      return;
    }

    setIsDownloading(true);
    setProgress(0);
    console.log('🚀 Starting download process...');
    
    try {
      const result = await downloadVideo({ title, url, thumbnail, duration: videoDuration, videoId }, (progressValue) => {
        console.log('📈 Download progress:', progressValue.toFixed(2) + '%');
        setProgress(progressValue);
      });
      setProgress(100);
      setIsDownloaded(true);
      setDownloadedSongId(result.songId);
      setSongDuration(result.duration);
      setShowPlaylistModal(true);
      console.log('✅ Download completed successfully!');
    } catch (error) {
      console.error('❌ Download failed:', error);
      console.error('Error details:', error.message);
      setIsDownloaded(false);
      setProgress(0);
    } finally {
      setIsDownloading(false);
      console.log('🏁 Download process finished\n\n');
    }
  };

  // Calculate circle properties for progress
  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const handleAddToPlaylist = async ({ addedPlaylists }) => {
    if (downloadedSongId) {
      for (const playlistId of addedPlaylists) {
        await addSongToPlaylist(playlistId, downloadedSongId, songDuration, thumbnail);
        console.log('✓ Song added to playlist:', playlistId);
      }
    }
  };

  return (
    <View className="mb-4 rounded-lg bg-bg-secondary/50">
      <View className="relative">
        <Image
          source={{ uri: getThumbnailUrl(thumbnail) }}
          style={{ width: '100%', height: 200, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,1)']}
          locations={[0, 0.3, 0.6, 1]}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
          }}
        />
        <TouchableOpacity
          onPress={handleDownload}
          disabled={isDownloading}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -30 }, { translateY: -30 }],
            width: 60,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {isDownloading ? (
            <View style={{ position: 'relative' }}>
              <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth={strokeWidth}
                  fill="rgba(0, 0, 0, 0.5)"
                />
                {/* Progress circle */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="#FF6600"
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              </Svg>
              {/* Percentage text in center */}
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text className="font-satoshi-bold text-xs text-fg-primary">
                  {Math.round(progress)}%
                </Text>
              </View>
            </View>
          ) : isDownloaded ? (
            <icons.checkFilled width={60} height={60} />
          ) : (
            <icons.download width={60} height={60} />
          )}
        </TouchableOpacity>
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: '#FF6600',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}>
          <Text className="font-satoshi-bold text-xs text-fg-primary">{videoDuration}</Text>
        </View>
      </View>
      <View className="p-3">
        <Text className="mb-1 font-satoshi-bold text-xl text-fg-primary" numberOfLines={2}>
          {title}
        </Text>
        <Text className="font-satoshi-medium text-base text-fg-secondary" numberOfLines={1}>
          {channelName}
        </Text>
      </View>
      <Modal
        visible={showPlaylistModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <AddToPlaylist 
            songId={downloadedSongId}
            existingPlaylistIds={[]}
            onDone={handleAddToPlaylist}
            onClose={() => setShowPlaylistModal(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

export default YoutubeVideoHolder;

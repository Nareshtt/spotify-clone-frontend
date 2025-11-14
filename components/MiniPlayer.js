import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MiniPlayer({ audioUri, title, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const insets = useSafeAreaInsets();

  // Initialize player with null/empty source, then load dynamically
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (audioUri) {
      loadAndPlayAudio();
    }

    // Cleanup on unmount
    return () => {
      try {
        if (player) {
          player.pause();
          player.remove();
        }
      } catch (e) {
        console.log('Cleanup error:', e);
      }
    };
  }, [audioUri]);

  const loadAndPlayAudio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🎵 Loading audio from:', audioUri);

      // Ensure the URI is properly formatted
      const formattedUri = audioUri.startsWith('file://') ? audioUri : `file://${audioUri}`;
      console.log('📂 Formatted URI:', formattedUri);

      // Replace the audio source
      player.replace(formattedUri);

      console.log('✓ Audio loaded successfully');
      setIsLoading(false);

      // Auto-play after loading
      setTimeout(() => {
        try {
          player.play();
          console.log('▶️ Started playing');
        } catch (e) {
          console.error('Play error:', e);
          setError('Failed to play audio');
        }
      }, 200);
    } catch (error) {
      console.error('❌ Error loading audio:', error);
      setError(error.message);
      setIsLoading(false);
      Alert.alert(
        'Playback Error',
        `Unable to load audio file.\n\nError: ${error.message}\n\nURI: ${audioUri}`
      );
    }
  };

  const togglePlayPause = () => {
    try {
      if (status.isPlaying) {
        player.pause();
        console.log('⏸️ Paused');
      } else {
        player.play();
        console.log('▶️ Playing');
      }
    } catch (error) {
      console.error('❌ Playback error:', error);
      Alert.alert('Playback Error', error.message);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!audioUri) return null;

  return (
    <View
      className="absolute bottom-0 left-0 right-0 border-t border-gray-700 bg-gray-900 p-4"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-semibold text-white" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-xs text-gray-400">
            {isLoading
              ? 'Loading...'
              : error
                ? '❌ Error loading'
                : status.isPlaying
                  ? `Playing • ${formatTime(status.currentTime)} / ${formatTime(status.duration)}`
                  : 'Ready to play'}
          </Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-4 rounded-full bg-purple-600 p-3"
            onPress={togglePlayPause}
            disabled={isLoading || !!error}>
            <Text className="text-lg font-bold text-white">
              {isLoading ? '⏳' : error ? '❌' : status.isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="rounded-full bg-gray-700 p-2" onPress={onClose}>
            <Text className="text-lg text-white">✕</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      {status.duration > 0 && (
        <View className="mt-3 h-1 overflow-hidden rounded-full bg-gray-700">
          <View
            className="h-full bg-purple-600"
            style={{
              width: `${(status.currentTime / status.duration) * 100}%`,
            }}
          />
        </View>
      )}
    </View>
  );
}

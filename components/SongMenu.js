import { View, Text, Image, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import BlurCard from './BlurCard';
import AddToPlaylist from './AddToPlaylist';
import icons from '../constants/icons';
import {
  getAllPlaylists,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from '../database/playlistRepository';
import { getSongById, deleteSong } from '../database/songRepository';
import { usePlayer } from '../context/PlayerContext';

const SongMenu = ({
  visible,
  onClose,
  thumbnail,
  title,
  songId,
  videoId,
  playlistId,
  onRefresh,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [existingPlaylists, setExistingPlaylists] = useState([]);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isInAllSongs, setIsInAllSongs] = useState(false);
  const { queue, currentIndex, updateQueue, triggerLibraryRefresh } = usePlayer();
  const translateY = useSharedValue(600);
  const startY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      checkLikedStatus();
      checkIfInAllSongs();
    } else {
      translateY.value = withTiming(600, { duration: 250 });
    }
  }, [visible]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      // Only allow downward dragging
      if (e.translationY > 0) {
        translateY.value = startY.value + e.translationY;
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        // Swipe down to close
        translateY.value = withTiming(600, { duration: 250 });
        runOnJS(onClose)();
      } else {
        // Snap back
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const checkLikedStatus = async () => {
    try {
      const playlists = await getAllPlaylists();
      const likedPlaylist = playlists.find((p) => p.title === 'Liked Songs');
      setIsLiked(likedPlaylist?.songsQueue.includes(songId) || false);
    } catch (error) {
      console.error('Error checking liked status:', error);
    }
  };

  const checkIfInAllSongs = async () => {
    try {
      const playlists = await getAllPlaylists();
      const allSongsPlaylist = playlists.find((p) => p.title === 'All Songs');
      setIsInAllSongs(allSongsPlaylist?.id === playlistId);
    } catch (error) {
      console.error('Error checking all songs:', error);
    }
  };

  const handleLikeToggle = async () => {
    try {
      const song = await getSongById(songId);
      if (!song) return;
      const playlists = await getAllPlaylists();
      const likedPlaylist = playlists.find((p) => p.title === 'Liked Songs');
      if (!likedPlaylist) return;

      if (isLiked) {
        await removeSongFromPlaylist(likedPlaylist.id, songId, song.duration);
      } else {
        await addSongToPlaylist(likedPlaylist.id, songId, song.duration, song.thumbnailLocation);
      }
      setIsLiked(!isLiked);
      triggerLibraryRefresh();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddToPlaylistPress = async () => {
    try {
      const playlists = await getAllPlaylists();
      const existing = playlists.filter((p) => p.songsQueue.includes(songId)).map((p) => p.id);
      setExistingPlaylists(existing);
      setShowAddToPlaylist(true);
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const handleAddToPlaylistDone = async ({ addedPlaylists, removedPlaylists }) => {
    try {
      const song = await getSongById(songId);
      if (!song) return;
      for (const playlistId of addedPlaylists) {
        await addSongToPlaylist(playlistId, songId, song.duration, song.thumbnailLocation);
      }
      for (const playlistId of removedPlaylists) {
        await removeSongFromPlaylist(playlistId, songId, song.duration);
      }
      setShowAddToPlaylist(false);
      triggerLibraryRefresh();
    } catch (error) {
      console.error('Error updating playlists:', error);
    }
  };

  const handleRemoveSong = async () => {
    if (!confirmRemove) {
      setConfirmRemove(true);
      return;
    }

    try {
      const song = await getSongById(songId);
      if (!song) return;

      if (isInAllSongs) {
        const playlists = await getAllPlaylists();
        for (const playlist of playlists) {
          if (playlist.songsQueue.includes(songId)) {
            await removeSongFromPlaylist(playlist.id, songId, song.duration);
          }
        }
        await deleteSong(songId);
      } else {
        await removeSongFromPlaylist(playlistId, songId, song.duration);
      }
      triggerLibraryRefresh();
      if (onRefresh) onRefresh();
      onClose();
    } catch (error) {
      console.error('Error removing song:', error);
    }
  };

  const handleAddToQueue = async () => {
    try {
      const song = await getSongById(songId);
      if (!song) return;
      const newQueue = [
        ...queue.slice(0, currentIndex + 1),
        song,
        ...queue.slice(currentIndex + 1),
      ];
      updateQueue(newQueue, currentIndex);
      onClose();
    } catch (error) {
      console.error('Error adding to queue:', error);
    }
  };

  if (!visible) return null;

  return (
    <Pressable
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
      }}
      onPress={onClose}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              width: '100%',
              height: 550,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              overflow: 'hidden',
            },
            animatedStyle,
          ]}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
            <BlurCard style={{ flex: 1 }}>
              {/* Drag handle */}
              <View className="items-center py-3">
                <View
                  style={{
                    width: 40,
                    height: 4,
                    backgroundColor: '#666',
                    borderRadius: 2,
                  }}
                />
              </View>

              {/* Song header */}
              <View className="flex-row items-center gap-3 border-b border-b-[#898989] px-5 pb-4">
                {thumbnail && (
                  <Image
                    source={thumbnail}
                    style={{ width: 50, height: 50, borderRadius: 4 }}
                    resizeMode="cover"
                  />
                )}
                <Text
                  className="flex-1 font-satoshi-medium text-xl text-fg-primary/75"
                  numberOfLines={1}>
                  {title}
                </Text>
              </View>

              {/* Menu options */}
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} bounces={false}>
                <TouchableOpacity
                  onPress={handleLikeToggle}
                  className="flex-row items-center px-5 py-4">
                  <View className="flex-row items-center gap-4">
                    {isLiked ? <icons.likeFilled /> : <icons.like />}
                    <Text className="font-satoshi-medium text-base text-fg-primary">
                      {isLiked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddToPlaylistPress}
                  className="flex-row items-center px-5 py-4">
                  <View className="flex-row items-center gap-4">
                    <icons.addtoPlaylist />
                    <Text className="font-satoshi-medium text-base text-fg-primary">
                      Add to a Playlist
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleAddToQueue}
                  className="flex-row items-center px-5 py-4">
                  <View className="flex-row items-center gap-4">
                    <icons.addtoQueue />
                    <Text className="font-satoshi-medium text-base text-fg-primary">
                      Add song to queue
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleRemoveSong}
                  className="flex-row items-center px-5 py-4">
                  <View className="flex-row items-center gap-4">
                    {confirmRemove ? (
                      <icons.check />
                    ) : (
                      <Image
                        source={require('../assets/icons/hide.png')}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />
                    )}
                    <Text className="font-satoshi-medium text-base text-fg-primary">
                      {confirmRemove ? 'Sure to remove the song?' : 'Remove Song'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </BlurCard>
          </Pressable>
        </Animated.View>
      </GestureDetector>

      {showAddToPlaylist && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <AddToPlaylist
            songId={songId}
            existingPlaylistIds={existingPlaylists}
            onDone={handleAddToPlaylistDone}
            onClose={() => setShowAddToPlaylist(false)}
          />
        </View>
      )}
    </Pressable>
  );
};

export default SongMenu;

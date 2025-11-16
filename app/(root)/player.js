import { View, Text, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useState, useEffect } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import Slider from '@/components/Slider';
import icons from '@/constants/icons';
import { usePlayer } from '@/context/PlayerContext';
import AddToPlaylist from '@/components/AddToPlaylist';
import {
  getAllPlaylists,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from '@/database/playlistRepository';
import { getSongByVideoId } from '@/database/songRepository';

const PlayPauseButton = memo(({ isPlaying, onPress }) => {
  const [localPlaying, setLocalPlaying] = React.useState(isPlaying);

  React.useEffect(() => {
    setLocalPlaying(isPlaying);
  }, [isPlaying]);

  const handlePress = () => {
    setLocalPlaying(!localPlaying);
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      {localPlaying ? (
        <icons.pause width={50} height={50} />
      ) : (
        <icons.play width={50} height={50} />
      )}
    </Pressable>
  );
});

const Player = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    seekTo,
    playNext,
    playPrevious,
    position,
    duration,
    triggerLibraryRefresh,
    queue,
    currentIndex,
    playSong,
    isLooping,
    setIsLooping,
    isShuffle,
    setIsShuffle,
  } = usePlayer();

  const [isLiked, setIsLiked] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [songData, setSongData] = useState(null);
  const [existingPlaylists, setExistingPlaylists] = useState([]);

  const imageTranslateX = useSharedValue(0);
  const imageOpacity = useSharedValue(1);
  const titleTranslateX = useSharedValue(0);
  const titleOpacity = useSharedValue(1);

  const title = currentSong?.title || 'Unknown Song';
  const playlistName = currentSong?.playlistName || 'Unknown Playlist';
  const thumbnail = currentSong?.thumbnail?.uri || currentSong?.thumbnail;

  useEffect(() => {
    if (currentSong) {
      checkLikedStatus();
    }
  }, [currentSong]);

  useEffect(() => {
    if (currentSong) {
      loadSongData();
    }
  }, [currentSong]);

  const handleSwipeNext = () => {
    if (queue.length === 0) return;
    setIsLooping(false);
    const nextIndex = (currentIndex + 1) % queue.length;
    playSong(queue[nextIndex], queue, nextIndex);
  };

  const handleSwipePrevious = () => {
    if (queue.length === 0) return;
    setIsLooping(false);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    playSong(queue[prevIndex], queue, prevIndex);
  };

  const handleNextButton = () => {
    imageTranslateX.value = withTiming(-400, { duration: 200 });
    imageOpacity.value = withTiming(0, { duration: 200 });
    titleTranslateX.value = withTiming(-400, { duration: 200 });
    titleOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(handleSwipeNext)();
      imageTranslateX.value = 400;
      imageOpacity.value = 0;
      titleTranslateX.value = 400;
      titleOpacity.value = 0;
      imageTranslateX.value = withTiming(0, { duration: 250 });
      imageOpacity.value = withTiming(1, { duration: 250 });
      titleTranslateX.value = withTiming(0, { duration: 250 });
      titleOpacity.value = withTiming(1, { duration: 250 });
    });
  };

  const handlePrevButton = () => {
    imageTranslateX.value = withTiming(400, { duration: 200 });
    imageOpacity.value = withTiming(0, { duration: 200 });
    titleTranslateX.value = withTiming(400, { duration: 200 });
    titleOpacity.value = withTiming(0, { duration: 200 }, () => {
      runOnJS(handleSwipePrevious)();
      imageTranslateX.value = -400;
      imageOpacity.value = 0;
      titleTranslateX.value = -400;
      titleOpacity.value = 0;
      imageTranslateX.value = withTiming(0, { duration: 250 });
      imageOpacity.value = withTiming(1, { duration: 250 });
      titleTranslateX.value = withTiming(0, { duration: 250 });
      titleOpacity.value = withTiming(1, { duration: 250 });
    });
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      imageTranslateX.value = e.translationX;
      titleTranslateX.value = e.translationX;
      const progress = Math.abs(e.translationX) / 300;
      imageOpacity.value = Math.max(0.3, 1 - progress * 0.7);
      titleOpacity.value = Math.max(0.3, 1 - progress * 0.7);
    })
    .onEnd((e) => {
      const threshold = 100;
      const velocity = e.velocityX;

      if (e.translationX > threshold || velocity > 500) {
        imageTranslateX.value = withTiming(400, { duration: 200 });
        imageOpacity.value = withTiming(0, { duration: 200 });
        titleTranslateX.value = withTiming(400, { duration: 200 });
        titleOpacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleSwipePrevious)();
          imageTranslateX.value = -400;
          imageOpacity.value = 0;
          titleTranslateX.value = -400;
          titleOpacity.value = 0;
          imageTranslateX.value = withTiming(0, { duration: 250 });
          imageOpacity.value = withTiming(1, { duration: 250 });
          titleTranslateX.value = withTiming(0, { duration: 250 });
          titleOpacity.value = withTiming(1, { duration: 250 });
        });
      } else if (e.translationX < -threshold || velocity < -500) {
        imageTranslateX.value = withTiming(-400, { duration: 200 });
        imageOpacity.value = withTiming(0, { duration: 200 });
        titleTranslateX.value = withTiming(-400, { duration: 200 });
        titleOpacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleSwipeNext)();
          imageTranslateX.value = 400;
          imageOpacity.value = 0;
          titleTranslateX.value = 400;
          titleOpacity.value = 0;
          imageTranslateX.value = withTiming(0, { duration: 250 });
          imageOpacity.value = withTiming(1, { duration: 250 });
          titleTranslateX.value = withTiming(0, { duration: 250 });
          titleOpacity.value = withTiming(1, { duration: 250 });
        });
      } else {
        imageTranslateX.value = withTiming(0, { duration: 200 });
        imageOpacity.value = withTiming(1, { duration: 200 });
        titleTranslateX.value = withTiming(0, { duration: 200 });
        titleOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: imageTranslateX.value }],
    opacity: imageOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: titleTranslateX.value }],
    opacity: titleOpacity.value,
  }));

  const checkLikedStatus = async () => {
    try {
      const song = await getSongByVideoId(currentSong.videoId);
      if (song) {
        const playlists = await getAllPlaylists();
        const likedPlaylist = playlists.find((p) => p.title === 'Liked Songs');
        setIsLiked(likedPlaylist?.songsQueue.includes(song.id) || false);
      }
    } catch (error) {
      console.error('Error checking liked status:', error);
    }
  };

  const loadSongData = async () => {
    try {
      const song = await getSongByVideoId(currentSong.videoId);
      if (song) {
        setSongData(song);
        const playlists = await getAllPlaylists();
        const existing = playlists.filter((p) => p.songsQueue.includes(song.id)).map((p) => p.id);
        setExistingPlaylists(existing);
      }
    } catch (error) {
      console.error('Error loading song data:', error);
    }
  };

  const handleLike = async () => {
    try {
      const song = await getSongByVideoId(currentSong.videoId);
      if (!song) return;

      const playlists = await getAllPlaylists();
      const likedPlaylist = playlists.find((p) => p.title === 'Liked Songs');
      if (!likedPlaylist) return;

      if (isLiked) {
        await removeSongFromPlaylist(likedPlaylist.id, song.id, song.duration);
      } else {
        await addSongToPlaylist(likedPlaylist.id, song.id, song.duration, song.thumbnailLocation);
      }
      setIsLiked(!isLiked);
      triggerLibraryRefresh();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddToPlaylist = async ({ addedPlaylists, removedPlaylists }) => {
    if (!songData) return;

    try {
      for (const playlistId of addedPlaylists) {
        await addSongToPlaylist(
          playlistId,
          songData.id,
          songData.duration,
          songData.thumbnailLocation
        );
      }
      for (const playlistId of removedPlaylists) {
        await removeSongFromPlaylist(playlistId, songData.id, songData.duration);
      }
      await loadSongData();
      triggerLibraryRefresh();
    } catch (error) {
      console.error('Error updating playlists:', error);
    }
  };

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleAddToPlaylistPress = async () => {
    if (!songData || existingPlaylists.length === 0) {
      await loadSongData();
    }
    setShowAddToPlaylist(true);
  };

  const handleShuffleToggle = () => {
    setIsShuffle(!isShuffle);
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#111111' }}>
      <LinearGradient
        colors={['#3b414d', '#272b33']}
        locations={[0, 1]}
        style={{ flex: 1, paddingTop: insets.top }}>
        <View className="mx-4 my-3 flex-row items-center justify-between">
          <Pressable onPress={() => router.dismiss()}>
            <icons.down />
          </Pressable>
          <View className="flex-1 flex-row items-center justify-center">
            <icons.album width={36} height={36} />
            <Text className="font-satoshi-medium text-base text-fg-primary/70">{playlistName}</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View className="mx-8 my-8 items-center">
          <GestureDetector gesture={swipeGesture}>
            <Animated.View style={imageAnimatedStyle}>
              {thumbnail ? (
                <Image
                  key={currentSong?.videoId}
                  source={{ uri: thumbnail }}
                  style={{ width: 400, height: 450, borderRadius: 8 }}
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={require('@/assets/image.png')}
                  style={{ width: 320, height: 320, borderRadius: 8 }}
                  resizeMode="cover"
                />
              )}
            </Animated.View>
          </GestureDetector>
        </View>

        <View className="mx-6 my-6">
          <View className="flex-row items-center justify-between">
            <View style={{ flex: 1, marginRight: 12, overflow: 'hidden' }}>
              <Animated.View style={titleAnimatedStyle}>
                <Text
                  key={`${currentSong?.videoId}-title`}
                  className="font-satoshi-bold text-2xl text-fg-primary"
                  numberOfLines={1}>
                  {title}
                </Text>
              </Animated.View>
            </View>
            <View className="relative left-3 flex flex-row gap-3">
              <Pressable onPress={handleLike}>
                {isLiked ? <icons.likeFilled /> : <icons.like />}
              </Pressable>
              <Pressable onPress={handleAddToPlaylistPress}>
                <icons.addtoPlaylist />
              </Pressable>
            </View>
          </View>
        </View>

        <View className="mx-1">
          <Slider
            style={{ width: '100%', height: 6 }}
            minimumValue={0}
            maximumValue={duration}
            value={position}
            onSlidingComplete={(value) => seekTo(value)}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
            thumbTintColor="transparent"
          />
          <View className="mx-4 mt-7 flex-row justify-between">
            <Text className="font-satoshi-light text-xs text-fg-secondary">
              {formatTime(position)}
            </Text>
            <Text className="font-satoshi-light text-xs text-fg-secondary">
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        <View className="mx-6 my-5">
          <View className="relative bottom-3 mb-5 flex-row items-center justify-between">
            <View style={{ position: 'relative' }}>
              <Pressable onPress={handleShuffleToggle} style={{ opacity: isShuffle ? 1 : 0.5 }}>
                <icons.shuffle />
              </Pressable>
              {isShuffle && (
                <View
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#ff6600',
                  }}
                />
              )}
            </View>
            <Pressable onPress={handlePrevButton}>
              <icons.prev width={50} height={50} />
            </Pressable>
            <PlayPauseButton isPlaying={isPlaying} onPress={togglePlayPause} />
            <Pressable onPress={handleNextButton}>
              <icons.next width={50} height={50} />
            </Pressable>
            <View style={{ position: 'relative' }}>
              <Pressable onPress={() => setIsLooping(!isLooping)}>
                <icons.loop />
              </Pressable>
              {isLooping && (
                <View
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#ff6600',
                  }}
                />
              )}
            </View>
          </View>
        </View>
      </LinearGradient>

      {showAddToPlaylist && songData && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <AddToPlaylist
            songId={songData.id}
            existingPlaylistIds={existingPlaylists}
            onDone={handleAddToPlaylist}
            onClose={() => setShowAddToPlaylist(false)}
          />
        </View>
      )}
    </View>
  );
};

export default Player;

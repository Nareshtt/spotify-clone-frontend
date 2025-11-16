import { View, Text, Image, Pressable, TouchableWithoutFeedback, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { usePlayer } from '../../context/PlayerContext';
import icons from '../../constants/icons';
import { useState, useEffect, useRef } from 'react';
import Option from './option';
import AddToPlaylist from '../AddToPlaylist';
import {
  getAllPlaylists,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from '../../database/playlistRepository';
import { getSongByVideoId } from '../../database/songRepository';

const MiniPlayer = () => {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    triggerLibraryRefresh,
    position,
    duration,
    queue,
    currentIndex,
    playSong,
    isLooping,
    setIsLooping,
  } = usePlayer();
  const [localPlaying, setLocalPlaying] = useState(isPlaying);
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimeout = useRef(null);

  useEffect(() => {
    setLocalPlaying(isPlaying);
  }, [isPlaying]);

  useEffect(() => {
    if (progressTimeout.current) clearTimeout(progressTimeout.current);
    progressTimeout.current = setTimeout(() => {
      setProgress(duration > 0 ? position / duration : 0);
    }, 100);
  }, [position, duration]);

  const contentTranslateX = useSharedValue(0);
  const contentOpacity = useSharedValue(1);

  const handleSwipeNext = () => {
    console.log('Swipe Next - Queue length:', queue.length, 'Current index:', currentIndex);
    if (queue.length === 0) return;
    setIsLooping(false);
    const nextIndex = (currentIndex + 1) % queue.length;
    console.log('Playing next song at index:', nextIndex);
    playSong(queue[nextIndex], queue, nextIndex);
  };

  const handleSwipePrevious = () => {
    console.log('Swipe Previous - Queue length:', queue.length, 'Current index:', currentIndex);
    if (queue.length === 0) return;
    setIsLooping(false);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    console.log('Playing previous song at index:', prevIndex);
    playSong(queue[prevIndex], queue, prevIndex);
  };

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      contentTranslateX.value = e.translationX;
      // Add subtle opacity fade
      const progress = Math.abs(e.translationX) / 300;
      contentOpacity.value = Math.max(0.3, 1 - progress * 0.7);
    })
    .onEnd((e) => {
      const threshold = 100;
      const velocity = e.velocityX;

      if (e.translationX > threshold || velocity > 500) {
        // Swipe right - previous song
        contentTranslateX.value = withTiming(250, { duration: 200 });
        contentOpacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleSwipePrevious)();
          contentTranslateX.value = -250;
          contentOpacity.value = 0;
          contentTranslateX.value = withTiming(0, { duration: 250 });
          contentOpacity.value = withTiming(1, { duration: 250 });
        });
      } else if (e.translationX < -threshold || velocity < -500) {
        // Swipe left - next song
        contentTranslateX.value = withTiming(-250, { duration: 200 });
        contentOpacity.value = withTiming(0, { duration: 200 }, () => {
          runOnJS(handleSwipeNext)();
          contentTranslateX.value = 250;
          contentOpacity.value = 0;
          contentTranslateX.value = withTiming(0, { duration: 250 });
          contentOpacity.value = withTiming(1, { duration: 250 });
        });
      } else {
        // Return to center
        contentTranslateX.value = withTiming(0, { duration: 200 });
        contentOpacity.value = withTiming(1, { duration: 200 });
      }
    });

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: contentTranslateX.value }],
    opacity: contentOpacity.value,
  }));

  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [songData, setSongData] = useState(null);
  const [existingPlaylists, setExistingPlaylists] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [showHideConfirm, setShowHideConfirm] = useState(false);
  const [canHide, setCanHide] = useState(true);

  useEffect(() => {
    if (currentSong && showAddToPlaylist) {
      loadSongData();
    }
  }, [showAddToPlaylist]);

  useEffect(() => {
    if (currentSong) {
      checkLikedStatus();
      checkCanHide();
    }
  }, [currentSong]);

  const checkLikedStatus = async () => {
    try {
      const song = await getSongByVideoId(currentSong.videoId);
      if (song) {
        const playlists = await getAllPlaylists();
        const likedPlaylist = playlists.find(p => p.title === 'Liked Songs');
        setIsLiked(likedPlaylist?.songsQueue.includes(song.id) || false);
      }
    } catch (error) {
      console.error('Error checking liked status:', error);
    }
  };

  const checkCanHide = async () => {
    setCanHide(currentSong.playlistName !== 'All Songs');
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

  const handleLike = async () => {
    try {
      const song = await getSongByVideoId(currentSong.videoId);
      if (!song) return;

      const playlists = await getAllPlaylists();
      const likedPlaylist = playlists.find(p => p.title === 'Liked Songs');
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

  const handleHideConfirm = async () => {
    try {
      const song = await getSongByVideoId(currentSong.videoId);
      if (!song) return;

      const playlists = await getAllPlaylists();
      const currentPlaylist = playlists.find(p => p.title === currentSong.playlistName);
      if (!currentPlaylist) return;

      await removeSongFromPlaylist(currentPlaylist.id, song.id, song.duration);
      triggerLibraryRefresh();
      setShowHideConfirm(false);
      setShowMenu(false);

      if (queue.length > 1) {
        handleSwipeNext();
      }
    } catch (error) {
      console.error('Error hiding song:', error);
    }
  };

  if (!currentSong) return null;

  return (
    <>
      {showMenu && (
        <TouchableWithoutFeedback onPress={() => {
          setShowMenu(false);
          setShowHideConfirm(false);
        }}>
          <View className="absolute inset-0" style={{ zIndex: 1 }} />
        </TouchableWithoutFeedback>
      )}
      <View
        className="absolute bottom-0 left-0 right-0 mx-2"
        style={{ marginBottom: 110, marginHorizontal: 2, zIndex: 2 }}>
        {showMenu && (
          <View className="mb-2 flex-row gap-2">
            <Option
              imageSource={showHideConfirm ? null : require('../../assets/icons/hide.png')}
              Icon={showHideConfirm ? icons.checked : null}
              onPress={() => {
                if (!canHide) return;
                if (showHideConfirm) {
                  handleHideConfirm();
                } else {
                  setShowHideConfirm(true);
                }
              }}
              disabled={!canHide}
            />
            <Option
              Icon={icons.loop}
              onPress={() => setIsLooping(!isLooping)}
              active={isLooping}
            />
            <Option
              Icon={isLiked ? icons.likeFilled : icons.like}
              onPress={handleLike}
            />
          </View>
        )}
        <View style={{ borderRadius: 16, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#444850', '#333842']}
            locations={[0.3, 0.9]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}>
            <Pressable
              onPress={() => {
                if (isNavigating) return;
                setIsNavigating(true);
                const thumbnailUri = currentSong.thumbnail?.uri || currentSong.thumbnail;
                router.push({
                  pathname: '/(root)/player',
                  params: {
                    title: currentSong.title,
                    playlistName: currentSong.playlistName,
                    thumbnail: thumbnailUri,
                    songLocation: currentSong.songLocation,
                  },
                });
                setTimeout(() => setIsNavigating(false), 1000);
              }}
              onLongPress={() => {
                setShowMenu(!showMenu);
                if (showMenu) setShowHideConfirm(false);
              }}
              className="flex-row items-center justify-between px-4 py-3">
              <GestureDetector gesture={swipeGesture}>
                <View style={{ flex: 1, maxWidth: '65%', overflow: 'hidden' }}>
                  <Animated.View
                    style={[contentAnimatedStyle]}
                    className="flex-1 flex-row items-center gap-3">
                    <Image
                      key={currentSong.videoId}
                      source={currentSong.thumbnail}
                      style={{ width: 50, height: 50, borderRadius: 4 }}
                      resizeMode="cover"
                    />
                    <Text
                      key={`${currentSong.videoId}-title`}
                      className="flex-1 font-satoshi-medium text-lg text-fg-primary"
                      numberOfLines={1}>
                      {currentSong.title}
                    </Text>
                  </Animated.View>
                </View>
              </GestureDetector>
              <View className="flex-row items-center">
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowAddToPlaylist(true);
                  }}>
                  <icons.addtoPlaylist />
                </Pressable>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setLocalPlaying(!localPlaying);
                    togglePlayPause();
                  }}>
                  {localPlaying ? <icons.pauseSimple /> : <icons.playSimple />}
                </Pressable>
              </View>
            </Pressable>
            <View className="mx-4 h-1 rounded-xl bg-fg-primary/30">
              <View
                className="h-1 rounded-xl bg-fg-primary"
                style={{ width: `${progress * 100}%` }}
              />
            </View>
          </LinearGradient>
        </View>
      </View>
      <Modal visible={showAddToPlaylist} transparent animationType="fade">
        <View
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <AddToPlaylist
            songId={songData?.id}
            existingPlaylistIds={existingPlaylists}
            onDone={handleAddToPlaylist}
            onClose={() => setShowAddToPlaylist(false)}
          />
        </View>
      </Modal>
    </>
  );
};

export default MiniPlayer;

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [libraryRefreshTrigger, setLibraryRefreshTrigger] = useState(0);
  const [sound, setSound] = useState(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const queueRef = useRef([]);
  const currentIndexRef = useRef(0);
  const isLoopingRef = useRef(false);
  const soundRef = useRef(null);

  useEffect(() => {
    queueRef.current = queue;
    currentIndexRef.current = currentIndex;
    isLoopingRef.current = isLooping;
  }, [queue, currentIndex, isLooping]);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSong = async (song, songQueue = [], index = 0) => {
    try {
      if (sound) {
        await sound.unloadAsync();
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: song.songLocation },
        { shouldPlay: true, isLooping: false },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setCurrentSong(song);
      setIsPlaying(true);
      if (songQueue.length > 0) {
        setQueue(songQueue);
        setCurrentIndex(index);
      }
      await newSound.playAsync();
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  const playNext = async () => {
    if (queue.length === 0) return;
    const nextIndex = (currentIndex + 1) % queue.length;
    await playSong(queue[nextIndex], queue, nextIndex);
  };

  const playPrevious = async () => {
    if (queue.length === 0) return;

    if (position > 5000) {
      await seekTo(0);
    } else {
      const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
      await playSong(queue[prevIndex], queue, prevIndex);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        if (isLoopingRef.current) {
          const currentSound = soundRef.current;
          if (currentSound) {
            currentSound
              .setPositionAsync(0)
              .then(() => currentSound.playAsync())
              .catch((err) => console.error('Error looping:', err));
          }
        } else if (queueRef.current.length > 0) {
          const nextIndex = (currentIndexRef.current + 1) % queueRef.current.length;
          playSong(queueRef.current[nextIndex], queueRef.current, nextIndex);
        }
      }
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    try {
      if (isPlaying) {
        setIsPlaying(false);
        await sound.pauseAsync();
      } else {
        setIsPlaying(true);
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const seekTo = async (positionMillis) => {
    if (!sound) return;

    try {
      await sound.setPositionAsync(positionMillis);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const stopSong = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setSound(null);
  };

  const triggerLibraryRefresh = () => {
    setLibraryRefreshTrigger((prev) => prev + 1);
  };

  const updateQueue = (newQueue, newIndex) => {
    setQueue(newQueue);
    if (newIndex !== undefined) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        playSong,
        stopSong,
        togglePlayPause,
        seekTo,
        playNext,
        playPrevious,
        position,
        duration,
        queue,
        currentIndex,
        isLooping,
        setIsLooping,
        isShuffle,
        setIsShuffle,
        updateQueue,
        libraryRefreshTrigger,
        triggerLibraryRefresh,
      }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

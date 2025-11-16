import { View, Text, ScrollView, Pressable, FlatList } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Search from '@/components/Search';
import SongThumbnail from '@/components/songs/SongThumbnail';
import icons from '@/constants/icons';
import SongCard from '@/components/songs/SongCard';
import SortModal from '@/components/SortModal';
import AddToPlaylist from '@/components/AddToPlaylist';
import AddSongsToPlaylist from '@/components/AddSongsToPlaylist';
import SongMenu from '@/components/SongMenu';
import {
  getPlaylistById,
  getAllPlaylists,
  addSongToPlaylist,
  updatePlaylistSortMethod,
  updatePlaylistShuffle,
} from '@/database/playlistRepository';
import { getSongById, getSongByVideoId } from '@/database/songRepository';
import { usePlayer } from '@/context/PlayerContext';

const Songs = () => {
  const { id } = useLocalSearchParams();
  const [playlist, setPlaylist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [existingPlaylists, setExistingPlaylists] = useState([]);
  const [showAddSongs, setShowAddSongs] = useState(false);
  const [showSongMenu, setShowSongMenu] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const {
    libraryRefreshTrigger,
    updateQueue,
    currentSong,
    isShuffle,
    setIsShuffle,
    isPlaying,
    togglePlayPause,
    playSong,
    triggerLibraryRefresh,
  } = usePlayer();

  useFocusEffect(
    useCallback(() => {
      loadPlaylistData();
    }, [id])
  );

  useEffect(() => {
    loadPlaylistData();
  }, [libraryRefreshTrigger]);

  const loadPlaylistData = async () => {
    try {
      const playlistData = await getPlaylistById(parseInt(id));
      if (!playlistData) return;

      setPlaylist(playlistData);
      setIsShuffle(playlistData.isShuffle);

      const songsData = await Promise.all(
        playlistData.songsQueue.map(async (songId) => {
          const song = await getSongById(songId);
          return song;
        })
      );
      const filteredSongs = songsData.filter((s) => s !== null);
      setAllSongs(filteredSongs);
      setSongs(filteredSongs);
    } catch (error) {
      console.error('Error loading playlist:', error);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSongs(allSongs);
    } else {
      const filtered = allSongs.filter((song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSongs(filtered);
    }
  }, [searchQuery, allSongs]);

  const handleSearchSubmit = () => {};

  const handleClear = () => {
    setSearchQuery('');
  };

  const handleAddToPlaylistPress = async () => {
    const playlists = await getAllPlaylists();
    const existing = playlists
      .filter((p) => allSongs.every((song) => p.songsQueue.includes(song.id)))
      .map((p) => p.id);
    setExistingPlaylists(existing);
    setShowAddToPlaylist(true);
  };

  const handleAddToPlaylistDone = async ({ addedPlaylists, removedPlaylists }) => {
    try {
      for (const playlistId of addedPlaylists) {
        const targetPlaylist = await getPlaylistById(playlistId);
        for (const song of allSongs) {
          if (!targetPlaylist.songsQueue.includes(song.id)) {
            await addSongToPlaylist(playlistId, song.id, song.duration, song.thumbnailLocation);
          }
        }
      }
      setShowAddToPlaylist(false);
      triggerLibraryRefresh();
    } catch (error) {
      console.error('Error adding songs to playlist:', error);
    }
  };



  const handleSortChange = async (newSort) => {
    try {
      const dbSort = newSort === 'recent' ? 'recently_added' : newSort;
      await updatePlaylistSortMethod(playlist.id, dbSort, currentSong?.videoId);
      const updatedPlaylist = await getPlaylistById(parseInt(id));
      setPlaylist(updatedPlaylist);
      setIsShuffle(updatedPlaylist.isShuffle);
      await loadPlayingQueueFromPlaylist(updatedPlaylist);
      const songsData = await Promise.all(
        updatedPlaylist.songsQueue.map(async (songId) => {
          const song = await getSongById(songId);
          return song;
        })
      );
      const filteredSongs = songsData.filter((s) => s !== null);
      setAllSongs(filteredSongs);
      setSongs(filteredSongs);
    } catch (error) {
      console.error('Error changing sort:', error);
    }
  };



  const handleShuffleToggle = async () => {
    try {
      const newShuffleState = !isShuffle;
      await updatePlaylistShuffle(playlist.id, newShuffleState, currentSong?.videoId);
      const updatedPlaylist = await getPlaylistById(parseInt(id));
      setPlaylist(updatedPlaylist);
      setIsShuffle(updatedPlaylist.isShuffle);
      await loadPlayingQueueFromPlaylist(updatedPlaylist);
    } catch (error) {
      console.error('Error toggling shuffle:', error);
    }
  };

  const insets = useSafeAreaInsets();

  const [playingQueue, setPlayingQueue] = useState([]);

  const loadPlayingQueueFromPlaylist = async (playlistData) => {
    if (!playlistData) return;
    const shouldUsePlaying = playlistData.isShuffle;
    const playingIds = shouldUsePlaying 
      ? (playlistData.playingQueue || playlistData.songsQueue) 
      : playlistData.songsQueue;
    console.log('Loading queue - Shuffle:', playlistData.isShuffle, 'Using:', shouldUsePlaying ? 'playingQueue' : 'songsQueue');
    const playingSongs = await Promise.all(
      playingIds.map(async (songId) => {
        const song = await getSongById(songId);
        return song;
      })
    );
    const formattedQueue = playingSongs
      .filter((s) => s)
      .map((song) => ({
        title: song.title,
        playlistName: playlistData?.title,
        thumbnail: song.thumbnailLocation ? { uri: song.thumbnailLocation } : null,
        songLocation: song.songLocation,
        videoId: song.videoId,
      }));
    setPlayingQueue(formattedQueue);
    
    if (currentSong?.playlistName === playlistData?.title) {
      const newIndex = formattedQueue.findIndex((s) => s.videoId === currentSong.videoId);
      updateQueue(formattedQueue, newIndex !== -1 ? newIndex : 0);
    }
  };

  useEffect(() => {
    if (playlist) loadPlayingQueueFromPlaylist(playlist);
  }, [playlist]);

  const renderSong = useCallback(
    ({ item, index }) => {
      const queueIndex = playingQueue.findIndex((s) => s.videoId === item.videoId);
      const isCurrentlyPlaying = currentSong?.videoId === item.videoId && currentSong?.playlistName === playlist?.title;
      return (
        <SongCard
          key={item.id}
          index={index}
          thumbnail={item.thumbnailLocation ? { uri: item.thumbnailLocation } : null}
          title={item.title}
          playlistName={playlist?.title}
          songLocation={item.songLocation}
          videoId={item.videoId}
          queue={playingQueue}
          queueIndex={queueIndex !== -1 ? queueIndex : 0}
          songId={item.id}
          playlistId={playlist?.id}
          isCurrentlyPlaying={isCurrentlyPlaying}
          onMorePress={(songData) => {
            setSelectedSong(songData);
            setShowSongMenu(true);
          }}
        />
      );
    },
    [playlist, playingQueue, currentSong]
  );

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  if (!playlist) return null;

  return (
    <View className="h-full" style={{ backgroundColor: '#111111' }}>
      <View style={{ flex: 1, backgroundColor: '#111111' }}>
        <LinearGradient
          colors={['rgba(116,128,188,0.47)', 'rgba(6,6,6,0.47)']}
          locations={[0, 1]}
          style={{ flex: 1, paddingTop: insets.top }}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Search
              icon="sort"
              placeholder="Search in playlist"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              showClose={searchQuery.length > 0}
              onClear={handleClear}
              onIconPress={() => setSortModalVisible(true)}
            />
            <SongThumbnail
              imageSource={playlist.thumbnailLocation ? { uri: playlist.thumbnailLocation } : null}
              title={playlist.title}
              songsNumber={songs.length}
              duration={playlist.totalDuration > 0 ? formatDuration(playlist.totalDuration) : null}
            />

            <View className="mx-3 my-2 flex flex-row items-center justify-between">
              <View className="flex flex-row items-center justify-center">
                <Pressable onPress={handleAddToPlaylistPress}>
                  <icons.addtoPlaylist />
                </Pressable>
                <Pressable onPress={() => setShowAddSongs(true)}>
                  <icons.addtoQueue />
                </Pressable>
              </View>
              <View className="flex flex-row items-center justify-center gap-2">
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
                <Pressable
                  onPress={async () => {
                    if (songs.length === 0 || playingQueue.length === 0) return;
                    if (!currentSong || currentSong.playlistName !== playlist?.title) {
                      const firstDisplayedSong = songs[0];
                      const queueIndex = playingQueue.findIndex(
                        (s) => s.videoId === firstDisplayedSong.videoId
                      );
                      const songToPlay = playingQueue[queueIndex !== -1 ? queueIndex : 0];
                      if (songToPlay) {
                        await playSong(
                          songToPlay,
                          playingQueue,
                          queueIndex !== -1 ? queueIndex : 0
                        );
                      }
                    } else {
                      togglePlayPause();
                    }
                  }}>
                  {isPlaying && currentSong?.playlistName === playlist?.title ? (
                    <icons.pause />
                  ) : (
                    <icons.play />
                  )}
                </Pressable>
              </View>
            </View>
            {songs.length > 0 ? (
              <FlatList
                data={songs}
                renderItem={renderSong}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                removeClippedSubviews={true}
                maxToRenderPerBatch={5}
                initialNumToRender={10}
                windowSize={3}
                updateCellsBatchingPeriod={50}
              />
            ) : (
              <View className="mx-3 my-8 items-center">
                <Text className="mb-2 font-satoshi-bold text-xl text-fg-primary">No Songs Yet</Text>
                <Text className="text-center font-satoshi-medium text-fg-secondary">
                  Start adding songs to this playlist from the discover page
                </Text>
              </View>
            )}
            <View style={{ height: 200 }} />
          </ScrollView>
        </LinearGradient>
        {sortModalVisible && (
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
            <SortModal
              currentSort={playlist?.sortMethod === 'recently_added' ? 'recent' : (playlist?.sortMethod || 'recent')}
              onSortChange={handleSortChange}
              onClose={() => setSortModalVisible(false)}
            />
          </View>
        )}
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
              existingPlaylistIds={existingPlaylists}
              onDone={handleAddToPlaylistDone}
              onClose={() => setShowAddToPlaylist(false)}
            />
          </View>
        )}
        {showAddSongs && (
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
            <AddSongsToPlaylist
              playlistId={playlist.id}
              onDone={async (selectedSongIds) => {
                for (const songId of selectedSongIds) {
                  const song = await getSongById(songId);
                  if (song && !playlist.songsQueue.includes(songId)) {
                    await addSongToPlaylist(playlist.id, songId, song.duration, song.thumbnailLocation);
                  }
                }
                await loadPlaylistData();
                triggerLibraryRefresh();
              }}
              onClose={() => setShowAddSongs(false)}
            />
          </View>
        )}
        <SongMenu
          visible={showSongMenu}
          onClose={() => {
            setShowSongMenu(false);
            setSelectedSong(null);
          }}
          thumbnail={selectedSong?.thumbnail}
          title={selectedSong?.title}
          songId={selectedSong?.songId}
          videoId={selectedSong?.videoId}
          playlistId={selectedSong?.playlistId}
          onRefresh={loadPlaylistData}
        />
      </View>
    </View>
  );
};

export default Songs;

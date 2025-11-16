import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import BlurCard from './BlurCard';
import Search from './Search';
import AddPlaylistCard from './AddPlaylistCard';
import CreatePlaylist from './CreatePlaylist';
import icons from '../constants/icons';
import { getAllPlaylists } from '../database/playlistRepository';

const AddToPlaylist = ({
  onDone,
  onClose,
  songId,
  existingPlaylistIds = [],
  fullHeight = false,
}) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState([]);
  const [allSongsId, setAllSongsId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔍 DEBUG: Log when component mounts
  useEffect(() => {
    console.log('🎵 AddToPlaylist MOUNTED');
    console.log('   songId:', songId);
    console.log('   existingPlaylistIds:', existingPlaylistIds);
    console.log('   fullHeight:', fullHeight);
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, []);

  // Update selected playlists when existingPlaylistIds changes
  useEffect(() => {
    console.log('🔄 existingPlaylistIds changed:', existingPlaylistIds);
    console.log('   playlists.length:', playlists.length);
    console.log('   allSongsId:', allSongsId);

    if (playlists.length > 0) {
      if (existingPlaylistIds.length > 0) {
        console.log('✅ Setting selected from existing:', existingPlaylistIds);
        setSelectedPlaylistIds(existingPlaylistIds);
      } else if (allSongsId) {
        console.log('✅ Setting selected to All Songs:', [allSongsId]);
        setSelectedPlaylistIds([allSongsId]);
      }
    }
  }, [existingPlaylistIds, playlists, allSongsId]);

  const loadPlaylists = async () => {
    try {
      console.log('📥 Loading playlists...');
      setIsLoading(true);
      const data = await getAllPlaylists();
      console.log('📦 Playlists loaded:', data.length);
      console.log(
        '   Playlist titles:',
        data.map((p) => p.title)
      );

      setPlaylists(data);
      const allSongs = data.find((p) => p.title === 'All Songs');
      if (allSongs) {
        console.log('✅ Found All Songs playlist:', allSongs.id);
        setAllSongsId(allSongs.id);
      } else {
        console.log('⚠️ All Songs playlist not found!');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error loading playlists:', error);
      console.log('🔄 Retrying playlist load...');
      setTimeout(loadPlaylists, 500);
    }
  };

  const filteredPlaylists =
    searchQuery.trim() === ''
      ? playlists
      : playlists.filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

  console.log('🎨 RENDER - filteredPlaylists:', filteredPlaylists.length);
  console.log('   selectedPlaylistIds:', selectedPlaylistIds);

  const togglePlaylist = (playlistId) => {
    console.log('🎯 Toggle playlist:', playlistId);
    setSelectedPlaylistIds((prev) => {
      const newSelection = prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId)
        : [...prev, playlistId];
      console.log('   New selection:', newSelection);
      return newSelection;
    });
  };

  const handleDone = () => {
    console.log('✅ Done clicked');
    console.log('   Selected:', selectedPlaylistIds);
    console.log('   Existing:', existingPlaylistIds);

    if (onDone) {
      const addedPlaylists = selectedPlaylistIds.filter((id) => !existingPlaylistIds.includes(id));
      const removedPlaylists = existingPlaylistIds.filter(
        (id) => !selectedPlaylistIds.includes(id)
      );
      console.log('   Added:', addedPlaylists);
      console.log('   Removed:', removedPlaylists);
      onDone({ addedPlaylists, removedPlaylists });
    }
    if (onClose) onClose();
  };

  return (
    <View
      className={fullHeight ? '' : 'h-1/2 w-[90%]'}
      style={
        fullHeight
          ? { flex: 1, width: '100%', borderRadius: 8, height: '100%' }
          : { borderRadius: 8 }
      }>
      <BlurCard>
        <View className="border-b border-b-[#898989] p-5">
          <Text className="text-start font-satoshi-medium text-xl text-fg-primary">
            Add to a Playlist
          </Text>
        </View>
        <View className="mx-4">
          <Search
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for a playlist"
            bgColor="bg-bg-main"
          />
        </View>

        {isLoading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#FF6600" />
            <Text className="mt-4 text-fg-secondary">Loading playlists...</Text>
          </View>
        ) : (
          <ScrollView
            style={
              fullHeight
                ? { flex: 1, borderBottomWidth: 1, borderBottomColor: '#898989' }
                : { maxHeight: 300, borderBottomWidth: 1, borderBottomColor: '#898989' }
            }
            showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => setShowCreatePlaylist(true)}
              className="flex flex-row items-center p-3">
              <View className="flex flex-row items-center gap-3">
                <icons.add />
                <Text className="font-satoshi-medium text-fg-primary">New Playlist</Text>
              </View>
            </TouchableOpacity>

            {filteredPlaylists.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text className="text-fg-secondary">No playlists found</Text>
              </View>
            ) : (
              filteredPlaylists.map((playlist) => (
                <AddPlaylistCard
                  key={playlist.id}
                  playlistName={playlist.title}
                  isSelected={selectedPlaylistIds.includes(playlist.id)}
                  isDisabled={playlist.id === allSongsId}
                  onPress={() => togglePlaylist(playlist.id)}
                />
              ))
            )}
          </ScrollView>
        )}

        <View className="flex flex-row items-center justify-center p-4">
          <TouchableOpacity onPress={handleDone} className="rounded-full bg-primary px-8 py-3">
            <Text className="font-satoshi-bold text-base text-fg-primary">Done</Text>
          </TouchableOpacity>
        </View>
      </BlurCard>
      {showCreatePlaylist && (
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
          <CreatePlaylist
            onDone={() => {
              setShowCreatePlaylist(false);
              loadPlaylists();
            }}
            onClose={() => setShowCreatePlaylist(false)}
          />
        </View>
      )}
    </View>
  );
};

export default AddToPlaylist;

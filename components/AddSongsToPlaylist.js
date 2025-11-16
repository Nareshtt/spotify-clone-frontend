import { View, Text, TouchableOpacity, ScrollView, Image, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import BlurCard from './BlurCard';
import Search from './Search';
import icons from '../constants/icons';
import { getAllPlaylists } from '../database/playlistRepository';
import { getSongById } from '../database/songRepository';

const AddSongsToPlaylist = ({ onDone, onClose, playlistId }) => {
  const router = useRouter();
  const [allSongs, setAllSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [selectedSongIds, setSelectedSongIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAllSongs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(allSongs);
    } else {
      const filtered = allSongs.filter((song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSongs(filtered);
    }
  }, [searchQuery, allSongs]);

  const loadAllSongs = async () => {
    try {
      const playlists = await getAllPlaylists();
      const allSongsPlaylist = playlists.find((p) => p.title === 'All Songs');
      if (allSongsPlaylist) {
        const songsData = await Promise.all(
          allSongsPlaylist.songsQueue.map(async (songId) => {
            const song = await getSongById(songId);
            return song;
          })
        );
        const filtered = songsData.filter((s) => s !== null);
        setAllSongs(filtered);
        setFilteredSongs(filtered);
      }
    } catch (error) {
      console.error('Error loading songs:', error);
    }
  };

  const toggleSong = (songId) => {
    setSelectedSongIds((prev) =>
      prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]
    );
  };

  const handleAdd = () => {
    if (onDone) {
      onDone(selectedSongIds);
    }
    if (onClose) onClose();
  };

  const handleAddSongs = () => {
    router.push('/(root)/(tabs)/discover');
    if (onClose) onClose();
  };

  return (
    <View className="h-1/2 w-[90%]" style={{ borderRadius: 8 }}>
      <BlurCard>
        <View className="border-b border-b-[#898989] p-5">
          <Text className="text-start font-satoshi-medium text-xl text-fg-primary">
            Add Songs to Playlist
          </Text>
        </View>
        <View className="mx-4">
          <Search
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for a song"
            bgColor="bg-bg-main"
          />
        </View>
        <ScrollView
          style={{ maxHeight: 300, borderBottomWidth: 1, borderBottomColor: '#898989' }}
          showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={handleAddSongs} className="flex flex-row items-center p-3">
            <View className="flex flex-row items-center gap-3">
              <icons.add />
              <Text className="font-satoshi-bold text-xl text-fg-primary/75">Add Songs</Text>
            </View>
          </TouchableOpacity>
          {filteredSongs.map((song) => (
            <TouchableOpacity
              key={song.id}
              onPress={() => toggleSong(song.id)}
              className="flex flex-row items-center justify-between p-3">
              <View className="flex w-[75%] flex-row items-center gap-3">
                <icons.album />
                <Text
                  className="flex-1 font-satoshi-medium text-xl text-fg-primary/75"
                  numberOfLines={1}>
                  {song.title}
                </Text>
              </View>
              {selectedSongIds.includes(song.id) ? <icons.checkFilled /> : <icons.check />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View className="flex flex-row items-center justify-center gap-3 p-4">
          <TouchableOpacity onPress={onClose} className="rounded-full bg-bg-main px-8 py-3">
            <Text className="font-satoshi-bold text-base text-fg-primary">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAdd}
            className="rounded-full bg-primary px-8 py-3"
            disabled={selectedSongIds.length === 0}
            style={{ opacity: selectedSongIds.length === 0 ? 0.5 : 1 }}>
            <Text className="font-satoshi-bold text-base text-fg-primary">Add</Text>
          </TouchableOpacity>
        </View>
      </BlurCard>
    </View>
  );
};

export default AddSongsToPlaylist;

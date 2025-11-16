import { View, Text, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Search from '@/components/Search';
import Arranger from '@/components/library/Arranger';
import Category from '@/components/library/Category';
import CreatePlaylist from '@/components/CreatePlaylist';
import { getAllCategories } from '@/database/categoryRepository';
import { getPlaylistById } from '@/database/playlistRepository';
import { usePlayer } from '@/context/PlayerContext';

const library = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const insets = useSafeAreaInsets();
  const { libraryRefreshTrigger } = usePlayer();

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  useEffect(() => {
    loadCategories();
  }, [libraryRefreshTrigger]);

  useEffect(() => {
    const timer = setTimeout(() => {
      filterCategories();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, categories]);

  const filterCategories = () => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = categories
      .map((cat) => ({
        ...cat,
        playlists: cat.playlists.filter((p) =>
          p.title.toLowerCase().includes(query)
        ),
      }))
      .filter((cat) => cat.playlists.length > 0);

    setFilteredCategories(filtered);
  };

  const loadCategories = async () => {
    try {
      const cats = await getAllCategories();
      const categoriesWithPlaylists = await Promise.all(
        cats.map(async (cat) => {
          const playlists = await Promise.all(
            cat.playlistIds.map(async (id) => {
              const playlist = await getPlaylistById(id);
              if (!playlist) return null;
              return {
                id: id,
                title: playlist.title,
                songsNumber: playlist.songsQueue.length,
                imageSource: playlist.thumbnailLocation ? { uri: playlist.thumbnailLocation } : null,
              };
            })
          );
          return {
            title: cat.title,
            playlists: playlists.filter(p => p !== null),
          };
        })
      );
      setCategories(categoriesWithPlaylists);
      setFilteredCategories(categoriesWithPlaylists);
    } catch (error) {
      console.log('Retrying categories load...');
      setTimeout(loadCategories, 500);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  const handleCreatePlaylist = () => {
    setShowCreateModal(false);
    loadCategories();
  };

  return (
    <View className="bg-bg-main h-full" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Search
          icon="addSimple"
          placeholder="Search Library"
          value={searchQuery}
          onChangeText={setSearchQuery}
          showClose={searchQuery.length > 0}
          onClear={handleClear}
          onIconPress={() => setShowCreateModal(true)}
        />
        {filteredCategories.map((category) => (
          <Category
            key={category.title}
            title={category.title}
            playlists={category.playlists}
            defaultExpanded={searchQuery.length > 0}
          />
        ))}
        <View style={{ height: 50 }} />
      </ScrollView>
      
      <Modal
        visible={showCreateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }}>
          <CreatePlaylist
            onDone={handleCreatePlaylist}
            onClose={() => setShowCreateModal(false)}
          />
        </View>
      </Modal>
    </View>
  );
};

export default library;

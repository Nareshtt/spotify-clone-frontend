import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import React, { useState, useRef, useEffect } from 'react';
import { BlurView } from 'expo-blur';
import icons from '../../constants/icons';
import IndexPlaylistCard from '../IndexPLaylistCard';
import EditPlaylistCard from './EditPlaylistCard';
import { getPlaylistById } from '../../database/playlistRepository';
import { getCategoryById, updateCategoryPinStatus, updateCategoryHiddenStatus } from '../../database/categoryRepository';
import { usePlayer } from '../../context/PlayerContext';

const PlaylistFeed = ({ feedTitle, playlistIds = [], categoryId }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [playlists, setPlaylists] = useState([]);
  const [category, setCategory] = useState(null);
  const moreButtonRef = useRef(null);


  const { triggerLibraryRefresh, libraryRefreshTrigger } = usePlayer();

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  useEffect(() => {
    loadPlaylists();
  }, [playlistIds, libraryRefreshTrigger]);

  const loadCategory = async () => {
    try {
      const cat = await getCategoryById(categoryId);
      setCategory(cat);
    } catch (error) {
      console.error('Error loading category:', error);
    }
  };

  const loadPlaylists = async () => {
    try {
      const data = await Promise.all(
        playlistIds.map(async (id) => {
          const playlist = await getPlaylistById(id);
          return playlist;
        })
      );
      setPlaylists(data.filter(p => p !== null));
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  const handlePinToggle = async (isPinned) => {
    try {
      await updateCategoryPinStatus(categoryId, isPinned);
      triggerLibraryRefresh();
    } catch (error) {
      console.error('Error updating pin status:', error);
    }
  };

  const handleHideToggle = async (isHidden) => {
    try {
      await updateCategoryHiddenStatus(categoryId, isHidden);
      triggerLibraryRefresh();
    } catch (error) {
      console.error('Error updating hidden status:', error);
    }
  };

  const handleMorePress = () => {
    moreButtonRef.current?.measure((fx, fy, width, height, px, py) => {
      setModalPosition({ x: px, y: py + height - 40 });
      setShowModal(true);
    });
  };

  return (
    <View className="my-5">
      <View className="mx-4 mb-1 flex flex-row justify-between">
        <Text className="font-satoshi-bold text-fg-primary/75 text-2xl">{feedTitle}</Text>
        <TouchableOpacity ref={moreButtonRef} onPress={handleMorePress}>
          <icons.more width={36} height={36} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}>
        <BlurView intensity={20} tint="dark" style={{ flex: 1 }}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowModal(false)}>
            <View
              style={{
                position: 'absolute',
                top: modalPosition.y,
                right: 16,
              }}>
              <EditPlaylistCard
                isPinned={category?.isPinned}
                isHidden={category?.isHidden}
                onPinToggle={handlePinToggle}
                onHideToggle={handleHideToggle}
                onClose={() => setShowModal(false)}
              />
            </View>
          </Pressable>
        </BlurView>
      </Modal>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mx-2">
        {playlists.map((playlist) => (
          <IndexPlaylistCard
            key={playlist.id}
            playlistId={playlist.id}
            imageSource={playlist.thumbnailLocation ? { uri: playlist.thumbnailLocation } : null}
            title={playlist.title}
            description={playlist.description}
            songsNumber={playlist.songsQueue.length}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default PlaylistFeed;

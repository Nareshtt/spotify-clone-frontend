import { View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useCallback, memo, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import BlurCard from '../BlurCard';
import icons from '../../constants/icons';
import {
  getAllCategories,
  updateCategoryPinStatus,
  updateCategoryHiddenStatus,
  updateCategoryOrder,
} from '../../database/categoryRepository';
import { usePlayer } from '../../context/PlayerContext';

// Memoize the playlist item to prevent unnecessary re-renders
const PlaylistItem = memo(({ item, drag, isActive, onTogglePin, onToggleHide }) => {
  const PinIcon = item.pinned ? icons.pinFilled : icons.pin;
  const HideIcon = item.hidden ? icons.showFilled : icons.show;

  return (
    <ScaleDecorator activeScale={1.02}>
      <View
        className="flex flex-row items-center justify-between gap-5 bg-transparent p-3"
        style={{
          opacity: item.hidden ? 0.5 : 1,
          backgroundColor: isActive ? 'rgba(255,255,255,0.05)' : 'transparent',
        }}>
        <View className="flex flex-row items-center gap-1">
          <TouchableOpacity onPress={() => onTogglePin(item.id)} activeOpacity={0.7}>
            <PinIcon width={30} height={30} />
          </TouchableOpacity>
          <Text className="font-satoshi-medium text-fg-primary">{item.title}</Text>
        </View>
        <View className="flex flex-row items-center">
          <TouchableOpacity onLongPress={drag} delayLongPress={100} activeOpacity={0.7}>
            <icons.move2 width={30} height={30} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onToggleHide(item.id)} activeOpacity={0.7}>
            <HideIcon width={30} height={30} />
          </TouchableOpacity>
        </View>
      </View>
    </ScaleDecorator>
  );
});

const EditPlaylist = ({ onClose }) => {
  const [playlists, setPlaylists] = useState([]);
  const { triggerLibraryRefresh } = usePlayer();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const db = await import('../../database/db');
      const cats = await db
        .getDatabase()
        .getAllAsync(
          'SELECT * FROM categories ORDER BY is_pinned DESC, order_index ASC, created_at ASC'
        );
      const formatted = cats.map((cat, index) => ({
        id: cat.id,
        title: cat.title,
        pinned: cat.is_pinned === 1,
        hidden: cat.is_hidden === 1,
        orderIndex: cat.order_index || index,
      }));
      setPlaylists(formatted);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const togglePin = useCallback(
    async (id) => {
      setPlaylists((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, pinned: !item.pinned } : item
        );
        const pinned = updated.filter((item) => item.pinned);
        const unpinned = updated.filter((item) => !item.pinned);
        return [...pinned, ...unpinned];
      });
      const item = playlists.find((p) => p.id === id);
      if (item) {
        await updateCategoryPinStatus(id, !item.pinned);
        triggerLibraryRefresh();
      }
    },
    [playlists, triggerLibraryRefresh]
  );

  const toggleHide = useCallback(
    async (id) => {
      setPlaylists((prev) =>
        prev.map((item) => (item.id === id ? { ...item, hidden: !item.hidden } : item))
      );
      const item = playlists.find((p) => p.id === id);
      if (item) {
        await updateCategoryHiddenStatus(id, !item.hidden);
        triggerLibraryRefresh();
      }
    },
    [playlists, triggerLibraryRefresh]
  );

  const handleDragEnd = useCallback(
    async ({ data }) => {
      setPlaylists(data);
      try {
        await Promise.all(data.map((item, index) => updateCategoryOrder(item.id, index)));
        triggerLibraryRefresh();
      } catch (error) {
        console.error('Error updating order:', error);
      }
    },
    [triggerLibraryRefresh]
  );

  const renderItem = useCallback(
    ({ item, drag, isActive }) => (
      <PlaylistItem
        item={item}
        drag={drag}
        isActive={isActive}
        onTogglePin={togglePin}
        onToggleHide={toggleHide}
      />
    ),
    [togglePin, toggleHide]
  );

  return (
    <BlurCard>
      <View className="p-3">
        <Text className="text-center font-satoshi-bold text-xl text-fg-primary">
          Customize Feed
        </Text>
      </View>
      <View className="border-t border-t-fg-tertiary">
        <TouchableOpacity className="flex flex-row items-center gap-1 p-3">
          <icons.add width={30} height={30} />
          <Text className="font-satoshi-medium text-fg-primary">Select from Library</Text>
        </TouchableOpacity>
        <GestureHandlerRootView style={{ height: 240 }}>
          <DraggableFlatList
            data={playlists}
            onDragEnd={handleDragEnd}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            activationDistance={3}
            dragItemOverflow={false}
            autoscrollSpeed={100}
            autoscrollThreshold={40}
            animationConfig={{
              damping: 25,
              stiffness: 150,
              mass: 0.3,
              overshootClamping: true,
              restSpeedThreshold: 0.01,
              restDisplacementThreshold: 0.01,
            }}
            containerStyle={{ height: 240 }}
          />
        </GestureHandlerRootView>
      </View>
    </BlurCard>
  );
};

export default memo(EditPlaylist);

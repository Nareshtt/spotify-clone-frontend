import { View, Text, ScrollView } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import IndexHeader from '@/components/Index/IndexHeader';
import PlaylistGrid from '@/components/Index/PlaylistGrid';
import PlaylistFeed from '@/components/Index/PlaylistFeed';
import { getAllCategories } from '@/database/categoryRepository';
import { usePlayer } from '@/context/PlayerContext';

const index = () => {
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState([]);
  const { libraryRefreshTrigger } = usePlayer();

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  useEffect(() => {
    loadCategories();
  }, [libraryRefreshTrigger]);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.log('Retrying categories load...');
      setTimeout(loadCategories, 500);
    }
  };

  return (
    <View className="h-full bg-bg-main" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <IndexHeader />
        <PlaylistGrid />
        {categories.map((category) => (
          <PlaylistFeed
            key={category.id}
            categoryId={category.id}
            feedTitle={category.title}
            playlistIds={category.playlistIds}
          />
        ))}
        <View style={{ height: 200 }} />
      </ScrollView>
    </View>
  );
};

export default index;

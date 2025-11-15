import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import IndexHeader from '@/components/Index/IndexHeader';
import PlaylistGrid from '@/components/Index/PlaylistGrid';
import PlaylistFeed from '@/components/Index/PlaylistFeed';

const index = () => {
  const insets = useSafeAreaInsets();
  return (
    <View className="h-full bg-bg-main" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <IndexHeader />
        <PlaylistGrid />
        <PlaylistFeed feedTitle="Made for You" />
        <PlaylistFeed feedTitle="Recently Played" />
        <PlaylistFeed feedTitle="Popular Playlists" />
        <PlaylistFeed feedTitle="Recommended" />
        <View style={{ height: 200 }} />
      </ScrollView>
    </View>
  );
};

export default index;

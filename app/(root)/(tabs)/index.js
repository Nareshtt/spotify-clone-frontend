import { View, Text, ScrollView } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import IndexHeader from '@/components/Index/IndexHeader';
import PlaylistGrid from '@/components/Index/PlaylistGrid';
import PlaylistFeed from '@/components/Index/PlaylistFeed';

const index = () => {
  return (
    <SafeAreaView className="bg-bg-main h-full">
      <ScrollView showsVerticalScrollIndicator={false}>
        <IndexHeader />
        <PlaylistGrid />
        <PlaylistFeed feedTitle="Made for You" />
        <PlaylistFeed feedTitle="Recently Played" />
        <PlaylistFeed feedTitle="Popular Playlists" />
        <PlaylistFeed feedTitle="Recommended" />
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default index;

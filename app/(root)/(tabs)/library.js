import { View, Text, ScrollView } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Search from '@/components/Search';
import Arranger from '@/components/library/Arranger';
import Category from '@/components/library/Category';
const library = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = () => {
    // Add search logic here
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView className="bg-bg-main h-full">
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Search
          icon="addSimple"
          placeholder="Search Library"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          showClose={searchQuery.length > 0}
          onClear={handleClear}
        />
        <Category
          title="Playlists"
          playlists={[
            {
              title: 'Discover Weekly',
              songsNumber: 50,
              imageSource: require('@/assets/image.png'),
            },
            {
              title: 'Daily Mix 1',
              songsNumber: 30,
              imageSource: require('@/assets/image.png'),
            },
            {
              title: 'Liked Songs',
              songsNumber: 120,
              imageSource: require('@/assets/image.png'),
            },
          ]}
        />
        <Category
          title="Albums"
          playlists={[
            {
              title: 'Album 1',
              songsNumber: 12,
              imageSource: require('@/assets/image.png'),
            },
            {
              title: 'Album 2',
              songsNumber: 15,
              imageSource: require('@/assets/image.png'),
            },
          ]}
        />
        <Category
          title="Podcasts"
          playlists={[
            {
              title: 'Tech Talk',
              songsNumber: 45,
              imageSource: require('@/assets/image.png'),
            },
            {
              title: 'Daily News',
              songsNumber: 200,
              imageSource: require('@/assets/image.png'),
            },
          ]}
        />
        <Category
          title="Motivational"
          playlists={[
            {
              title: 'Morning Boost',
              songsNumber: 25,
              imageSource: require('@/assets/image.png'),
            },
            {
              title: 'Workout Mix',
              songsNumber: 40,
              imageSource: require('@/assets/image.png'),
            },
          ]}
        />
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default library;

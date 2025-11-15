import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import Search from '@/components/Search';
import { performSearch } from '@/utils/searchUtils';
import YoutubeVideoHolder from '@/components/discover/YoutubeVideoHolder';

const discover = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    setError(null);
    setLoading(true);
    setHasSearched(true);
    try {
      const data = await performSearch(searchQuery);
      setResults(data);
      console.log('Search Results:', JSON.stringify(data, null, 2));
      data.forEach((item, index) => {
        console.log(`Video ${index + 1}:`);
        console.log('  Title:', item.title);
        console.log('  Thumbnail:', item.thumbnail);
        console.log('  Channel:', item.channelName);
        console.log('  Duration:', item.duration);
        console.log('  VideoId:', item.id);
        console.log('  URL:', item.url);
        console.log('---');
      });
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setResults([]);
    setError(null);
    setHasSearched(false);
  };

  return (
    <View className="bg-bg-main h-full" style={{ paddingTop: insets.top }}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Search
          icon="camera"
          placeholder="what do you want to play?"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          showClose={searchQuery.length > 0}
          onClear={handleClear}
        />

        {loading && (
          <View className="p-4">
            <ActivityIndicator size="large" color="#FF6600" />
          </View>
        )}

        {error && (
          <View className="mx-3 rounded-lg bg-red-900/20 p-4">
            <Text className="font-satoshi-medium text-red-400">{error}</Text>
          </View>
        )}

        {results.length > 0 && (
          <View className="mx-3">
            {results.map((item, index) => (
              <YoutubeVideoHolder
                key={item.id || index}
                videoId={item.id}
                url={item.url}
                thumbnail={item.thumbnail}
                videoDuration={item.duration}
                views={item.views || 'N/A'}
                channelName={item.channelName}
                title={item.title}
              />
            ))}
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

export default discover;

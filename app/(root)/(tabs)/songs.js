import { View, Text, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Search from '@/components/Search';
import SongThumbnail from '@/components/songs/SongThumbnail';
import icons from '@/constants/icons';
import SongCard from '@/components/songs/SongCard';
const Songs = () => {
  const { title, hasImage, songsNumber, duration } = useLocalSearchParams();
  const imageSource = hasImage === 'true' ? require('@/assets/image.png') : null;
  const [searchQuery, setSearchQuery] = useState('');
  const [isShuffle, setIsShuffle] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songs, setSongs] = useState(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      title: `Song ${i + 1}`,
      thumbnail: require('@/assets/image.png'),
    }))
  );

  const handleSearchSubmit = () => {
    // Add search logic here
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  const handleRemoveSong = (index) => {
    setSongs((prev) => prev.filter((_, i) => i !== index));
  };

  const insets = useSafeAreaInsets();

  return (
    <GestureHandlerRootView className="h-full">
      <View style={{ flex: 1, backgroundColor: '#111111' }}>
        <LinearGradient
          colors={['rgba(59,79,182,0.47)', 'rgba(6,6,6,0.47)']}
          locations={[0, 1]}
          style={{ flex: 1, paddingTop: insets.top }}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Search
              icon="sort"
              placeholder="Search in playlist"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              showClose={searchQuery.length > 0}
              onClear={handleClear}
            />
            <SongThumbnail imageSource={imageSource} title={title} />
            <Text className="mx-3 my-2 font-satoshi-bold text-2xl text-fg-primary/85">{title}</Text>
            <View className="mx-3 my-2 flex flex-row gap-3 font-satoshi-light text-fg-secondary">
              <Text className="font-satoshi-light text-fg-secondary">{songsNumber} songs</Text>
              <Text className="font-satoshi-light text-fg-secondary">{duration}</Text>
            </View>
            <View className="mx-3 my-2 flex flex-row items-center justify-between">
              <View className="flex flex-row items-center justify-center">
                <icons.addtoPlaylist />
                <icons.addtoQueue />
              </View>
              <View className="flex flex-row items-center justify-center gap-2">
                <Pressable onPress={() => setIsShuffle(!isShuffle)}>
                  {isShuffle ? <icons.shuffle /> : <icons.loop />}
                </Pressable>
                <Pressable onPress={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <icons.pause /> : <icons.play />}
                </Pressable>
              </View>
            </View>
            <View className="flex gap-2">
              {songs.map((song, index) => (
                <SongCard
                  key={song.id}
                  index={index}
                  thumbnail={song.thumbnail}
                  title={song.title}
                  playlistName={title}
                  songLocation=""
                  onRemove={handleRemoveSong}
                />
              ))}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    </GestureHandlerRootView>
  );
};

export default Songs;

import { View, Text, Pressable, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import icons from '../../constants/icons';
import IndexPlaylistCard from '../IndexPLaylistCard';

const Category = ({ title, playlists = [], defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  return (
    <View>
      <Pressable onPress={() => setIsExpanded(!isExpanded)}>
        <View className="border-bg-secondary/50 mx-3 flex-row items-center justify-between border-b py-7">
          <Text className="font-satoshi-bold text-fg-primary/75 text-2xl">{title}</Text>
          {isExpanded ? (
            <icons.down width={40} height={40} />
          ) : (
            <icons.right width={40} height={40} />
          )}
        </View>
      </Pressable>
      {isExpanded && playlists.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-4">
          {playlists.map((playlist, index) => (
            <IndexPlaylistCard
              key={index}
              playlistId={playlist.id}
              title={playlist.title}
              imageSource={playlist.imageSource}
              description={playlist.description}
              songsNumber={playlist.songsNumber}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Category;

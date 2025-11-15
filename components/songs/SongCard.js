import { View, Text, Image, Pressable } from 'react-native';
import { memo } from 'react';
import { useRouter } from 'expo-router';
import icons from '../../constants/icons';

const SongCard = memo(({ thumbnail, title, index, playlistName, songLocation }) => {
  const router = useRouter();
  const { playSong } = require('../../context/PlayerContext').usePlayer();

  return (
    <Pressable
      className="mx-3 flex-row items-center justify-between py-2"
      onPress={() => {
        playSong({ title, playlistName, thumbnail, songLocation });
      }}>
      <View className="flex-1 flex-row items-center gap-3">
        {thumbnail && (
          <Image
            source={thumbnail}
            style={{ width: 50, height: 50, borderRadius: 4 }}
            resizeMode="cover"
          />
        )}
        <Text className="flex-1 font-satoshi-medium text-xl text-fg-primary/75" numberOfLines={1}>
          {title}
        </Text>
      </View>
      <icons.more />
    </Pressable>
  );
});

export default SongCard;

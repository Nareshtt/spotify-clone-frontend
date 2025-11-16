import { View, Text, Image, Pressable } from 'react-native';
import { memo } from 'react';
import { useRouter } from 'expo-router';
import icons from '../../constants/icons';

const SongCard = memo(
  ({
    thumbnail,
    title,
    index,
    playlistName,
    songLocation,
    videoId,
    queue = [],
    queueIndex = 0,
    songId,
    playlistId,
    onMorePress,
    isCurrentlyPlaying = false,
  }) => {
    const router = useRouter();
    const { playSong } = require('../../context/PlayerContext').usePlayer();

    return (
      <View className="mx-5 flex-row items-center justify-between py-4" style={{ backgroundColor: isCurrentlyPlaying ? 'rgba(255, 102, 0, 0.1)' : 'transparent', borderRadius: 8, paddingHorizontal: 12 }}>
        <Pressable
          className="flex-1 flex-row items-center gap-3"
          style={{ maxWidth: '65%' }}
          onPress={() => {
            playSong({ title, playlistName, thumbnail, songLocation, videoId }, queue, queueIndex);
          }}>
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
        </Pressable>
        <Pressable onPress={() => onMorePress && onMorePress({ thumbnail, title, songId, videoId, playlistId })}>
          <icons.more />
        </Pressable>
      </View>
    );
  }
);

export default SongCard;

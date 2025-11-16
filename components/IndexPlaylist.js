import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';

const IndexPlaylist = ({ playlistId, title, thumbnail }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="rounded-xl bg-bg-secondary p-2"
      onPress={() => router.push(`/(root)/(tabs)/songPage/${playlistId}`)}>
      <View className="flex flex-row items-center justify-start gap-2">
        <Image
          source={thumbnail ? { uri: thumbnail } : require('../assets/image.png')}
          style={{ width: 42, height: 42 }}
          className="rounded-md"
        />
        <Text className="font-satoshi-medium text-base text-fg-primary/75" numberOfLines={1}>
          {title}{' '}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default IndexPlaylist;

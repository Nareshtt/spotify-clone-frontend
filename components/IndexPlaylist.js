import { View, Text, TouchableOpacity, Image } from 'react-native';

const IndexPlaylist = ({ title }) => {
  return (
    <TouchableOpacity className="bg-bg-secondary rounded-xl p-2">
      <View className="flex flex-row items-center justify-start gap-2">
        <Image
          source={require('../assets/image.png')}
          style={{ width: 42, height: 42 }}
          className="rounded-md"
        />
        <Text className="font-satoshi-medium text-fg-primary/75 text-base" numberOfLines={1}>
          {title}{' '}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default IndexPlaylist;

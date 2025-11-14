import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SongThumbnail = ({ imageSource, title, songsNumber, duration }) => {
  return (
    <View className="items-center my-6">
      <View className="relative" style={{ width: 200, height: 220 }}>
        <LinearGradient
          colors={['#1E3A8A', '#2D4A9E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute"
          style={{ top: 11, left: 16, right: 16, height: 200, borderRadius: 8 }}
        />
        <LinearGradient
          colors={['#2D4A9E', '#3B4FB6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute"
          style={{ top: 15, left: 8, right: 8, height: 200, borderRadius: 8 }}
        />
        <View
          className="absolute overflow-hidden rounded-lg"
          style={{
            top: 20,
            left: 0,
            width: 200,
            height: 200,
            backgroundColor: '#1a1a1a',
          }}>
          {imageSource && (
            <Image
              source={imageSource}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              blurRadius={8}
            />
          )}
          <View className="absolute bottom-0 left-0 right-0 p-3">
            <Text
              className="font-satoshi-bold text-fg-primary text-xl"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
              {title}
            </Text>
          </View>
        </View>
      </View>
      {(songsNumber || duration) && (
        <View className="mt-2 flex-row items-center gap-2">
          {songsNumber && (
            <Text className="font-satoshi-medium text-fg-secondary text-sm">
              {songsNumber} songs
            </Text>
          )}
          {songsNumber && duration && (
            <Text className="font-satoshi-medium text-fg-secondary text-sm">•</Text>
          )}
          {duration && (
            <Text className="font-satoshi-medium text-fg-secondary text-sm">
              {duration}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default SongThumbnail;

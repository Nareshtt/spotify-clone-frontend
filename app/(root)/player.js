import { View, Text, Image, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import icons from '@/constants/icons';

const Player = () => {
  const {
    title = 'Get lucky (feat. justien beiber and john micheal howell)',
    playlistName,
    thumbnail,
    songLocation,
  } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#111111' }}>
      <LinearGradient
        colors={['#3b414d', '#272b33']}
        locations={[0, 1]}
        style={{ flex: 1, paddingTop: insets.top }}>
        <View className="mx-4 my-3 flex-row items-center justify-between">
          <Pressable onPress={() => router.push('/(root)/(tabs)')}>
            <icons.down width={36} height={36} />
          </Pressable>
          <View className="flex-1 flex-row items-center justify-center">
            <icons.album width={36} height={36} />
            <Text className="font-satoshi-medium text-base text-fg-primary/70">
              Random Access Memory
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <View className="mx-8 my-8 items-center">
          <Image
            source={thumbnail ? { uri: thumbnail } : require('@/assets/image.png')}
            style={{ width: 320, height: 320, borderRadius: 8 }}
            resizeMode="cover"
          />
        </View>

        <View className="mx-6 my-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1" style={{ marginRight: 12 }}>
              <MaskedView
                maskElement={
                  <LinearGradient
                    colors={['black', 'black', 'transparent']}
                    locations={[0, 0.8, 1]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                }>
                <Text className="font-satoshi-bold text-2xl text-fg-primary" numberOfLines={1}>
                  {title}
                </Text>
              </MaskedView>
            </View>
            <View className="relative left-3 flex flex-row gap-3">
              <Pressable>
                <icons.like />
              </Pressable>
              <Pressable>
                <icons.addtoPlaylist />
              </Pressable>
            </View>
          </View>
        </View>

        <View className="mx-6 my-3">
          <View className="h-1 rounded-xl bg-fg-primary/30">
            <View className="h-1 w-1/3 rounded-xl bg-fg-primary" />
          </View>
          <View className="mt-2 flex-row justify-between">
            <Text className="font-satoshi-light text-xs text-fg-secondary">1:23</Text>
            <Text className="font-satoshi-light text-xs text-fg-secondary">3:45</Text>
          </View>
        </View>

        <View className="mx-6 my-5">
          <View className="relative bottom-3 mb-5 flex-row items-center justify-between">
            <Pressable>
              <icons.shuffle />
            </Pressable>
            <Pressable>
              <icons.prev width={50} height={50} />
            </Pressable>
            <Pressable>
              <icons.play width={50} height={50} />
            </Pressable>
            <Pressable>
              <icons.next width={50} height={50} />
            </Pressable>
            <Pressable>
              <icons.loop />
            </Pressable>
          </View>
          <View className="mt-6 flex-row items-center justify-between">
            <Pressable>
              <icons.device />
            </Pressable>
            <Pressable>
              <icons.share />
            </Pressable>
            <Pressable>
              <icons.lyrics />
            </Pressable>
            <Pressable>
              <icons.queue />
            </Pressable>
            <Pressable>
              <icons.more />
            </Pressable>
          </View>
        </View>

        <View style={{ height: 50 }} />
      </LinearGradient>
    </View>
  );
};

export default Player;

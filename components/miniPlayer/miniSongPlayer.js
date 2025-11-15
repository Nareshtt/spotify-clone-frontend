import { View, Text, Image, Pressable, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { usePlayer } from '../../context/PlayerContext';
import icons from '../../constants/icons';
import { useState } from 'react';
import Option from './option';

const MiniPlayer = () => {
  const { currentSong, isPlaying, setIsPlaying } = usePlayer();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  if (!currentSong) return null;

  return (
    <>
      {showMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View className="absolute inset-0" style={{ zIndex: 1 }} />
        </TouchableWithoutFeedback>
      )}
      <View
        className="absolute bottom-0 left-0 right-0 mx-2"
        style={{ marginBottom: 110, marginHorizontal: 2, zIndex: 2 }}>
        {showMenu && (
          <View className="mb-2 flex-row gap-2">
            <Option Icon={icons.addtoLibrary} onPress={() => setShowMenu(false)} />
            <Option Icon={icons.device} onPress={() => setShowMenu(false)} />
            <Option Icon={icons.like} onPress={() => setShowMenu(false)} />
          </View>
        )}
        <View style={{ borderRadius: 16, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#444850', '#333842']}
            locations={[0.3, 0.9]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}>
            <View>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(root)/player',
                    params: currentSong,
                  })
                }
                onLongPress={() => setShowMenu(!showMenu)}
                className="flex-row items-center justify-between px-4 py-3">
                <View className="flex-1 flex-row items-center gap-3">
                  <Image
                    source={currentSong.thumbnail}
                    style={{ width: 50, height: 50, borderRadius: 4 }}
                    resizeMode="cover"
                  />
                  <Text className="font-satoshi-medium text-lg text-fg-primary" numberOfLines={1}>
                    {currentSong.title}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Pressable>
                    <icons.addtoPlaylist />
                  </Pressable>
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setIsPlaying(!isPlaying);
                    }}>
                    {isPlaying ? <icons.pauseSimple /> : <icons.playSimple />}
                  </Pressable>
                </View>
              </Pressable>
              <View className="mx-4 h-1 rounded-xl bg-fg-primary/30">
                <View className="h-1 w-1/3 rounded-xl bg-fg-primary" />
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </>
  );
};

export default MiniPlayer;

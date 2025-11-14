import { View, Text, Image, Pressable, Animated } from 'react-native';
import { useRef, useState, useEffect } from 'react';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import icons from '../../constants/icons';

const SongCard = ({ thumbnail, title, onRemove, index, playlistName, songLocation }) => {
  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  const [isRemoving, setIsRemoving] = useState(false);
  const [showUndo, setShowUndo] = useState(false);

  useEffect(() => {
    if (showUndo) {
      const timer = setTimeout(() => {
        setShowUndo(false);
        onRemove?.(index);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showUndo]);

  const onGestureEvent = Animated.event([{ nativeEvent: { translationX: translateX } }], {
    useNativeDriver: false,
  });

  const onHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.END) {
      if (nativeEvent.translationX < -100) {
        // Swiped left enough to remove
        Animated.timing(translateX, {
          toValue: -400,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          setIsRemoving(true);
          setShowUndo(true);
        });
      } else {
        // Snap back
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleUndo = () => {
    setShowUndo(false);
    setIsRemoving(false);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
  };

  if (showUndo && isRemoving) {
    return (
      <View className="mx-3 my-1 flex-row items-center justify-center rounded-lg py-4">
        <Pressable onPress={handleUndo}>
          <Text className="font-satoshi-bold text-lg text-white">Undo</Text>
        </Pressable>
      </View>
    );
  }

  // Calculate red background width based on swipe
  const redWidth = translateX.interpolate({
    inputRange: [-400, 0],
    outputRange: [400, 0],
    extrapolate: 'clamp',
  });

  // Calculate red background opacity for smooth fade-in
  const redOpacity = translateX.interpolate({
    inputRange: [-100, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // Show "Remove" text only after swiping 60 pixels
  const textOpacity = translateX.interpolate({
    inputRange: [-100, -100, 0],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  return (
    <View className="relative mx-3 overflow-hidden">
      {/* Red background that follows the swipe */}
      <Animated.View
        className="absolute bottom-0 right-0 top-0 flex-row items-center justify-end"
        style={{
          width: redWidth,
          backgroundColor: '#B63F3F',
          opacity: redOpacity,
        }}>
        <Animated.View
          className="mr-6 flex-row items-center gap-2"
          style={{ opacity: textOpacity }}>
          <icons.close />
          <Text className="font-satoshi-medium text-lg text-white">Remove</Text>
        </Animated.View>
      </Animated.View>

      {/* Main card content */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}>
        <Animated.View
          className="flex-row items-center justify-between py-2"
          style={{ transform: [{ translateX }] }}>
          <Pressable
            className="flex-1 flex-row items-center gap-3"
            onPress={() =>
              router.push({
                pathname: '/(root)/player',
                params: { title, playlistName, thumbnail, songLocation },
              })
            }>
            {thumbnail && (
              <Image
                source={thumbnail}
                style={{ width: 50, height: 50, borderRadius: 4 }}
                resizeMode="cover"
              />
            )}
            <Text
              className="flex-1 font-satoshi-light text-xl text-fg-primary/75"
              numberOfLines={1}>
              {title}
            </Text>
          </Pressable>
          <icons.more />
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default SongCard;

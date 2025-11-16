import { View, Text, Pressable, Image } from 'react-native';
import { BlurView } from 'expo-blur';

const option = ({ Icon, imageSource, onPress, disabled = false, active = false }) => {
  return (
    <Pressable
      style={{ flex: 1, borderRadius: 16, overflow: 'hidden', opacity: disabled ? 0.3 : 1 }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}>
      <BlurView intensity={20} tint="dark" style={{ flex: 1 }}>
        <View
          style={{
            backgroundColor: active ? 'rgba(88, 92, 100, 0.9)' : 'rgba(68, 72, 80, 0.9)',
            paddingHorizontal: 16,
            paddingVertical: 12,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 48,
          }}>
          {imageSource ? (
            <Image source={imageSource} style={{ width: 40, height: 40 }} resizeMode="contain" />
          ) : Icon ? (
            <Icon width={40} height={40} />
          ) : null}
          {active && (
            <View
              style={{
                position: 'absolute',
                top: 17,
                right: 52,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: '#ff6600',
              }}
            />
          )}
        </View>
      </BlurView>
    </Pressable>
  );
};

export default option;

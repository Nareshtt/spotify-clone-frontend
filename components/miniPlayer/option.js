import { View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';

const option = ({ Icon, onPress }) => {
  return (
    <Pressable style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }} onPress={onPress}>
      <BlurView intensity={20} tint="dark" style={{ flex: 1 }}>
        <View
          style={{ backgroundColor: 'rgba(68, 72, 80, 0.9)' }}
          className="items-center justify-center px-4 py-3">
          <Icon />
        </View>
      </BlurView>
    </Pressable>
  );
};

export default option;

import { View, Text } from 'react-native';
import React from 'react';

const BlurCard = ({ children, style }) => {
  return (
    <View className="rounded-md bg-bg-secondary" style={style}>
      {children}
    </View>
  );
};

export default BlurCard;

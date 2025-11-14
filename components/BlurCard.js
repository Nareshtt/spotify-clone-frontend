import { View, Text } from 'react-native';
import React from 'react';

const BlurCard = ({ children }) => {
  return <View className="bg-bg-secondary flex-1 rounded-md">{children}</View>;
};

export default BlurCard;

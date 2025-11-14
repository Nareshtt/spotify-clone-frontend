import { View, Text } from 'react-native';
import icons from '../../constants/icons';

const Arranger = () => {
  return (
    <View className="mx-3 flex flex-row items-center justify-start gap-5">
      <View className="flex flex-row items-center justify-center">
        <icons.filter width={36} height={36} />
        <Text className="font-satoshi-light text-fg-secondary text-base">Group</Text>
      </View>
      <View className="flex flex-row items-center justify-center">
        <Text className="font-satoshi-light text-fg-secondary text-base">Recents</Text>
        <icons.grid width={36} height={36} />
      </View>
    </View>
  );
};

export default Arranger;

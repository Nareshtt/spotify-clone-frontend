import { View, Text, TouchableOpacity } from 'react-native';
import icons from '../constants/icons';

const AddPlaylistCard = ({ playlistName, isSelected, isDisabled, onPress }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={isDisabled}
      className="flex flex-row items-center justify-between p-3"
      style={{ opacity: isDisabled ? 0.6 : 1 }}
    >
      <View className="flex flex-row items-center gap-3">
        <icons.playlist />
        <Text className="font-satoshi-medium text-fg-primary">{playlistName}</Text>
      </View>
      {isSelected ? <icons.checkFilled /> : <icons.check />}
    </TouchableOpacity>
  );
};

export default AddPlaylistCard;

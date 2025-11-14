import { View, Text, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import BlurCard from '../BlurCard';
import icons from '../../constants/icons';

const EditPlaylistCard = ({ onClose }) => {
  const [isPinned, setIsPinned] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const handlePinToggle = () => {
    setIsPinned(!isPinned);
    onClose();
  };

  const handleHideToggle = () => {
    setIsHidden(!isHidden);
    onClose();
  };

  const PinIcon = isPinned ? icons.pinFilled : icons.pin;
  const HideIcon = isHidden ? icons.showFilled : icons.show;

  return (
    <BlurCard>
      <View className="p-2">
        <TouchableOpacity className="flex-row items-center gap-2 p-3" onPress={handlePinToggle}>
          <PinIcon width={24} height={24} />
          <Text className="font-satoshi-medium text-fg-secondary">
            {isPinned ? 'Unpin from Home' : 'Pin to Home'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-row items-center gap-2 p-3" onPress={handleHideToggle}>
          <HideIcon width={24} height={24} />
          <Text className="font-satoshi-medium text-fg-secondary">
            {isHidden ? 'Show this section' : 'Hide this section'}
          </Text>
        </TouchableOpacity>
      </View>
    </BlurCard>
  );
};

export default EditPlaylistCard;

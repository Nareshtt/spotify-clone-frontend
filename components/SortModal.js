import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import BlurCard from './BlurCard';

const SortModal = ({ currentSort, onSortChange, onClose }) => {
  const sortOptions = [
    { id: 'title', label: 'Title' },
    { id: 'duration', label: 'Song Duration' },
    { id: 'recent', label: 'Recently Added' },
    { id: 'random', label: 'Random' },
  ];

  return (
    <View className="h-[35%] w-[90%]" style={{ borderRadius: 8 }}>
      <BlurCard>
        <View className="border-b border-b-[#898989] p-5">
          <Text className="text-start font-satoshi-medium text-xl text-fg-primary">
            Sort By Order
          </Text>
        </View>
        <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
          {sortOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => {
                onSortChange(option.id);
                onClose();
              }}
              className="flex flex-row items-center justify-between p-7"
              style={{
                backgroundColor:
                  currentSort === option.id ? 'rgba(255, 102, 0, 0.1)' : 'transparent',
              }}>
              <Text
                className="font-satoshi-medium text-xl text-fg-primary"
                style={{ color: currentSort === option.id ? '#ff6600' : '#fff' }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </BlurCard>
    </View>
  );
};

export default SortModal;

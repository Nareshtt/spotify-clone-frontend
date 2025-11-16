import { Text, TouchableOpacity } from 'react-native';

const IndexCategory = ({ title, isActive, onPress }) => {
  return (
    <TouchableOpacity
      className={`rounded-xl px-4 ${isActive ? 'bg-primary/85' : 'bg-bg-secondary'}`}
      style={{ paddingVertical: 8 }}
      onPress={onPress}>
      <Text
        className={`text-sm text-fg-primary ${isActive ? 'font-satoshi-medium' : 'font-satoshi-light'}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default IndexCategory;

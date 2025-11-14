import { View, Text, TextInput, Pressable, Keyboard } from 'react-native';
import React, { useRef, useEffect } from 'react';
import icons from '../constants/icons';

const Search = ({
  icon,
  placeholder = 'What do you want to play?',
  value,
  onChangeText,
  onIconPress,
  onSubmitEditing,
  showClose = false,
  onClear,
}) => {
  const IconComponent = icons[icon];
  const inputRef = useRef(null);

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      inputRef.current?.blur();
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSearchIconPress = () => {
    if (showClose && onClear) {
      onClear();
      inputRef.current?.focus();
    } else {
      inputRef.current?.focus();
    }
  };

  return (
    <View className="mx-3 my-3 flex flex-row items-center gap-3">
      <View className="bg-bg-secondary/50 flex-1 flex-row items-center gap-3 rounded-lg px-2">
        <TextInput
          ref={inputRef}
          placeholder={placeholder}
          placeholderTextColor="#898989"
          cursorColor="#FF6600"
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
          className="font-satoshi-medium text-fg-primary flex-1 py-3 text-base"
        />
        <Pressable onPress={handleSearchIconPress}>
          {showClose ? (
            <icons.close width={40} height={40} />
          ) : (
            <icons.search width={36} height={36} />
          )}
        </Pressable>
      </View>
      {IconComponent && (
        <Pressable>
          <IconComponent width={40} height={40} />
        </Pressable>
      )}
    </View>
  );
};

export default Search;

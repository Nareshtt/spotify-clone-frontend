import { View, Text, TouchableOpacity, TextInput, FlatList, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import BlurCard from './BlurCard';
import icons from '../constants/icons';
import {
  getAllCategories,
  addCategory,
  addPlaylistToCategory,
} from '../database/categoryRepository';
import { addPlaylist } from '../database/playlistRepository';

const CreatePlaylist = ({ onDone, onClose }) => {
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [categoryInput, setCategoryInput] = useState('');
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (categoryInput.trim()) {
      const filtered = categories.filter((cat) =>
        cat.title.toLowerCase().includes(categoryInput.toLowerCase())
      );
      setFilteredCategories(filtered);
      // Only show suggestions if input doesn't exactly match any category
      const exactMatch = categories.some(
        (cat) => cat.title.toLowerCase() === categoryInput.toLowerCase()
      );
      setShowCategorySuggestions(!exactMatch && filtered.length > 0);
    } else {
      setShowCategorySuggestions(false);
    }
  }, [categoryInput, categories]);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      setTimeout(loadCategories, 500);
    }
  };

  const selectCategory = (categoryTitle) => {
    setCategoryInput(categoryTitle);
    setShowCategorySuggestions(false);
  };

  const handleCreate = async () => {
    if (!categoryInput.trim()) return;

    try {
      if (playlistTitle.trim()) {
        const playlistId = await addPlaylist(playlistTitle, null, [], 0, '');
        const existingCategory = categories.find(
          (cat) => cat.title.toLowerCase() === categoryInput.toLowerCase()
        );
        if (existingCategory) {
          await addPlaylistToCategory(existingCategory.id, playlistId);
        } else {
          await addCategory(categoryInput, [playlistId]);
        }
      } else {
        const existingCategory = categories.find(
          (cat) => cat.title.toLowerCase() === categoryInput.toLowerCase()
        );
        if (!existingCategory) {
          await addCategory(categoryInput, []);
        }
      }

      if (onDone) onDone();
      if (onClose) onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  return (
    <View className="h-[65%] w-[90%] rounded-lg">
      <BlurCard>
        <View className="border-b border-b-[#898989] p-5">
          <Text className="text-start font-satoshi-medium text-xl text-fg-primary">
            Create Playlist
          </Text>
        </View>

        <ScrollView style={{ maxHeight: 230 }} showsVerticalScrollIndicator={false}>
          <View className=" flex gap-5 px-5 pb-3 pt-5">
            <View>
              {/* Category Input */}
              <View>
                <Text className="mb-2 font-satoshi-medium text-fg-secondary">Category *</Text>
                <TextInput
                  value={categoryInput}
                  onChangeText={setCategoryInput}
                  placeholder="Search or create category"
                  placeholderTextColor="#898989"
                  className="rounded-lg bg-bg-main px-4 py-3 font-satoshi-medium text-fg-primary"
                />
              </View>

              {/* Category Suggestions Dropdown */}
              {showCategorySuggestions && filteredCategories.length > 0 && (
                <View className="mb-4 mt-2 overflow-hidden rounded-xl">
                  {filteredCategories.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => selectCategory(item.title)}
                      className="bg-bg-primary px-4 py-3"
                      style={{
                        borderBottomWidth: index < filteredCategories.length - 1 ? 1 : 0,
                        borderBottomColor: '#898989',
                      }}>
                      <Text className="font-satoshi-medium text-fg-primary">{item.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Playlist Title Input */}
            <View className="mb-4">
              <Text className="mb-2 font-satoshi-medium text-fg-secondary">
                Playlist Title (Optional)
              </Text>
              <TextInput
                value={playlistTitle}
                onChangeText={setPlaylistTitle}
                placeholder="Enter playlist name"
                placeholderTextColor="#898989"
                className="rounded-lg bg-bg-main px-4 py-3 font-satoshi-medium text-fg-primary"
              />
            </View>
          </View>
        </ScrollView>

        <View className="flex flex-row items-center justify-center gap-3 border-t border-t-[#898989] p-4">
          <TouchableOpacity onPress={onClose} className="rounded-full bg-bg-main px-8 py-3">
            <Text className="font-satoshi-bold text-base text-fg-primary">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCreate}
            className="rounded-full bg-primary px-8 py-3"
            disabled={!categoryInput.trim()}
            style={{ opacity: !categoryInput.trim() ? 0.5 : 1 }}>
            <Text className="font-satoshi-bold text-base text-fg-primary">Create</Text>
          </TouchableOpacity>
        </View>
      </BlurCard>
    </View>
  );
};

export default CreatePlaylist;

import { useState, useEffect } from 'react';
import { TouchableOpacity, View, Modal, Pressable, Animated } from 'react-native';
import { useRef } from 'react';
import IndexCategory from '../IndexCategory';
import icons from '../../constants/icons';
import EditPlaylist from './EditPlaylist';

const IndexHeader = () => {
  const [activeCategory, setActiveCategory] = useState('Music');
  const [showModal, setShowModal] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Pre-render component after initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasOpened(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showModal) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showModal]);

  const handleAdjustPress = () => {
    if (!hasOpened) setHasOpened(true);
    setShowModal(true);
  };

  return (
    <View className="m-3 flex flex-row items-center justify-between">
      <View className="flex flex-row gap-3">
        <IndexCategory
          title="Music"
          isActive={activeCategory === 'Music'}
          onPress={() => setActiveCategory('Music')}
        />
        <IndexCategory
          title="Podcasts"
          isActive={activeCategory === 'Podcasts'}
          onPress={() => setActiveCategory('Podcasts')}
        />
        <IndexCategory
          title="Audiobooks"
          isActive={activeCategory === 'Audiobooks'}
          onPress={() => setActiveCategory('Audiobooks')}
        />
      </View>
      <TouchableOpacity onPress={handleAdjustPress}>
        <icons.adjust width={40} height={40} />
      </TouchableOpacity>

      {hasOpened && (
        <Modal
          visible={showModal}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={() => setShowModal(false)}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowModal(false)}>
            <Animated.View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                opacity: fadeAnim,
              }}
              pointerEvents="none"
            />
            <Animated.View
              style={{
                position: 'absolute',
                top: 80,
                right: 16,
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }}
              pointerEvents="box-none">
              <EditPlaylist onClose={() => setShowModal(false)} />
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

export default IndexHeader;

import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable } from 'react-native';
import React, { useState, useRef } from 'react';
import { BlurView } from 'expo-blur';
import icons from '../../constants/icons';
import IndexPlaylistCard from '../IndexPLaylistCard';
import EditPlaylistCard from './EditPlaylistCard';

const PlaylistFeed = ({ feedTitle }) => {
  const [showModal, setShowModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const moreButtonRef = useRef(null);

  const handleMorePress = () => {
    moreButtonRef.current?.measure((fx, fy, width, height, px, py) => {
      setModalPosition({ x: px, y: py + height - 40 });
      setShowModal(true);
    });
  };

  return (
    <View className="my-5">
      <View className="mx-4 mb-1 flex flex-row justify-between">
        <Text className="font-satoshi-bold text-fg-primary/75 text-2xl">{feedTitle}</Text>
        <TouchableOpacity ref={moreButtonRef} onPress={handleMorePress}>
          <icons.more width={36} height={36} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}>
        <BlurView intensity={20} tint="dark" style={{ flex: 1 }}>
          <Pressable style={{ flex: 1 }} onPress={() => setShowModal(false)}>
            <View
              style={{
                position: 'absolute',
                top: modalPosition.y,
                right: 16,
              }}>
              <EditPlaylistCard onClose={() => setShowModal(false)} />
            </View>
          </Pressable>
        </BlurView>
      </Modal>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mx-2">
        <IndexPlaylistCard
          imageSource={require('../../assets/image.png')}
          title="Midnight Dreams"
          description="Chill vibes for late night sessions"
          songsNumber={42}
        />
        <IndexPlaylistCard
          imageSource={require('../../assets/image.png')}
          title="Summer Hits"
          description="Top tracks for sunny days"
          songsNumber={65}
        />
        <IndexPlaylistCard
          imageSource={require('../../assets/image.png')}
          title="Focus Flow"
          description="Deep focus and productivity"
          songsNumber={38}
        />
        <IndexPlaylistCard
          imageSource={require('../../assets/image.png')}
          title="Party Mix"
          description="Get the party started"
          songsNumber={80}
        />
        <IndexPlaylistCard
          imageSource={require('../../assets/image.png')}
          title="Acoustic Chill"
          description="Relaxing acoustic melodies"
          songsNumber={55}
        />
        <IndexPlaylistCard
          imageSource={require('../../assets/image.png')}
          title="90s Nostalgia"
          description="Best hits from the 90s"
          songsNumber={72}
        />
        <IndexPlaylistCard
          imageSource={require('../../assets/image.png')}
          title="Deep House"
          description="Underground house beats"
          songsNumber={48}
        />
      </ScrollView>
    </View>
  );
};

export default PlaylistFeed;

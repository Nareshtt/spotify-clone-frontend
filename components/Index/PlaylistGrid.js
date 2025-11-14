import { View, Text } from 'react-native';
import React from 'react';
import IndexPlaylist from '../IndexPlaylist';

const PlaylistGrid = () => {
  return (
    <View className="mx-3 my-5 flex-row flex-wrap gap-2">
      <View style={{ width: '48%' }}>
        <IndexPlaylist title="Liked Songs" />
      </View>
      <View style={{ width: '48%' }}>
        <IndexPlaylist title="Chill Vibes" />
      </View>
      <View style={{ width: '48%' }}>
        <IndexPlaylist title="Workout Mix" />
      </View>
      <View style={{ width: '48%' }}>
        <IndexPlaylist title="Top Hits 2024" />
      </View>
      <View style={{ width: '48%' }}>
        <IndexPlaylist title="Jazz Classics" />
      </View>
      <View style={{ width: '48%' }}>
        <IndexPlaylist title="Road Trip" />
      </View>
    </View>
  );
};

export default PlaylistGrid;

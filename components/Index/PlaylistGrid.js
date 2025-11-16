import { View, Text } from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import IndexPlaylist from '../IndexPlaylist';
import { getAllPlaylists } from '../../database/playlistRepository';
import { usePlayer } from '../../context/PlayerContext';

const PlaylistGrid = () => {
  const [playlists, setPlaylists] = useState([]);
  const { libraryRefreshTrigger } = usePlayer();

  useFocusEffect(
    useCallback(() => {
      loadPlaylists();
    }, [])
  );

  useEffect(() => {
    loadPlaylists();
  }, [libraryRefreshTrigger]);

  const loadPlaylists = async () => {
    try {
      const data = await getAllPlaylists();
      setPlaylists(data);
      console.log('Playlists loaded:', data);
    } catch (error) {
      console.log('Retrying playlist load...');
      setTimeout(loadPlaylists, 500);
    }
  };

  return (
    <View className="mx-3 my-5 flex-row flex-wrap gap-2">
      {playlists.slice(0, 6).map((playlist) => (
        <View key={playlist.id} style={{ width: '48%' }}>
          <IndexPlaylist 
            playlistId={playlist.id}
            title={playlist.title}
            thumbnail={playlist.thumbnailLocation}
          />
        </View>
      ))}
    </View>
  );
};

export default PlaylistGrid;

import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { getThumbnailUrl } from '@/utils/uiUtils';
import { downloadVideo } from '@/utils/downloadUtils';
import icons from '@/constants/icons';

const YoutubeVideoHolder = ({ thumbnail, videoDuration, channelName, title, url }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading || isDownloaded) return;

    setIsDownloading(true);
    try {
      await downloadVideo({ title, url });
      setIsDownloaded(true);
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloaded(false);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View className="bg-bg-secondary/50 mb-4 rounded-lg">
      <View className="relative">
        <Image
          source={{ uri: getThumbnailUrl(thumbnail) }}
          style={{ width: '100%', height: 200, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,1)']}
          locations={[0, 0.3, 0.6, 1]}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
          }}
        />
        <TouchableOpacity
          onPress={handleDownload}
          disabled={isDownloading}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: [{ translateX: -30 }, { translateY: -30 }],
            width: 60,
            height: 60,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {isDownloading ? (
            <ActivityIndicator size="large" color="#FF6600" />
          ) : isDownloaded ? (
            <icons.checkFilled width={60} height={60} />
          ) : (
            <icons.download width={60} height={60} />
          )}
        </TouchableOpacity>
        <View
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: '#FF6600',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}>
          <Text className="font-satoshi-bold text-fg-primary text-xs">{videoDuration}</Text>
        </View>
      </View>
      <View className="p-3">
        <Text className="font-satoshi-bold text-fg-primary mb-1  text-xl" numberOfLines={2}>
          {title}
        </Text>
        <Text className="font-satoshi-medium text-fg-secondary text-base" numberOfLines={1}>
          {channelName}
        </Text>
      </View>
    </View>
  );
};

export default YoutubeVideoHolder;

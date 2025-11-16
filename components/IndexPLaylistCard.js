import { View, Text, Image, Pressable } from 'react-native';
import React, { useMemo } from 'react';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import PlaylistCoverPlaceholder from './PlaylistCoverPlaceholder';

const IndexPlaylistCard = ({
  playlistId,
  title = 'Discover Weekly',
  imageSource,
  description,
  songsNumber = 50,
  duration = '2h 30m',
}) => {
  // Hash-based color generator for consistent randomness
  const { neonColors, darkColors } = useMemo(() => {
    const colorSets = [
      { neon: ['#B026FF', '#6C29E8'], dark: ['#4A1066', '#2D1159'] }, // purple
      { neon: ['#00D4FF', '#0099CC'], dark: ['#005566', '#003D4D'] }, // cyan
      { neon: ['#00FF88', '#00CC6A'], dark: ['#006637', '#004D2A'] }, // green
      { neon: ['#FF006E', '#CC0058'], dark: ['#66002C', '#4D0022'] }, // pink
      { neon: ['#FFD60A', '#CCAB08'], dark: ['#665504', '#4D4003'] }, // yellow
      { neon: ['#FF6600', '#CC4B00'], dark: ['#662600', '#4D1D00'] }, // orange
      { neon: ['#00FFF0', '#00CCC0'], dark: ['#006660', '#004D4A'] }, // teal
      { neon: ['#FF00FF', '#CC00CC'], dark: ['#660066', '#4D004D'] }, // magenta
      { neon: ['#FF4444', '#CC0000'], dark: ['#661111', '#4D0000'] }, // red
      { neon: ['#4169E1', '#1E3A8A'], dark: ['#1A2B5C', '#0F1D3D'] }, // blue
      { neon: ['#9D4EDD', '#7B2CBF'], dark: ['#3E1F56', '#2A1540'] }, // violet
      { neon: ['#06FFA5', '#00CC7E'], dark: ['#026642', '#014D31'] }, // mint
      { neon: ['#FF69B4', '#FF1493'], dark: ['#661F46', '#4D0F37'] }, // hot pink
      { neon: ['#FFB347', '#FF8C00'], dark: ['#66381C', '#4D2A15'] }, // amber
      { neon: ['#40E0D0', '#20B2AA'], dark: ['#1A5A54', '#13423F'] }, // turquoise
      { neon: ['#DA70D6', '#BA55D3'], dark: ['#572D56', '#431F43'] }, // orchid
      { neon: ['#32CD32', '#228B22'], dark: ['#14520E', '#0D3D0A'] }, // lime
      { neon: ['#FF6347', '#DC143C'], dark: ['#66281C', '#4D1E15'] }, // tomato
      { neon: ['#8A2BE2', '#6A0DAD'], dark: ['#37125A', '#290D44'] }, // blue violet
      { neon: ['#00CED1', '#008B8B'], dark: ['#005252', '#003D3D'] }, // dark turquoise
    ];

    // Simple hash function based on title
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = (hash << 5) - hash + title.charCodeAt(i);
      hash = hash & hash;
    }
    const index = Math.abs(hash) % colorSets.length;

    return {
      neonColors: colorSets[index].neon,
      darkColors: colorSets[index].dark,
    };
  }, [title]);

  const router = useRouter();

  return (
    <Pressable
      className="mx-2"
      style={{ width: 160 }}
      onPress={() =>
        router.push({
          pathname: `/(root)/(tabs)/songPage/${playlistId}`,
        })
      }>
      {/* Card Stack Container */}
      <View className="relative overflow-hidden" style={{ width: 160, height: 180 }}>
        {/* Third card (most behind) - at the very top */}
        <LinearGradient
          colors={[darkColors[1], darkColors[0]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute"
          style={{
            top: 5,
            left: 16,
            right: 16,
            height: 160,
            borderRadius: 6,
          }}
        />

        {/* Second card (middle) */}
        <LinearGradient
          colors={[darkColors[0], neonColors[1]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute"
          style={{
            top: 12,
            left: 8,
            right: 8,
            height: 160,
            borderRadius: 6,
          }}
        />

        {/* Main card - positioned lower to show the stacked cards above */}
        <View
          className="absolute overflow-hidden rounded-md"
          style={{
            top: 20,
            left: 0,
            width: 160,
            height: 160,
            backgroundColor: '#333842',
            shadowColor: neonColors[0],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}>
          {/* Image with blur if provided */}
          {imageSource ? (
            <>
              <Image
                source={imageSource}
                style={{ width: '100%', height: '100%', position: 'absolute' }}
                resizeMode="cover"
              />
            </>
          ) : (
            // If no image, show placeholder with icon
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <PlaylistCoverPlaceholder size={160} />
            </View>
          )}
          {/* Title at bottom left */}
          <View className="absolute bottom-0 left-0 right-0 p-3">
            <Text
              className="font-satoshi-bold text-lg text-fg-primary"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}>
              {title}
            </Text>
          </View>
        </View>
      </View>

      {/* Info Section Below Card */}
      <View className="mt-2">
        <View className="mb-1 flex-row items-center justify-between">
          <Text className="font-satoshi-bold text-sm text-fg-primary" numberOfLines={1}>
            {title}
          </Text>
          <Text className="ml-2 font-satoshi-medium text-xs text-primary">{songsNumber}</Text>
        </View>
        {description && (
          <Text className="font-satoshi-regular text-xs text-fg-secondary" numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>
    </Pressable>
  );
};

export default IndexPlaylistCard;

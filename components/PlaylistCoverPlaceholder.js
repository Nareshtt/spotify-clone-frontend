import { View } from 'react-native';
import icons from '../constants/icons';

const PlaylistCoverPlaceholder = ({ size = 150 }) => {
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      {/* Back card */}
      <View
        className="absolute rounded-lg bg-bg-secondary"
        style={{
          width: size * 0.9,
          height: size * 0.9,
          top: size * 0.1,
          left: size * 0.05,
          transform: [{ rotate: '-5deg' }],
        }}
      />
      {/* Middle card */}
      <View
        className="absolute rounded-lg bg-bg-secondary"
        style={{
          width: size * 0.95,
          height: size * 0.95,
          top: size * 0.05,
          left: size * 0.025,
          transform: [{ rotate: '-2deg' }],
        }}
      />
      {/* Front card with icon */}
      <View
        className="absolute items-center justify-center rounded-lg bg-bg-secondary"
        style={{ width: size, height: size }}>
        <icons.song width={size * 0.4} height={size * 0.4} />
      </View>
    </View>
  );
};

export default PlaylistCoverPlaceholder;

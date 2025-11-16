import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';

const Slider = ({
  value,
  minimumValue = 0,
  maximumValue = 100,
  onSlidingComplete,
  minimumTrackTintColor = '#FFFFFF',
  maximumTrackTintColor = 'rgba(255, 255, 255, 0.3)',
  thumbTintColor = '#FFFFFF',
  style,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const progress = useSharedValue(0);
  const offsetX = useSharedValue(0);

  // Sync progress from external value
  useEffect(() => {
    if (!isDragging && maximumValue > 0) {
      const newProgress = (value - minimumValue) / (maximumValue - minimumValue);
      const clampedProgress = Math.max(0, Math.min(1, newProgress));
      // Only update if there's a significant difference
      if (Math.abs(progress.value - clampedProgress) > 0.01) {
        progress.value = clampedProgress;
      }
    }
  }, [value, minimumValue, maximumValue, isDragging]);

  const handleSlidingComplete = (progressValue) => {
    if (onSlidingComplete && maximumValue > 0) {
      const newValue = minimumValue + progressValue * (maximumValue - minimumValue);
      onSlidingComplete(Math.max(minimumValue, Math.min(maximumValue, newValue)));
    }
    // Delay isDragging false to prevent value update fighting with gesture
    setTimeout(() => setIsDragging(false), 300);
  };

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      runOnJS(setIsDragging)(true);
      // Calculate where user touched relative to slider
      if (sliderWidth > 0) {
        offsetX.value = e.x;
        const newProgress = Math.max(0, Math.min(1, e.x / sliderWidth));
        progress.value = newProgress;
      }
    })
    .onUpdate((e) => {
      if (sliderWidth > 0) {
        // Update progress based on current touch position
        const newProgress = Math.max(
          0,
          Math.min(1, (offsetX.value + e.translationX) / sliderWidth)
        );
        progress.value = newProgress;
      }
    })
    .onEnd(() => {
      runOnJS(handleSlidingComplete)(progress.value);
    });

  const tapGesture = Gesture.Tap().onEnd((e) => {
    if (sliderWidth > 0) {
      const newProgress = Math.max(0, Math.min(1, e.x / sliderWidth));
      progress.value = newProgress;
      runOnJS(handleSlidingComplete)(newProgress);
    }
  });

  const gesture = Gesture.Race(panGesture, tapGesture);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    left: `${progress.value * 100}%`,
  }));

  return (
    <View style={[{ width: '100%', paddingHorizontal: 16 }, style]}>
      <View
        style={{ height: 40, justifyContent: 'center' }}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width - 32)}>
        <GestureDetector gesture={gesture}>
          <View style={{ height: 40, justifyContent: 'center' }}>
            {/* Invisible touch area - makes the whole height tappable */}
            <View style={{ position: 'absolute', width: '100%', height: 40 }} />

            <View style={{ height: 4, position: 'relative' }}>
              {/* Background track */}
              <View
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: 4,
                  backgroundColor: maximumTrackTintColor,
                  borderRadius: 2,
                }}
              />

              {/* Progress track */}
              <Animated.View
                style={[
                  progressStyle,
                  {
                    position: 'absolute',
                    height: 4,
                    backgroundColor: minimumTrackTintColor,
                    borderRadius: 2,
                  },
                ]}
              />

              {/* Thumb */}
              <Animated.View
                style={[
                  thumbStyle,
                  {
                    position: 'absolute',
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    backgroundColor: thumbTintColor,
                    top: -5,
                    marginLeft: -7,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  },
                ]}
              />
            </View>
          </View>
        </GestureDetector>
      </View>
    </View>
  );
};

export default Slider;

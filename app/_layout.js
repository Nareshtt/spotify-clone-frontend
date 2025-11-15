import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { PlayerProvider } from '../context/PlayerContext';
import { initDatabase } from '../database/db';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    'Satoshi-Black': require('../assets/fonts/Satoshi-Black.otf'),
    'Satoshi-BlackItalic': require('../assets/fonts/Satoshi-BlackItalic.otf'),
    'Satoshi-Bold': require('../assets/fonts/Satoshi-Bold.otf'),
    'Satoshi-BoldItalic': require('../assets/fonts/Satoshi-BoldItalic.otf'),
    'Satoshi-Italic': require('../assets/fonts/Satoshi-Italic.otf'),
    'Satoshi-Light': require('../assets/fonts/Satoshi-Light.otf'),
    'Satoshi-LightItalic': require('../assets/fonts/Satoshi-LightItalic.otf'),
    'Satoshi-Medium': require('../assets/fonts/Satoshi-Medium.otf'),
    'Satoshi-MediumItalic': require('../assets/fonts/Satoshi-MediumItalic.otf'),
    'Satoshi-Regular': require('../assets/fonts/Satoshi-Regular.otf'),
  });

  useEffect(() => {
    initDatabase().then(() => console.log('✓ Database initialized'));
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PlayerProvider>
      <View className="flex-1 bg-bg-main">
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
            gestureEnabled: true,
          }}>
          <Stack.Screen name="(root)/(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(root)/player"
            options={{
              headerShown: false,
              presentation: 'transparentModal',
              animation: 'slide_from_bottom',
              gestureEnabled: true,
              gestureDirection: 'vertical',
              fullScreenGestureEnabled: true,
            }}
          />
        </Stack>
      </View>
    </PlayerProvider>
  );
}

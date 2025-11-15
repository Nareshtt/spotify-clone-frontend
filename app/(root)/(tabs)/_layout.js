// app/(root)/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import icons from '@/constants/icons';
import { Text, View } from 'react-native';
import MiniPlayer from '@/components/miniPlayer/miniSongPlayer';

const TabIcon = ({ icon: Icon, iconFilled: IconFilled, focused, title }) => {
  const ActiveIcon = focused ? IconFilled : Icon;
  return (
    <View className="items-center" style={{ minWidth: 80 }}>
      <ActiveIcon width={36} height={36} />
      <Text className="relative bottom-1 text-center font-satoshi-light text-[11px] text-white">
        {title}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          lazy: false,
          tabBarBackground: () => (
            <LinearGradient
              colors={[
                'rgba(17,17,17,0)',
                'rgba(17,17,17,0.7)',
                'rgba(17,17,17,1)',
                'rgba(17,17,17,1)',
              ]}
              locations={[0, 0.2, 0.4, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{ flex: 1 }}
            />
          ),
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 95,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.home}
                iconFilled={icons.homeFilled}
                focused={focused}
                title="Home"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.discover}
                iconFilled={icons.discoverFilled}
                focused={focused}
                title="Discovery"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="library"
          options={{
            title: 'Library',
            tabBarIcon: ({ focused }) => (
              <TabIcon
                icon={icons.library}
                iconFilled={icons.libraryFilled}
                focused={focused}
                title="Library"
              />
            ),
          }}
        />
        <Tabs.Screen
          name="songPage"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <MiniPlayer />
    </>
  );
}

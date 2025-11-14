import { Tabs } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import icons from '@/constants/icons';
import { Text, View } from 'react-native';

const TabIcon = ({ icon: Icon, iconFilled: IconFilled, focused, title }) => {
  const ActiveIcon = focused ? IconFilled : Icon;
  return (
    <View className="items-center" style={{ minWidth: 80 }}>
      <ActiveIcon width={36} height={36} />
      <Text className="font-satoshi-light relative bottom-1 text-center text-[11px] text-white">
        {title}
      </Text>
    </View>
  );
};
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarBackground: () => (
          <LinearGradient
            colors={[
              'rgba(17,17,17,0)', // transparent at top
              'rgba(17,17,17,0.7)', // light fade
              'rgba(17,17,17,1)', // medium dark
              'rgba(17,17,17,1)', // solid black at bottom
            ]}
            locations={[0, 0.2, 0.4, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ flex: 1 }}
          />
        ),
        tabBarStyle: {
          position: 'absolute', // Add this
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0, // Add this for iOS
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
        name="songs"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

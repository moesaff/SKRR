import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Easing } from 'react-native';
import { Colors } from '../../constants/colors';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.divider,
          borderTopWidth: 1,
          paddingBottom: 24,
          paddingTop: 10,
          height: 88,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '900',
          letterSpacing: 3,
          fontSize: 16,
          color: Colors.accent,
        },
        headerShadowVisible: false,
        animationEnabled: true,
        sceneStyleInterpolator: ({ current }) => ({
          sceneStyle: {
            opacity: current.progress.interpolate({
              inputRange: [-1, 0, 1],
              outputRange: [0, 1, 0],
            }),
          },
        }),
        transitionSpec: {
          animation: 'timing',
          config: { duration: 180, easing: Easing.inOut(Easing.ease) },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'NETWORK',
          tabBarLabel: 'Network',
          tabBarIcon: ({ color }) => <Ionicons name="people" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="post-meet"
        options={{
          title: 'MEETS',
          tabBarLabel: 'Meets',
          tabBarIcon: ({ color }) => <Ionicons name="flag" size={28} color={color} />,
        }}
      />
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'MY CARD',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push('/settings')} style={{ marginRight: 16 }}>
              <Ionicons name="settings-outline" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen name="clubs" options={{ href: null }} />
    </Tabs>
  );
}

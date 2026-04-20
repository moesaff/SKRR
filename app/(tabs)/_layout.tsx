import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Colors } from '../../constants/colors';
import { initGlassClick, playGlassClick } from '../../services/soundService';

export default function TabLayout() {
  useEffect(() => {
    initGlassClick();
  }, []);

  return (
    <Tabs
      screenListeners={{ tabPress: () => playGlassClick() }}
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
        tabBarIconStyle: { marginBottom: 2 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
        tabBarIconSize: 28,
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '900',
          letterSpacing: 3,
          fontSize: 16,
          color: Colors.accent,
          textShadowColor: Colors.accent,
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 4,
        },
        headerShadowVisible: false,
        animation: 'fade',
      }}
    >
      <Tabs.Screen
        name="clubs"
        options={{
          title: 'SKRR CLUBS',
          tabBarLabel: 'Clubs',
          tabBarIcon: ({ color }) => <Ionicons name="shield" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'REV ZONE',
          tabBarLabel: 'Rev Zone',
          tabBarIcon: ({ color }) => <Ionicons name="speedometer-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
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
      <Tabs.Screen
        name="messages"
        options={{
          title: 'MESSAGES',
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'MY CARD',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}

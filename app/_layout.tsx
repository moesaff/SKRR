import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../constants/colors';
import { UserProvider } from '../context/UserContext';
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) router.replace('/(tabs)');
      else router.replace('/welcome');
    });
    return () => unsub();
  }, []);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.background }}>
      <UserProvider>
      <AuthGate>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
          headerTitleStyle: { fontWeight: '800', letterSpacing: 1 },
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="welcome" options={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="meet/[id]" options={{ title: 'Meet Details' }} />
        <Stack.Screen name="edit-card" options={{ title: 'EDIT CARD', presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ title: 'SETTINGS', presentation: 'modal' }} />
      </Stack>
      </AuthGate>
      </UserProvider>
    </GestureHandlerRootView>
  );
}

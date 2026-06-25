import { DefaultTheme, DarkTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';

import { useEffect } from 'react';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

// Centralized route guard: keeps unauthenticated users out of every
// protected screen (not just the tabs) and bounces logged-in users away
// from the auth screens.
function AuthGate() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return null;
}

function NotificationRouter() {
  const router = useRouter();

  useEffect(() => {
    // If the app was opened from a notification (cold start), route to it.
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) router.push('/notifications');
    });

    // When a notification is tapped while the app is running.
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/notifications');
    });
    return () => sub.remove();
  }, []);

  return null;
}

function RootContent() {
  const { isDark } = useTheme();

  return (
    <NavThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <StatusBar hidden={false} style={isDark ? "light" : "dark"} />
        <AuthGate />
        <NotificationRouter />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

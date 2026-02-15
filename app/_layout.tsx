import {DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme, ActivityIndicator, View  } from "react-native";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import AuthGuard from '../components/auth-guard';

export const unstable_settings = {
  // anchor: '(tabs)',
};

function RootNavigator() {
  const { user, loading } = useAuth();

  // ⏳ Prevent flicker
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DefaultTheme}>
        <AuthProvider>
          <StatusBar hidden={false} style={"dark"}/>
            <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
      </SafeAreaProvider>
  );
}

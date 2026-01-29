import {DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider } from '@/context/AuthContext';

export const unstable_settings = {
  // anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DefaultTheme}>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ headerShown: false, title: "Login" }} />
          </Stack>
          <StatusBar style="auto" />
        </AuthProvider>
      </ThemeProvider>
      </SafeAreaProvider>
  );
}

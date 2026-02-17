import {DefaultTheme, ThemeProvider } from '@react-navigation/native';

import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme, ActivityIndicator, View  } from "react-native";
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AuthProvider, useAuth } from '@/context/AuthContext';
// import AuthGuard from '../components/auth-guard';


export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DefaultTheme : DefaultTheme}>
        <AuthProvider>
          <StatusBar hidden={false} style={"dark"}/>
            <Stack screenOptions={{ headerShown: false }}></Stack>
        </AuthProvider>
      </ThemeProvider>
      </SafeAreaProvider>
  );
}

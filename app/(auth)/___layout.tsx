import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
  const { user, loading } = useAuth(); // use loadingInitial instead of loading
  const router = useRouter();

  useEffect(() => {
    // Only redirect if token check is finished
    if (!loading && !user) {
      router.replace("/login"); // redirect to login if not authenticated
    }
  }, [loading, user]);

  if (loading) {
    // Show splash/loading while checking token
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    // Return nothing or blank until redirect
    return null;
  }

  // User is authenticated → render tabs
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen />
    </Stack>
  );
}

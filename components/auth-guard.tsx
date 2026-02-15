import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { authToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authToken) {
      router.replace("/login");
    }
  }, [authToken]);

  if (!authToken) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

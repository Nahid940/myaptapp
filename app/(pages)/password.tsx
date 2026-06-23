import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import { Field, PrimaryButton } from "@/components/ui/form";

export default function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { logout } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/update-password", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      if (response.status === 200) {
        Alert.alert("Success", "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        logout();
        router.replace("/login");
      }
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      <View style={styles.navbar}>
        <Pressable
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>Update Password</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconBadge}>
            <Ionicons name="lock-closed" size={36} color="#159df8" />
          </View>
          <Text style={[styles.heading, { color: colors.text }]}>Change your password</Text>
          <Text style={styles.sub}>
            For your security, you'll be logged out after updating.
          </Text>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Field
              label="Current Password"
              icon="lock-closed-outline"
              required
              isPassword
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <Field
              label="New Password"
              icon="key-outline"
              required
              isPassword
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <Field
              label="Confirm New Password"
              icon="key-outline"
              required
              isPassword
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              containerStyle={{ marginBottom: 24 }}
            />

            <PrimaryButton
              label="Update Password"
              icon="checkmark"
              loading={loading}
              onPress={handleSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  scroll: { padding: 18, paddingBottom: 40 },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#e0f2fe",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  sub: {
    fontSize: 13.5,
    color: "#64748b",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 22,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
});

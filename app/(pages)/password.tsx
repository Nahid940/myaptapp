import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function UpdatePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

const { user, logout } = useAuth();
  const router = useRouter()
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
      // Replace URL with your backend endpoint
        const response = await api.post("/update-password", {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            },
        );

      if (response.status === 200) {
        Alert.alert("Success", "Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        logout();
        router.replace("/login");       
      }
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>

        <Ionicons name="key-outline" size={80} color="#08b943" style={{textAlign:"center"}} />

        <Text style={styles.title}>Update Password</Text>

        <Text style={styles.label}>Current Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Enter current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Enter new password"
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          placeholder="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Updating..." : "Update Password"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,

    justifyContent: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

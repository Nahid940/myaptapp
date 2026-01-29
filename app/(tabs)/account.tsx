import { View, Text, Button, StyleSheet, Alert, useColorScheme } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme"; // optional shared theme

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Account Info</Text>
      <Text style={[styles.info, { color: theme.text }]}>Name: {user?.name}</Text>
      <Text style={[styles.info, { color: theme.text }]}>Email: {user?.email}</Text>
      <Text style={[styles.info, { color: theme.text }]}>ID: {user?.id}</Text>

      <View style={styles.logoutButton}>
        <Button title="Logout" onPress={handleLogout} color={theme.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  info: { fontSize: 16, marginBottom: 10 },
  logoutButton: { marginTop: 30, width: "60%" },
});

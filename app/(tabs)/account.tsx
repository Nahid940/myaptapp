import { Colors } from "@/constants/theme"; // optional shared theme
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, useColorScheme, View, ActivityIndicator, Image} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AccountScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [loading, setLoading] = useState(true);
  const [info, setInfo]  = useState()

  const getTenantInfo = async () =>{
    setLoading(true);
    try {
      const response = await api.get('/info')
      setInfo(response.data)
      // console.log(response.data)
    } catch (err) {
      // console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure, you want to logout?", [
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

  useEffect(()=>{
    getTenantInfo()
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
    {loading ? 

        (  <ActivityIndicator size="large" color="#df1447" />)

         :

        ( <View style={styles.container}>
      
     
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={80} color="#4A90E2" />
        <Text style={styles.headerText}>Welcome, {info?.first_name}</Text>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{info?.first_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{info?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{info?.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>{info?.gender}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Emergency Contact Name:</Text>
          <Text style={styles.value}>{info?.emergency_contact_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Emergency Contact:</Text>
          <Text style={styles.value}>{info?.emergency_contact}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>{info?.gender}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>DOJ:</Text>
          <Text style={styles.value}>{info?.created_at}</Text>
        </View>

        <Image
          source={require("../../assets/images/banner1.jpg")}
          style={styles.banner}
        />
      </View>

      <View style={styles.buttonContainer}>
        {/* Logout Button */}
        <Pressable style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>

        {/* Update Password Button */}
        <Pressable style={[styles.button, styles.updateButton]} onPress = {() => router.push('/password')}>
          <Text style={styles.buttonText}>Update Password</Text>
        </Pressable>
      </View>
    </View>)}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff", // white background
  },
  header: {
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
  },
  headerText: {
    color: "#4A90E2",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  card: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5, // Android shadow
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  value: {
    fontSize: 16,
    color: "#555",
  },

  buttonContainer: {
    flexDirection: 'row',       // Side by side
    justifyContent: 'space-between', // Space between buttons
    marginVertical: 20,
    paddingHorizontal: 20,
  },

  button: {
    flex: 1,                    // Make buttons same width
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,        // Small space between buttons
  },

  updateButton: {
    backgroundColor: '#007AFF', // Blue
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },

  logoutButton: {
    paddingVertical: 15,
    borderRadius: 10,
    backgroundColor: "#f1126f",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  banner: {
    width: "100%",
    height: 50,
    borderRadius: 5,
    marginBottom: 16,
  },
});

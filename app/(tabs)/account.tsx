import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type InfoRowProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  bg: string;
  label: string;
  value?: string;
};

const InfoRow = ({ icon, color, bg, label, value }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIcon, { backgroundColor: bg }]}>
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "—"}</Text>
    </View>
  </View>
);

export default function AccountScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [info, setInfo] = useState<any>();

  const getTenantInfo = async () => {
    setLoading(true);
    try {
      const response = await api.get("/info");
      setInfo(response.data);
    } catch (err) {
      // console.error("Error fetching info:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const performDelete = async () => {
    setDeleting(true);
    try {
      await api.delete("/account");
      await logout();
      router.replace("/login");
      Alert.alert("Account Deleted", "Your account has been permanently deleted.");
    } catch (err: any) {
      Alert.alert(
        "Could not delete account",
        err?.message || "Something went wrong. Please try again later."
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all associated data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            Alert.alert(
              "Are you absolutely sure?",
              "Your account and data will be permanently removed.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Delete Permanently", style: "destructive", onPress: performDelete },
              ]
            ),
        },
      ]
    );
  };

  useEffect(() => {
    getTenantInfo();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#159df8" />
      </SafeAreaView>
    );
  }

  const initials = `${info?.first_name?.[0] ?? ""}${info?.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <View style={styles.root}>
      {/* Gradient header */}
      <LinearGradient
        colors={["#159df8", "#0b7dd0", "#0a64b8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerCircle} />
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          {info?.photo_url ? (
            <Image source={{ uri: info.photo_url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "👤"}</Text>
            </View>
          )}
          <Text style={styles.name}>
            {info?.first_name} {info?.last_name}
          </Text>
          {info?.email ? <Text style={styles.email}>{info.email}</Text> : null}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Info card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Personal Information</Text>

          <InfoRow icon="person-outline" color="#2563eb" bg="#dbeafe" label="Full Name" value={`${info?.first_name ?? ""} ${info?.last_name ?? ""}`.trim()} />
          <InfoRow icon="mail-outline" color="#7c3aed" bg="#ede9fe" label="Email" value={info?.email} />
          <InfoRow icon="call-outline" color="#16a34a" bg="#dcfce7" label="Phone" value={info?.phone} />
          <InfoRow icon="male-female-outline" color="#ea580c" bg="#ffedd5" label="Gender" value={info?.gender} />
          <InfoRow icon="calendar-outline" color="#0891b2" bg="#cffafe" label="Date of Joining" value={info?.created_at} />
        </View>

        {/* Emergency card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Emergency Contact</Text>

          <InfoRow icon="person-circle-outline" color="#dc2626" bg="#fee2e2" label="Contact Name" value={info?.emergency_contact_name} />
          <InfoRow icon="call-outline" color="#dc2626" bg="#fee2e2" label="Contact Number" value={info?.emergency_contact} />
        </View>

        {/* Actions */}
        <Pressable
          onPress={() => router.push("/password")}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#dbeafe" }]}>
            <Ionicons name="key-outline" size={20} color="#2563eb" />
          </View>
          <Text style={styles.actionText}>Update Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [styles.actionBtn, pressed && styles.pressed]}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#fee2e2" }]}>
            <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          </View>
          <Text style={[styles.actionText, { color: "#dc2626" }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color="#fca5a5" />
        </Pressable>

        <Pressable
          onPress={handleDeleteAccount}
          disabled={deleting}
          style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#fee2e2" }]}>
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
          </View>
          <Text style={[styles.actionText, { color: "#dc2626" }]}>Delete Account</Text>
          {deleting ? (
            <ActivityIndicator size="small" color="#dc2626" />
          ) : (
            <Ionicons name="chevron-forward" size={20} color="#fca5a5" />
          )}
        </Pressable>

        <Text style={styles.deleteHint}>
          Deleting your account permanently removes your profile and all associated data.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },

  /* Header */
  header: {
    paddingBottom: 56,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
  },
  headerCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.10)",
    top: -90,
    right: -50,
  },
  headerInner: {
    alignItems: "center",
    paddingTop: 16,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    marginBottom: 12,
  },
  avatarImg: {
    width: 92,
    height: 92,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  avatarText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },
  name: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  email: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: 4,
  },

  /* Scroll + cards */
  scroll: {
    flex: 1,
    paddingHorizontal: 18,
    marginTop: -36,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  infoTextWrap: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12.5,
    color: "#94a3b8",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 15.5,
    color: "#0f172a",
    fontWeight: "700",
    marginTop: 1,
  },

  /* Action buttons */
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#fecaca",
  },
  deleteHint: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 12,
    lineHeight: 17,
  },
});

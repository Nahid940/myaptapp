import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";

const APP_VERSION = "1.1";
// Must point to your publicly hosted privacy policy page.
const PRIVACY_POLICY_URL = "https://property.al-amana.co.ke/privacy-policy";

export default function AboutScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>About</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.logoWrap}>
            <View style={styles.logoBadge}>
              <Ionicons name="business" size={34} color="#159df8" />
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>ACL</Text>
            <Text style={[styles.company, { color: colors.muted }]}>
              AL-AMANA COMMUNICATION LIMITED
            </Text>
          </View>

          <Text style={[styles.aboutText, { color: colors.muted }]}>
            AL-AMANA COMMUNICATION LIMITED provides services in telecommunications,
            property management, and property development. We deliver reliable
            communication solutions and professional real estate services focused on
            quality, efficiency, and customer satisfaction.
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.bg }]} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL("mailto:info@al-amana.co.ke")}
          >
            <View style={[styles.rowIcon, { backgroundColor: "#fef3c7" }]}>
              <Ionicons name="mail" size={18} color="#f59e0b" />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.muted }]}>Email</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>info@al-amana.co.ke</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL("tel:0722727820")}
          >
            <View style={[styles.rowIcon, { backgroundColor: "#e0f2fe" }]}>
              <Ionicons name="call" size={18} color="#0284c7" />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.muted }]}>Contact</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>0722727820</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL("tel:+254743666555")}
          >
            <View style={[styles.rowIcon, { backgroundColor: "#fee2e2" }]}>
              <Ionicons name="headset" size={18} color="#dc2626" />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.muted }]}>Helpline</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>+254743666555</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          >
            <View style={[styles.rowIcon, { backgroundColor: "#ede9fe" }]}>
              <Ionicons name="shield-checkmark" size={18} color="#7c3aed" />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.muted }]}>Privacy Policy</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>View our privacy policy</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.muted} />
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: "#dcfce7" }]}>
              <Ionicons name="information-circle" size={18} color="#16a34a" />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.muted }]}>Version</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>{APP_VERSION}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  backBtn: { padding: 2 },
  title: { fontSize: 24, fontWeight: "800" },
  card: {
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 18,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  logoWrap: { alignItems: "center", marginBottom: 18 },
  logoBadge: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  appName: { fontSize: 22, fontWeight: "800" },
  company: { fontSize: 14, marginTop: 2, textAlign: "center" },
  aboutText: { fontSize: 13.5, lineHeight: 21, textAlign: "center", marginBottom: 16 },
  divider: { height: 1.5, borderRadius: 1, marginBottom: 6 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 12.5 },
  rowValue: { fontSize: 15.5, fontWeight: "700", marginTop: 1 },
});

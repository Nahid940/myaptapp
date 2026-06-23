import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import HomePageIcons from "@/components/ui/homepageIcons";
import { useTheme } from "@/context/ThemeContext";

export default function MoreScreen() {
  const router = useRouter();
  const { isDark, toggle, colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>More</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          All your tools in one place
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <HomePageIcons />
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>Appearance</Text>
        <View style={[styles.toggleCard, { backgroundColor: colors.card }]}>
          <View style={styles.toggleLeft}>
            <View
              style={[
                styles.toggleIcon,
                { backgroundColor: isDark ? "#334155" : "#fef3c7" },
              ]}
            >
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={20}
                color={isDark ? "#fbbf24" : "#f59e0b"}
              />
            </View>
            <View>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.toggleSub, { color: colors.muted }]}>
                {isDark ? "On" : "Off"}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggle}
            trackColor={{ true: "#159df8", false: "#cbd5e1" }}
            thumbColor="#ffffff"
          />
        </View>

        {/* About */}
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>App</Text>
        <TouchableOpacity
          style={[styles.toggleCard, { backgroundColor: colors.card }]}
          onPress={() => router.push("/about")}
        >
          <View style={styles.toggleLeft}>
            <View style={[styles.toggleIcon, { backgroundColor: "#e0f2fe" }]}>
              <Ionicons name="information-circle" size={20} color="#0284c7" />
            </View>
            <View>
              <Text style={[styles.toggleTitle, { color: colors.text }]}>About</Text>
              <Text style={[styles.toggleSub, { color: colors.muted }]}>
                AL-AMANA COMMUNICATION LIMITED
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13.5, marginTop: 2 },
  card: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: 22,
    marginBottom: 12,
    marginLeft: 4,
  },
  toggleCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  toggleLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  toggleIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleTitle: { fontSize: 15.5, fontWeight: "700" },
  toggleSub: { fontSize: 12.5, marginTop: 1 },
});

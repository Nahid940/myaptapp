import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import HomePageIcons from "@/components/ui/homepageIcons";
import { api } from "../../lib/api";

import { useEffect, useState } from "react";
import ImageSlider from "@/components/ui/homeSlider";

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/home`);
      setData(response.data);
    } catch (err) {
      // console.error("Error fetching dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (!data) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#159df8" />
      </SafeAreaView>
    );
  }

  const initials = `${data?.tenant?.first_name?.[0] ?? ""}${data?.tenant?.last_name?.[0] ?? ""}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting row */}
        <View style={styles.greetingRow}>
          <Pressable
            onPress={() => router.push("/account")}
            style={({ pressed }) => [styles.greetingTap, pressed && styles.greetingPressed]}
          >
            {data.tenant?.photo_url ? (
              <Image source={{ uri: data.tenant.photo_url }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials || "👤"}</Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.greetingHello}>Welcome back 👋</Text>
              <Text style={styles.greetingName}>
                {data.tenant.first_name} {data.tenant.last_name}
              </Text>
            </View>
          </Pressable>
          <View style={styles.bellWrap}>
            <Ionicons name="notifications-outline" size={22} color="#0f172a" />
          </View>
        </View>

        {/* Lease hero card */}
        <LinearGradient
          colors={["#159df8", "#0b7dd0", "#0a64b8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroCircle} />
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroLabel}>Building</Text>
              <Text style={styles.heroBuilding}>
                {data.booking.building.building_name}
              </Text>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="business" size={20} color="#fff" />
            </View>
          </View>

          <View style={styles.heroChips}>
            <View style={styles.chip}>
              <Ionicons name="home-outline" size={14} color="#fff" />
              <Text style={styles.chipText}>
                {data.booking.apartment.apartment_code}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/lease" as any)}
              style={({ pressed }) => [styles.chipLink, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="document-text-outline" size={14} color="#fff" />
              <Text style={styles.chipText}>{data.booking.booking_code}</Text>
              <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroSmallLabel}>Monthly Rent</Text>
              <Text style={styles.heroValue}>{data.booking.rent}</Text>
            </View>
            <View style={styles.heroVLine} />
            <View>
              <Text style={styles.heroSmallLabel}>Service Charge</Text>
              <Text style={styles.heroValue}>{data.booking.service_charge}</Text>
            </View>
          </View>

          <View style={styles.heroDates}>
            <Text style={styles.heroDateText}>
              <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.85)" />{" "}
              {data.booking.checkin_at}
            </Text>
            <Text style={styles.heroDateText}>→ {data.booking.end_date}</Text>
          </View>
        </LinearGradient>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={["#22c55e", "#15a34a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <View style={styles.statCircle} />
            <View style={styles.statTop}>
              <View style={styles.statIcon}>
                <Ionicons name="checkmark-done" size={18} color="#fff" />
              </View>
              <Ionicons name="trending-up" size={18} color="rgba(255,255,255,0.7)" />
            </View>
            <Text style={styles.statLabel}>Total Paid</Text>
            <Text style={styles.statValue}>{data.total_paid}</Text>
          </LinearGradient>

          <LinearGradient
            colors={["#fb7185", "#e11d48"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <View style={styles.statCircle} />
            <View style={styles.statTop}>
              <View style={styles.statIcon}>
                <Ionicons name="alert" size={18} color="#fff" />
              </View>
              <Ionicons name="wallet-outline" size={18} color="rgba(255,255,255,0.7)" />
            </View>
            <Text style={styles.statLabel}>Due</Text>
            <Text style={styles.statValue}>{data.due}</Text>
          </LinearGradient>
        </View>

        {/* Latest notice */}
        {data.latest_notice && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Latest Notice</Text>
              <Pressable onPress={() => router.push("/notices")} hitSlop={8}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>
            <Pressable
              onPress={() => router.push("/notices")}
              style={({ pressed }) => [styles.noticeCard, pressed && styles.noticePressed]}
            >
              <View style={styles.noticeIcon}>
                <Ionicons name="megaphone" size={20} color="#159df8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle} numberOfLines={1}>
                  {data.latest_notice.title}
                </Text>
                {data.latest_notice.description ? (
                  <Text style={styles.noticeDesc} numberOfLines={2}>
                    {data.latest_notice.description}
                  </Text>
                ) : null}
                {data.latest_notice.created_at ? (
                  <View style={styles.noticeDateRow}>
                    <Ionicons name="time-outline" size={12} color="#94a3b8" />
                    <Text style={styles.noticeDate}>{data.latest_notice.created_at}</Text>
                  </View>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </Pressable>
          </>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsCard}>
          <HomePageIcons />
        </View>

        {/* Slider */}
        <Text style={styles.sectionTitle}>What's New</Text>
        <View style={styles.sliderCard}>
          <ImageSlider />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  container: {
    flex: 1,
    paddingHorizontal: 18,
  },

  /* Greeting */
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
    marginBottom: 18,
  },
  greetingTap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  greetingPressed: {
    opacity: 0.6,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#159df8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#159df8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  greetingHello: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
  greetingName: {
    color: "#0f172a",
    fontSize: 19,
    fontWeight: "800",
  },
  bellWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  /* Hero card */
  heroCard: {
    borderRadius: 24,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#0b7dd0",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroCircle: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.10)",
    top: -70,
    right: -40,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  heroBuilding: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 2,
  },
  heroBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroChips: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 30,
  },
  chipLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.28)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },
  chipText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 18,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroVLine: {
    width: 1,
    height: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 22,
  },
  heroSmallLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
  },
  heroValue: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },
  heroDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  heroDateText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
  },

  /* Stat cards */
  statsRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 5,
  },
  statCircle: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.15)",
    top: -34,
    right: -22,
  },
  statTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
  },
  statValue: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "800",
    marginTop: 3,
  },

  /* Sections */
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 26,
    marginBottom: 14,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "700",
    color: "#159df8",
  },
  noticeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#159df8",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  noticePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
  noticeIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  noticeTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0f172a",
  },
  noticeDesc: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
    marginTop: 3,
  },
  noticeDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  noticeDate: {
    fontSize: 11.5,
    color: "#94a3b8",
    fontWeight: "600",
  },
  actionsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sliderCard: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
});

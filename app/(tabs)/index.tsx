import {
  ActivityIndicator,
  RefreshControl,
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
import { api } from "../../lib/api";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import NotificationsPopup from "@/components/ui/NotificationsPopup";
import OwnerDashboard from "@/components/ui/OwnerDashboard";

import React, { useEffect, useState } from "react";
import ImageSlider from "@/components/ui/homeSlider";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Formats a date string into "Month day, year" (e.g. "June 25, 2026").
const formatDate = (value?: string) => {
  if (!value) return "";
  const iso = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return `${MONTHS[Number(iso[2]) - 1]} ${Number(iso[3])}, ${iso[1]}`;
  }
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const QUICK_MENUS: {
  title: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
  bg: string;
  route: string;
}[] = [
  { title: "Pay Rent", icon: "cash", color: "#16a34a", bg: "#dcfce7", route: "/pay-rent" },
  { title: "My Invoices", icon: "document-text", color: "#4f46e5", bg: "#e0e7ff", route: "/invoices" },
  { title: "Open Ticket", icon: "construct", color: "#ea580c", bg: "#ffedd5", route: "/(tabs)/tickets" },
  { title: "Invite Guest", icon: "person-add", color: "#0ea5e9", bg: "#e0f2fe", route: "/(tabs)/guestRegister" },
];

const ACTIVITY_META: Record<
  string,
  { icon: React.ComponentProps<typeof Ionicons>["name"]; color: string; bg: string }
> = {
  payment: { icon: "cash", color: "#16a34a", bg: "#dcfce7" },
  invoice: { icon: "document-text", color: "#4f46e5", bg: "#e0e7ff" },
  ticket: { icon: "ticket", color: "#dc2626", bg: "#fee2e2" },
  maintenance: { icon: "hammer", color: "#0d9488", bg: "#ccfbf1" },
  notice: { icon: "megaphone", color: "#159df8", bg: "#e0f2fe" },
  guest: { icon: "person-add", color: "#ea580c", bg: "#ffedd5" },
  ledger: { icon: "book", color: "#b45309", bg: "#fef3c7" },
  default: { icon: "ellipse", color: "#64748b", bg: "#f1f5f9" },
};

const activityMeta = (key: string) => {
  const k = (key || "").toLowerCase();
  if (k.includes("payment")) return ACTIVITY_META.payment;
  if (k.includes("invoice")) return ACTIVITY_META.invoice;
  if (k.includes("ticket")) return ACTIVITY_META.ticket;
  if (k.includes("maintenance")) return ACTIVITY_META.maintenance;
  if (k.includes("notice")) return ACTIVITY_META.notice;
  if (k.includes("guest")) return ACTIVITY_META.guest;
  if (k.includes("ledger")) return ACTIVITY_META.ledger;
  return ACTIVITY_META.default;
};

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadHome = async () => {
    // Prefer the endpoint that matches the known role, but fall back to the
    // other one if it isn't available — so the screen never ends up blank.
    const primary = user?.is_owner ? `/owner/home` : `/home`;
    const fallback = user?.is_owner ? `/home` : `/owner/home`;
    try {
      const res = await api.get(primary);
      return res?.data ?? null;
    } catch {
      try {
        const res = await api.get(fallback);
        return res?.data ?? null;
      } catch {
        return null;
      }
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const home = await loadHome();
      if (home) setData(home);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get(`/activities?limit=5`);
      setActivities(res?.activities ?? res?.data ?? []);
    } catch (err) {
      setActivities([]);
    }
  };

  const fetchNotifCount = async () => {
    try {
      const res = await api.get(`/notifications/active`);
      setNotifCount(res?.active_count ?? (res?.notifications?.length ?? 0));
    } catch (err) {
      setNotifCount(0);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [home] = await Promise.all([
        loadHome(),
        fetchActivities(),
        fetchNotifCount(),
      ]);
      if (home) setData(home);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchActivities();
    fetchNotifCount();
    // Re-fetch with the correct endpoint once we know if the user is an owner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.is_owner]);

  if (!data) {
    return (
      <SafeAreaView style={[styles.loaderWrap, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color="#159df8" />
      </SafeAreaView>
    );
  }

  const initials = `${data?.tenant?.first_name?.[0] ?? ""}${data?.tenant?.last_name?.[0] ?? ""}`.toUpperCase();

  const currency = data?.currency ?? data?.booking?.currency ?? "KES";
  const fmt = (v: any) =>
    v === undefined || v === null ? "—" : `${currency} ${Number(v).toLocaleString()}`;

  const pendingCount = Number(data?.unpaid_count ?? 0);

  // Owners get their own dashboard (the /home payload shape differs entirely).
  // Detect by data shape first (most reliable), then fall back to the flag.
  const isOwner = Boolean(data?.owner) || Boolean(data?.is_owner) || Boolean(user?.is_owner);
  const quickMenus = isOwner
    ? QUICK_MENUS.filter((m) => m.title !== "Pay Rent")
    : QUICK_MENUS;

  if (isOwner || !data?.booking) {
    return (
      <>
        <OwnerDashboard
          data={data}
          notifCount={notifCount}
          onBellPress={() => setNotifOpen(true)}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
        <NotificationsPopup
          visible={notifOpen}
          onClose={() => {
            setNotifOpen(false);
            fetchNotifCount();
          }}
        />
      </>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#159df8" colors={["#159df8"]} />
        }
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
              <Text style={[styles.greetingName, { color: colors.text }]}>
                {data.tenant.first_name} {data.tenant.last_name}
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => setNotifOpen(true)}
            style={[styles.bellWrap, { backgroundColor: colors.card }]}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {notifCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{notifCount > 9 ? "9+" : notifCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Home header card */}
        <Pressable
          onPress={() => router.push("/lease" as any)}
          style={({ pressed }) => [
            styles.headerCard,
            { backgroundColor: colors.cardAlt },
            pressed && { opacity: 0.95 },
          ]}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.headerKicker}>YOUR HOME</Text>

            <Text style={[styles.headerBuilding, { color: colors.text }]} numberOfLines={2}>
              {data.booking.building.building_name}
            </Text>

            <View style={styles.aptBadge}>
              <Ionicons name="home" size={13} color="#159df8" />
              <Text style={styles.aptBadgeText}>{data.booking.apartment.apartment_code}</Text>
            </View>

            <View style={styles.headerLine} />

            {!isOwner && (
              <>
                <Text style={styles.rentLabel}>Monthly Rent</Text>
                <Text style={[styles.rentAmount, { color: colors.text }]}>
                  {fmt(data.booking.rent)}
                </Text>
              </>
            )}

            <View style={styles.leaseActiveRow}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.leaseActiveText}>Lease Active</Text>
            </View>

            {!isOwner && (
              <>
                <View style={styles.headerLine} />
                <Text style={styles.untilText}>Until {formatDate(data.booking.end_date)}</Text>
              </>
            )}
          </View>

          <Image
            source={require("../../assets/images/header_image.jpg")}
            style={styles.headerImg}
            resizeMode="cover"
          />

          <View style={styles.viewDetailsBtn} pointerEvents="none">
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="arrow-forward" size={13} color="#159df8" />
          </View>
        </Pressable>

        {/* Quick menu card */}
        <View style={[styles.menuCard, { backgroundColor: colors.card }]}>
          {quickMenus.map((m, i) => (
            <React.Fragment key={m.title}>
              <Pressable
                style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
                onPress={() => router.push(m.route as any)}
              >
                <View style={[styles.menuIcon, { backgroundColor: m.bg }]}>
                  <Ionicons name={m.icon} size={22} color={m.color} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{m.title}</Text>
              </Pressable>
              {i < quickMenus.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Financial summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Financial Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Outstanding</Text>
              <Text style={[styles.summaryValue, { color: "#dc2626" }]}>
                {fmt(data.outstanding ?? data.due)}
              </Text>
              <Text style={styles.pendingText}>
                {pendingCount} pending item{pendingCount === 1 ? "" : "s"}
              </Text>
            </View>

            <View style={styles.summaryVLine} />

            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Paid This Year</Text>
              <Text style={[styles.summaryValue, { color: "#16a34a" }]}>
                {fmt(data.paid_this_year ?? data.total_paid)}
              </Text>
              <View style={styles.goodJob}>
                <View style={styles.goodJobCircle}>
                  <Ionicons name="checkmark" size={11} color="#fff" />
                </View>
                <Text style={styles.goodJobText}>Good Job</Text>
              </View>
            </View>

            <View style={styles.summaryVLine} />

            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Next Due Date</Text>
              <Text style={[styles.summaryValue, { fontSize: 15, color: colors.text }]}>
                {data.next_billing ?? "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Latest notice */}
        {data.latest_notice && (
          <Pressable
            onPress={() => router.push("/notices")}
            style={({ pressed }) => [
              styles.noticeCard,
              { backgroundColor: colors.card },
              pressed && styles.noticePressed,
            ]}
          >
            <View style={styles.noticeHeader}>
              <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Latest Notice</Text>
              <Text style={styles.seeAll}>See all</Text>
            </View>
            <View style={styles.noticeBody}>
              <View style={styles.noticeIcon}>
                <Ionicons name="megaphone" size={20} color="#159df8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.noticeTitle, { color: colors.text }]} numberOfLines={1}>
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
            </View>
          </Pressable>
        )}

        {/* Recent activity */}
        <View style={[styles.actionsCard, { backgroundColor: colors.card }]}>
          <View style={styles.activityHeader}>
            <Text style={[styles.cardSectionTitle, { marginBottom: 0, color: colors.text }]}>
              Recent Activity
            </Text>
            <Pressable onPress={() => router.push("/activities" as any)} hitSlop={8}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>
          {activities.length === 0 ? (
            <View style={styles.activityEmpty}>
              <Ionicons name="time-outline" size={34} color="#cbd5e1" />
              <Text style={styles.activityEmptyText}>No recent activity yet</Text>
            </View>
          ) : (
            activities.map((a: any, i: number) => {
              const meta = activityMeta(a.activity ?? a.type);
              return (
                <View
                  key={a.id ?? i}
                  style={[
                    styles.activityRow,
                    i === activities.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 },
                  ]}
                >
                  <View style={[styles.activityIcon, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.activityTitle, { color: colors.text }]} numberOfLines={2}>
                      {a.log ?? a.title ?? a.description ?? "Activity"}
                    </Text>
                  </View>
                  {a.time || a.created_at ? (
                    <Text style={styles.activityTime}>{a.time ?? a.created_at}</Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

      </ScrollView>

      <NotificationsPopup
        visible={notifOpen}
        onClose={() => {
          setNotifOpen(false);
          fetchNotifCount();
        }}
      />
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

  /* Home header card */
  headerCard: {
    backgroundColor: "#eef5ff",
    borderRadius: 24,
    marginBottom: 16,
  },
  headerLeft: { padding: 16, paddingRight: 150 },
  headerName: { fontSize: 13, fontWeight: "700", color: "#475569" },
  headerKicker: {
    fontSize: 13,
    fontWeight: "800",
    color: "#159df8",
    letterSpacing: 1.5,
    marginTop: 1,
  },
  headerBuilding: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 5,
  },
  aptBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    backgroundColor: "#dbeafe",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  aptBadgeText: { color: "#159df8", fontWeight: "800", fontSize: 14.5 },
  headerLine: {
    height: 1,
    backgroundColor: "rgba(15,23,42,0.10)",
    marginVertical: 10,
  },
  rentLabel: { fontSize: 13.5, color: "#64748b", fontWeight: "600" },
  rentAmount: { fontSize: 24, fontWeight: "800", color: "#0f172a", marginTop: 2 },
  leaseActiveRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  leaseActiveText: { color: "#16a34a", fontWeight: "800", fontSize: 15 },
  untilText: { fontSize: 13.5, color: "#64748b", fontWeight: "600" },
  headerImg: {
    position: "absolute",
    right: 10,
    bottom: 12,
    width: 140,
    height: 187,
    borderRadius: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 9,
  },
  viewDetailsBtn: {
    position: "absolute",
    right: 10,
    bottom: 6,
    width: 140,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#fff",
    paddingVertical: 9,
    borderRadius: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  viewDetailsText: { color: "#159df8", fontSize: 12.5, fontWeight: "800" },

  /* Quick menu card */
  menuCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  menuItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  menuIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: 11.5, fontWeight: "700", color: "#334155", textAlign: "center" },
  menuDivider: {
    width: 1,
    height: 46,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
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
  bellBadge: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  bellBadgeText: { color: "#fff", fontSize: 9.5, fontWeight: "800" },

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

  /* Shared in-card section title */
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 14,
  },

  /* Summary card */
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  summaryCol: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 4,
  },
  summaryVLine: {
    width: 1,
    height: 58,
    backgroundColor: "#e2e8f0",
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 11.5,
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  pendingText: {
    fontSize: 11,
    color: "#dc2626",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 4,
  },
  goodJob: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 5,
  },
  goodJobCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },
  goodJobText: {
    color: "#16a34a",
    fontWeight: "800",
    fontSize: 11.5,
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
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#159df8",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  noticeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  noticeBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
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
    paddingHorizontal: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  activityEmpty: { alignItems: "center", paddingVertical: 24, gap: 10 },
  activityEmptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activityTitle: { fontSize: 14.5, fontWeight: "700", color: "#0f172a" },
  activityDesc: { fontSize: 12.5, color: "#64748b", marginTop: 2 },
  activityTime: { fontSize: 11.5, color: "#94a3b8", fontWeight: "600" },
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

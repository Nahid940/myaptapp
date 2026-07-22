import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useAuth } from "@/context/AuthContext";

type UtilityType = "water" | "electricity";

const TYPES: Record<
  UtilityType,
  {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    colors: [string, string];
    accent: string;
    bg: string;
  }
> = {
  water: {
    label: "Water",
    icon: "water",
    colors: ["#0ea5e9", "#0369a1"],
    accent: "#0ea5e9",
    bg: "#e0f2fe",
  },
  electricity: {
    label: "Electricity",
    icon: "flash",
    colors: ["#f59e0b", "#d97706"],
    accent: "#f59e0b",
    bg: "#fef3c7",
  },
};

export default function UtilitiesList() {
  const router = useRouter();
  const { user } = useAuth();
  const isOwner = Boolean(user?.is_owner);
  const [type, setType] = useState<UtilityType>("water");
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("");
  const [count, setCount] = useState(0);
  const [totalCharge, setTotalCharge] = useState<number | null>(null);
  const [bills, setBills] = useState<any[]>([]);

  const theme = TYPES[type];

  const money = (v: any) =>
    v === undefined || v === null ? "—" : `${currency ? currency + " " : ""}${v}`;

  const fetchBills = async (utilityType: UtilityType) => {
    setLoading(true);
    try {
      const endpoint = isOwner
        ? `/owner/utilities/${utilityType}`
        : `/utilities/${utilityType}`;
      const res = await api.get(endpoint);
      const list = res?.readings ?? res?.data ?? [];

      setCurrency(res?.currency ?? "");
      setCount(res?.count ?? (Array.isArray(list) ? list.length : 0));
      setTotalCharge(res?.total_charge ?? null);
      setBills(Array.isArray(list) ? list : []);
    } catch (err) {
      setBills([]);
      setCount(0);
      setTotalCharge(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills(type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, isOwner]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={styles.navTitle}>Utility Bills</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Type selector */}
        <View style={styles.segment}>
          {(Object.keys(TYPES) as UtilityType[]).map((key) => {
            const t = TYPES[key];
            const active = key === type;
            return (
              <Pressable
                key={key}
                onPress={() => setType(key)}
                style={[styles.segmentBtn, active && { backgroundColor: t.accent }]}
              >
                <Ionicons name={t.icon} size={18} color={active ? "#fff" : t.accent} />
                <Text style={[styles.segmentText, { color: active ? "#fff" : t.accent }]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Summary hero */}
        <LinearGradient
          colors={theme.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroCircle} />
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}>
              <Ionicons name={theme.icon} size={26} color="#fff" />
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{count} bills</Text>
            </View>
          </View>
          <Text style={styles.heroLabel}>Total {theme.label} Charges</Text>
          <Text style={styles.heroAmount}>
            {loading ? "…" : money(totalCharge)}
          </Text>
        </LinearGradient>

        {/* List */}
        <View style={styles.listWrap}>
          <Text style={styles.sectionTitle}>Recent Bills</Text>

          {loading ? (
            <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 40 }} />
          ) : bills.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No {theme.label.toLowerCase()} bills yet</Text>
            </View>
          ) : (
            bills.map((item: any) => (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/utilities/${type}/${item.id}` as any)}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                <View style={[styles.cardIcon, { backgroundColor: theme.bg }]}>
                  <Ionicons name={theme.icon} size={22} color={theme.accent} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={styles.periodRow}>
                    <Text style={styles.cardPeriod}>{item.period ?? `Bill #${item.id}`}</Text>
                    {isOwner && item.unit ? (
                      <View style={[styles.unitBadge, { backgroundColor: theme.bg }]}>
                        <Ionicons name="home" size={11} color={theme.accent} />
                        <Text style={[styles.unitBadgeText, { color: theme.accent }]}>{item.unit}</Text>
                      </View>
                    ) : null}
                  </View>
                  {item.consumption !== undefined && (
                    <View style={styles.consumptionRow}>
                      <Ionicons name="speedometer-outline" size={13} color="#64748b" />
                      <Text style={styles.cardSub}>
                        {item.consumption} units
                        {item.previous_reading != null && item.current_reading != null
                          ? `  ·  ${item.previous_reading}→${item.current_reading}`
                          : ""}
                      </Text>
                    </View>
                  )}
                  {item.reading_date ? (
                    <Text style={styles.cardDate}>
                      {item.reading_date}
                      {item.rate != null ? `  ·  @ ${money(item.rate)}/unit` : ""}
                    </Text>
                  ) : null}
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.cardAmount, { color: theme.accent }]}>
                    {money(item.charge_amount ?? item.amount)}
                  </Text>
                  <View style={styles.viewRow}>
                    <Text style={styles.viewText}>View</Text>
                    <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
                  </View>
                </View>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
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

  segment: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 5,
    marginHorizontal: 18,
    marginTop: 6,
    gap: 5,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  segmentText: { fontSize: 15, fontWeight: "700" },

  hero: {
    marginHorizontal: 18,
    marginTop: 16,
    padding: 20,
    borderRadius: 22,
    overflow: "hidden",
  },
  heroCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: -60,
    right: -30,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  countPill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  heroLabel: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600" },
  heroAmount: { color: "#fff", fontSize: 34, fontWeight: "800", marginTop: 4 },

  listWrap: { paddingHorizontal: 18, marginTop: 20 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 14,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardPressed: { opacity: 0.7, transform: [{ scale: 0.99 }] },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  periodRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  cardPeriod: { fontSize: 15.5, fontWeight: "700", color: "#0f172a" },
  unitBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  unitBadgeText: { fontSize: 11, fontWeight: "800" },
  consumptionRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  cardSub: { fontSize: 13, color: "#64748b" },
  cardDate: { fontSize: 11.5, color: "#94a3b8", marginTop: 3, fontWeight: "600" },
  cardAmount: { fontSize: 16, fontWeight: "800" },
  viewRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 4 },
  viewText: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },

  empty: { alignItems: "center", paddingVertical: 50, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
});

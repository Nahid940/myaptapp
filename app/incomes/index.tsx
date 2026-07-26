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
import { useTheme } from "@/context/ThemeContext";

const CURRENCY = "KES";
const money = (v: any) =>
  v === undefined || v === null ? "—" : `${CURRENCY} ${Number(v).toLocaleString()}`;

const statusStyle = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return { color: "#16a34a", bg: "#dcfce7", label: "Paid" };
    case "partial":
      return { color: "#d97706", bg: "#fef3c7", label: "Partial" };
    case "due":
    case "pending":
    case "unpaid":
      return { color: "#dc2626", bg: "#fee2e2", label: status || "Due" };
    default:
      return { color: "#64748b", bg: "#f1f5f9", label: status || "—" };
  }
};

export default function IncomesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [payouts, setPayouts] = useState<any[]>([]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/owner/payouts`);
      const d = res?.data ?? {};
      setSummary(d?.summary ?? null);
      setPayouts(Array.isArray(d?.payouts) ? d.payouts : []);
    } catch {
      setSummary(null);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, []);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Pressable
          hitSlop={10}
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.navTitle, { color: colors.text }]}>Incomes</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#159df8" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Summary hero */}
          <LinearGradient
            colors={["#0d9488", "#0f766e", "#115e59"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.heroCircle} />
            <View style={styles.heroTop}>
              <View style={styles.heroIcon}>
                <Ionicons name="cash" size={24} color="#fff" />
              </View>
              <View style={styles.countPill}>
                <Text style={styles.countText}>{summary?.total_payouts ?? 0} Received</Text>
              </View>
            </View>
            <Text style={styles.heroLabel}>Income Amount</Text>
            <Text style={styles.heroAmount}>{money(summary?.payable_amount)}</Text>
            <View style={styles.heroRow}>
              <View>
                <Text style={styles.heroSmall}>Received</Text>
                <Text style={styles.heroValue}>{money(summary?.paid_amount)}</Text>
              </View>
              <View style={styles.heroVLine} />
              <View>
                <Text style={styles.heroSmall}>Due</Text>
                <Text style={styles.heroValue}>{money(summary?.due_amount)}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Payouts list */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Incomes</Text>

          {payouts.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="wallet-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No payouts yet</Text>
            </View>
          ) : (
            payouts.map((p: any, i: number) => {
              const ss = statusStyle(p.status);
              return (
                <View key={p.id ?? i} style={[styles.card, { backgroundColor: colors.card }]}>
                  <View style={[styles.cardIcon, { backgroundColor: "#ccfbf1" }]}>
                    <Ionicons name="business" size={22} color="#0d9488" />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                        {p.apartment_code ?? "Unit"}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                        <Text style={[styles.badgeText, { color: ss.color }]}>
                          {String(ss.label).toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                      <Text style={styles.metaText}>{p.period ?? `${p.month_name} ${p.year}`}</Text>
                    </View>
                    <Text style={styles.subMeta}>
                      Paid {money(p.paid_amount)} · Due {money(p.due_amount)}
                    </Text>
                  </View>

                  <Text style={[styles.amount, { color: colors.text }]}>
                    {money(p.payable_amount)}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
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
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontWeight: "800" },

  hero: {
    marginTop: 6,
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
    marginBottom: 16,
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
  heroRow: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  heroVLine: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 24,
  },
  heroSmall: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },
  heroValue: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: "800", marginTop: 24, marginBottom: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { flex: 1, fontSize: 15.5, fontWeight: "800" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  metaText: { fontSize: 12.5, color: "#94a3b8", fontWeight: "600" },
  subMeta: { fontSize: 12, color: "#94a3b8", fontWeight: "600", marginTop: 3 },
  amount: { fontSize: 16, fontWeight: "800" },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: "800" },

  empty: { alignItems: "center", paddingVertical: 50, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
});

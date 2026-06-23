import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";
import { useTheme } from "@/context/ThemeContext";

const statusStyle = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
    case "success":
    case "completed":
      return { color: "#16a34a", bg: "#dcfce7", label: status || "Paid" };
    case "partial":
      return { color: "#d97706", bg: "#fef3c7", label: status || "Partial" };
    case "failed":
    case "rejected":
      return { color: "#dc2626", bg: "#fee2e2", label: status || "Failed" };
    default:
      return null;
  }
};

export default function PaymentsList() {
  const router = useRouter();
  const { colors } = useTheme();

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [currency, setCurrency] = useState("");

  const fetchPayments = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/payments?page=${pageNumber}`);
      const list = res?.data ?? res?.payments ?? [];
      setPayments(Array.isArray(list) ? list : []);
      setPage(res?.current_page ?? res?.pagination?.current_page ?? pageNumber);
      setLastPage(res?.last_page ?? res?.pagination?.last_page ?? 1);
      setTotal(res?.total ?? res?.pagination?.total ?? (Array.isArray(list) ? list.length : 0));
      setCurrency(res?.currency ?? "");
    } catch (err) {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, []);

  const money = (v: any) =>
    v === undefined || v === null ? "—" : `${currency ? currency + " " : ""}${v}`;

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
        <Text style={[styles.navTitle, { color: colors.text }]}>My Payments</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#16a34a", "#15803d"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroCircle} />
          <View style={styles.heroIcon}>
            <Ionicons name="wallet" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Payment History</Text>
            <Text style={styles.heroSub}>
              {total} payment{total === 1 ? "" : "s"} recorded
            </Text>
          </View>
        </LinearGradient>

        {/* List */}
        {loading ? (
          <ActivityIndicator size="large" color="#16a34a" style={{ marginTop: 40 }} />
        ) : payments.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No payments yet</Text>
          </View>
        ) : (
          payments.map((item: any) => {
            const ss = statusStyle(item.status);
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/payment/${item.id}`)}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: colors.card },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <View style={styles.cardIcon}>
                  <Ionicons name="checkmark-circle" size={22} color="#16a34a" />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.period, { color: colors.text }]}>
                    {item.payment_month} {item.payment_year}
                  </Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={12} color={colors.muted} />
                    <Text style={[styles.metaText, { color: colors.muted }]}>
                      {item.created_at}
                    </Text>
                    {item.payment_method ? (
                      <>
                        <Text style={[styles.metaDot, { color: colors.muted }]}>•</Text>
                        <Text style={[styles.metaText, { color: colors.muted }]}>
                          {item.payment_method}
                        </Text>
                      </>
                    ) : null}
                  </View>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.amount}>{money(item.total_paid)}</Text>
                  {ss ? (
                    <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                      <Text style={[styles.badgeText, { color: ss.color }]}>
                        {String(ss.label).toUpperCase()}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.viewRow}>
                      <Text style={[styles.viewText, { color: colors.muted }]}>View</Text>
                      <Ionicons name="chevron-forward" size={14} color={colors.muted} />
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}

        {/* Pagination */}
        {!loading && payments.length > 0 && lastPage > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, page <= 1 && styles.disabled]}
              disabled={page <= 1}
              onPress={() => fetchPayments(page - 1)}
            >
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={[styles.pageInfo, { color: colors.text }]}>
              Page {page} of {lastPage}
            </Text>
            <TouchableOpacity
              style={[styles.pageBtn, page >= lastPage && styles.disabled]}
              disabled={page >= lastPage}
              onPress={() => fetchPayments(page + 1)}
            >
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 20,
    marginTop: 6,
    marginBottom: 18,
    overflow: "hidden",
  },
  heroCircle: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.12)",
    top: -55,
    right: -25,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { color: "#fff", fontSize: 19, fontWeight: "800" },
  heroSub: { color: "rgba(255,255,255,0.9)", fontSize: 13, marginTop: 2 },

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
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  period: { fontSize: 15.5, fontWeight: "800" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3, flexWrap: "wrap" },
  metaText: { fontSize: 12, fontWeight: "600" },
  metaDot: { fontSize: 11 },
  amount: { fontSize: 16, fontWeight: "800", color: "#16a34a" },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, marginTop: 5 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  viewRow: { flexDirection: "row", alignItems: "center", gap: 2, marginTop: 4 },
  viewText: { fontSize: 12, fontWeight: "600" },

  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 6,
  },
  pageBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { backgroundColor: "#cbd5e1" },
  pageInfo: { fontSize: 14, fontWeight: "700" },
});

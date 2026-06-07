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

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TYPE_META: Record<string, { icon: IconName; color: string; bg: string }> = {
  rent: { icon: "home", color: "#2563eb", bg: "#dbeafe" },
  water_bill: { icon: "water", color: "#0ea5e9", bg: "#e0f2fe" },
  water: { icon: "water", color: "#0ea5e9", bg: "#e0f2fe" },
  electricity_bill: { icon: "flash", color: "#f59e0b", bg: "#fef3c7" },
  electricity: { icon: "flash", color: "#f59e0b", bg: "#fef3c7" },
  service_charge: { icon: "construct", color: "#0d9488", bg: "#ccfbf1" },
  late_fee: { icon: "alert-circle", color: "#dc2626", bg: "#fee2e2" },
  default: { icon: "receipt", color: "#7c3aed", bg: "#ede9fe" },
};

const statusStyle = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return { color: "#16a34a", bg: "#dcfce7" };
    case "partial":
      return { color: "#d97706", bg: "#fef3c7" };
    case "unpaid":
    case "pending":
    case "overdue":
    case "due":
      return { color: "#dc2626", bg: "#fee2e2" };
    default:
      return { color: "#64748b", bg: "#f1f5f9" };
  }
};

export default function InvoicesScreen() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("");
  const [data, setData] = useState<any>(null);

  const label = `${MONTHS[month - 1]} ${year}`;

  const money = (v: any) =>
    v === undefined || v === null
      ? "—"
      : `${currency ? currency + " " : ""}${Number(v).toLocaleString()}`;

  const fetchInvoices = async (m: number, y: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/invoices?month=${m}&year=${y}`);
      const d = res?.data ?? {};
      setData(d);
      setCurrency(d?.currency ?? res?.currency ?? "");
    } catch (err) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(month, year);
  }, [month, year]);

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  const rows: any[] =
    data?.charges?.length > 0 ? data.charges : data?.invoice ? [data.invoice] : [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={styles.navTitle}>My Invoices</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Month navigator */}
      <View style={styles.monthNav}>
        <Pressable style={styles.navArrow} onPress={() => changeMonth(-1)} hitSlop={6}>
          <Ionicons name="chevron-back" size={22} color="#159df8" />
        </Pressable>
        <View style={styles.monthCenter}>
          <Ionicons name="calendar" size={16} color="#159df8" />
          <Text style={styles.monthText}>{label}</Text>
        </View>
        <Pressable style={styles.navArrow} onPress={() => changeMonth(1)} hitSlop={6}>
          <Ionicons name="chevron-forward" size={22} color="#159df8" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Month summary hero */}
        <LinearGradient
          colors={["#159df8", "#0b7dd0", "#0a64b8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroCircle} />
          <Text style={styles.heroLabel}>Balance for {label}</Text>
          <Text style={styles.heroBalance}>
            {loading ? "…" : money(data?.month_balance)}
          </Text>
          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroSmall}>Invoiced</Text>
              <Text style={styles.heroValue}>{money(data?.month_subtotal)}</Text>
            </View>
            <View style={styles.heroVLine} />
            <View>
              <Text style={styles.heroSmall}>Paid</Text>
              <Text style={styles.heroValue}>{money(data?.month_paid)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Charges */}
        <Text style={styles.sectionTitle}>Charges</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#159df8" style={{ marginTop: 30 }} />
        ) : rows.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="file-tray-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No invoices for {label}</Text>
          </View>
        ) : (
          rows.map((item: any, index: number) => {
            const meta = TYPE_META[(item.type || "").toLowerCase()] ?? TYPE_META.default;
            const ss = statusStyle(item.status);
            return (
              <View key={item.id ?? index} style={styles.card}>
                <View style={[styles.cardIcon, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={22} color={meta.color} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.type_label ?? item.type ?? "Charge"}</Text>
                  <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
                    <Text style={styles.metaText}>{item.date}</Text>
                  </View>
                  {item.invoice_id ? (
                    <Text style={styles.invoiceId} numberOfLines={1}>
                      {item.invoice_id}
                    </Text>
                  ) : null}
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.cardAmount}>{money(item.amount)}</Text>
                  <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                    <Text style={[styles.badgeText, { color: ss.color }]}>
                      {String(item.status || "—").toUpperCase()}
                    </Text>
                  </View>
                  {Number(item.balance) > 0 ? (
                    <Text style={styles.balance}>Bal: {money(item.balance)}</Text>
                  ) : null}
                </View>
              </View>
            );
          })
        )}

        {/* All-time totals */}
        {!loading && data && (data.total_invoiced != null || data.total_paid != null) && (
          <View style={styles.totalsCard}>
            <Text style={styles.totalsTitle}>All-Time Summary</Text>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Invoiced</Text>
              <Text style={styles.totalsValue}>{money(data.total_invoiced)}</Text>
            </View>
            <View style={styles.totalsDivider} />
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Total Paid</Text>
              <Text style={[styles.totalsValue, { color: "#16a34a" }]}>
                {money(data.total_paid)}
              </Text>
            </View>
          </View>
        )}
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

  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 18,
    borderRadius: 16,
    padding: 6,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  navArrow: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#f0f9ff",
    alignItems: "center",
    justifyContent: "center",
  },
  monthCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
  monthText: { fontSize: 16, fontWeight: "800", color: "#0f172a" },

  hero: {
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
  heroLabel: { color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: "600" },
  heroBalance: { color: "#fff", fontSize: 36, fontWeight: "800", marginTop: 4 },
  heroRow: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  heroVLine: {
    width: 1,
    height: 34,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 24,
  },
  heroSmall: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "600" },
  heroValue: { color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 2 },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 24,
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
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15.5, fontWeight: "700", color: "#0f172a" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  metaText: { fontSize: 12.5, color: "#94a3b8", fontWeight: "600" },
  invoiceId: { fontSize: 11.5, color: "#cbd5e1", marginTop: 2 },
  cardAmount: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    marginTop: 5,
  },
  badgeText: { fontSize: 10.5, fontWeight: "800" },
  balance: { fontSize: 11.5, color: "#dc2626", fontWeight: "700", marginTop: 4 },

  empty: { alignItems: "center", paddingVertical: 50, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },

  totalsCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginTop: 10,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  totalsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalsLabel: { fontSize: 14.5, color: "#64748b", fontWeight: "600" },
  totalsValue: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  totalsDivider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },
});

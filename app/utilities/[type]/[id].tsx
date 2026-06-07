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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/lib/api";

const TYPES: Record<
  string,
  {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>["name"];
    colors: [string, string];
    accent: string;
  }
> = {
  water: {
    label: "Water",
    icon: "water",
    colors: ["#0ea5e9", "#0369a1"],
    accent: "#0ea5e9",
  },
  electricity: {
    label: "Electricity",
    icon: "flash",
    colors: ["#f59e0b", "#d97706"],
    accent: "#f59e0b",
  },
};

const statusStyle = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "paid":
      return { color: "#16a34a", bg: "#dcfce7", label: "Paid" };
    case "partial":
      return { color: "#d97706", bg: "#fef3c7", label: "Partial" };
    case "pending":
    case "unpaid":
    case "due":
      return { color: "#dc2626", bg: "#fee2e2", label: status || "Due" };
    default:
      return { color: "#64748b", bg: "#f1f5f9", label: status || "—" };
  }
};

const DETAIL_ROWS: { label: string; keys: string[] }[] = [
  { label: "Billing Period", keys: ["period", "billing_period"] },
  { label: "Bill Month", keys: ["bill_month", "month"] },
  { label: "Bill Year", keys: ["bill_year", "year"] },
  { label: "Previous Reading", keys: ["previous_reading", "prev_reading"] },
  { label: "Current Reading", keys: ["current_reading", "curr_reading"] },
  { label: "Consumption", keys: ["consumption", "units", "usage"] },
  { label: "Rate / Unit", keys: ["rate", "unit_rate"] },
  { label: "Due Date", keys: ["due_date"] },
  { label: "Issued On", keys: ["created_at", "issued_at"] },
  { label: "Paid On", keys: ["paid_at", "payment_date"] },
  { label: "Reference", keys: ["reference", "ref"] },
  { label: "Meter Number", keys: ["meter_number", "meter_no"] },
  { label: "Remarks", keys: ["remarks", "note"] },
];

const pick = (obj: any, keys: string[]) => {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null && obj?.[k] !== "") return obj[k];
  }
  return undefined;
};

export default function UtilityBillDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type: string; id: string }>();
  const type = (params.type || "water").toLowerCase();
  const theme = TYPES[type] ?? TYPES.water;

  const [bill, setBill] = useState<any>(null);
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchBill = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/utilities/${type}/${params.id}`);
      const data = response?.utility ?? response?.data ?? response;
      setCurrency(response?.currency ?? response?.data?.currency ?? data?.currency ?? "");
      setBill(data?.[type] ?? data);
    } catch (err) {
      // console.error("Error fetching utility bill:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBill();
  }, []);

  if (loading || !bill) {
    return (
      <SafeAreaView style={styles.loaderWrap}>
        <ActivityIndicator size="large" color={theme.accent} />
      </SafeAreaView>
    );
  }

  const rawAmount =
    bill.charge_amount ?? bill.amount ?? bill.total_amount ?? bill.total ?? bill.bill_amount;
  const amount =
    rawAmount === undefined || rawAmount === null
      ? "—"
      : `${currency ? currency + " " : ""}${rawAmount}`;
  const s = statusStyle(bill.status);
  const rows = DETAIL_ROWS.map((r) => ({ label: r.label, value: pick(bill, r.keys) })).filter(
    (r) => r.value !== undefined
  );

  return (
    <View style={styles.root}>
      {/* Gradient header */}
      <LinearGradient colors={theme.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerCircle} />
        <SafeAreaView edges={["top"]}>
          <View style={styles.navbar}>
            <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </Pressable>
            <Text style={styles.navTitle}>{theme.label} Bill</Text>
            <View style={{ width: 38 }} />
          </View>

          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name={theme.icon} size={30} color="#fff" />
            </View>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amount}>{amount}</Text>
            <View style={[styles.statusPill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <View style={[styles.statusDot, { backgroundColor: "#fff" }]} />
              <Text style={styles.statusText}>{s.label}</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Details card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Details</Text>
          {rows.length === 0 ? (
            <Text style={styles.noData}>No additional details available.</Text>
          ) : (
            rows.map((r, i) => (
              <View
                key={r.label}
                style={[styles.row, i === rows.length - 1 && { borderBottomWidth: 0 }]}
              >
                <Text style={styles.rowLabel}>{r.label}</Text>
                <Text style={styles.rowValue}>{String(r.value)}</Text>
              </View>
            ))
          )}

          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={[styles.totalValue, { color: theme.accent }]}>{amount}</Text>
          </View>
        </View>

        {/* Download */}
        <TouchableOpacity style={styles.downloadBtn}>
          <MaterialCommunityIcons name="file-download-outline" size={20} color={theme.accent} />
          <Text style={[styles.downloadText, { color: theme.accent }]}>Download PDF Receipt</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f1f5f9" },
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },

  header: {
    paddingBottom: 50,
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
    right: -40,
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontWeight: "800", color: "#fff" },
  headerContent: { alignItems: "center", marginTop: 8 },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  amountLabel: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  amount: { color: "#fff", fontSize: 40, fontWeight: "800", marginTop: 2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { color: "#fff", fontSize: 13, fontWeight: "700" },

  scroll: { flex: 1, paddingHorizontal: 18, marginTop: -28 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rowLabel: { fontSize: 14.5, color: "#64748b", flex: 1 },
  rowValue: {
    fontSize: 14.5,
    color: "#0f172a",
    fontWeight: "700",
    flex: 1,
    textAlign: "right",
  },
  noData: { color: "#94a3b8", fontSize: 14, paddingVertical: 14 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 8 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  totalLabel: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  totalValue: { fontSize: 22, fontWeight: "800" },

  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  downloadText: { fontWeight: "700", fontSize: 15 },
});

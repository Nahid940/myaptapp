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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";

export default function LedgerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [rows, setRows] = useState<any[]>([]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/ledger`);
      setCurrency(res?.currency ?? "");
      setSummary(res?.summary ?? null);
      setRows(res?.ledgers ?? res?.data ?? []);
    } catch (err) {
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const money = (v: any, withCurrency = true) =>
    v === undefined || v === null
      ? null
      : `${withCurrency && currency ? currency + " " : ""}${Number(v).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  const net = summary?.net_balance ?? 0;
  const netNegative = Number(net) < 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={styles.navTitle}>My Ledger</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#159df8" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Ledger table */}
          <View style={styles.table}>
            {/* Header */}
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cellDesc, styles.headerText]}>Description</Text>
              <Text style={[styles.cellNum, styles.headerText]}>Debit</Text>
              <Text style={[styles.cellNum, styles.headerText]}>Credit</Text>
            </View>

            {rows.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="book-outline" size={44} color="#cbd5e1" />
                <Text style={styles.emptyText}>No ledger entries</Text>
              </View>
            ) : (
              rows.map((item, index) => {
                const debit = money(item.debit, false);
                const credit = money(item.credit, false);
                return (
                  <View
                    key={item.id ?? index}
                    style={[
                      styles.row,
                      index % 2 === 1 && styles.rowAlt,
                      index === rows.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={styles.cellDesc}>
                      <Text style={styles.descText} numberOfLines={2}>
                        {item.description}
                      </Text>
                      <Text style={styles.metaText}>{item.date}</Text>
                      {item.reference ? (
                        <Text style={styles.refText} numberOfLines={1}>
                          {item.reference}
                        </Text>
                      ) : null}
                      {item.balance !== undefined && item.balance !== null ? (
                        <Text style={styles.balText}>Bal: {money(item.balance)}</Text>
                      ) : null}
                    </View>

                    <Text style={[styles.cellNum, styles.debit]}>
                      {debit ?? "—"}
                    </Text>
                    <Text style={[styles.cellNum, styles.credit]}>
                      {credit ?? "—"}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {/* Summary below the ledger */}
          {summary && (
            <View style={styles.summary}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Debits</Text>
                <Text style={[styles.summaryValue, { color: "#dc2626" }]}>
                  {money(summary.total_debit)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Credits</Text>
                <Text style={[styles.summaryValue, { color: "#16a34a" }]}>
                  {money(summary.total_credit)}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Net</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: netNegative ? "#16a34a" : "#dc2626" },
                  ]}
                >
                  {money(net)}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
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

  table: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 6,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  rowAlt: { backgroundColor: "#f8fafc" },
  headerRow: {
    backgroundColor: "#0f172a",
    paddingVertical: 13,
  },
  headerText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  cellDesc: { flex: 1.7, paddingRight: 8 },
  cellNum: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "right",
  },
  descText: { fontSize: 13.5, fontWeight: "700", color: "#0f172a" },
  metaText: { fontSize: 11.5, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  refText: { fontSize: 11, color: "#cbd5e1", marginTop: 1 },
  balText: { fontSize: 11, color: "#64748b", fontWeight: "700", marginTop: 3 },
  debit: { color: "#dc2626" },
  credit: { color: "#16a34a" },

  empty: { alignItems: "center", paddingVertical: 40, gap: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },

  summary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginTop: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryDivider: { width: 1, height: 36, backgroundColor: "#e2e8f0" },
  summaryLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 5,
  },
  summaryValue: { fontSize: 13.5, fontWeight: "800" },
});

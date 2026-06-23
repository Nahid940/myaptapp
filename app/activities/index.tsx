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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../../lib/api";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const META: Record<string, { icon: IconName; color: string; bg: string }> = {
  payment: { icon: "cash", color: "#16a34a", bg: "#dcfce7" },
  invoice: { icon: "document-text", color: "#4f46e5", bg: "#e0e7ff" },
  ticket: { icon: "ticket", color: "#dc2626", bg: "#fee2e2" },
  maintenance: { icon: "hammer", color: "#0d9488", bg: "#ccfbf1" },
  notice: { icon: "megaphone", color: "#159df8", bg: "#e0f2fe" },
  guest: { icon: "person-add", color: "#ea580c", bg: "#ffedd5" },
  ledger: { icon: "book", color: "#b45309", bg: "#fef3c7" },
  default: { icon: "ellipse", color: "#64748b", bg: "#f1f5f9" },
};

const metaFor = (key: string) => {
  const k = (key || "").toLowerCase();
  if (k.includes("payment")) return META.payment;
  if (k.includes("invoice")) return META.invoice;
  if (k.includes("ticket")) return META.ticket;
  if (k.includes("maintenance")) return META.maintenance;
  if (k.includes("notice")) return META.notice;
  if (k.includes("guest")) return META.guest;
  if (k.includes("ledger")) return META.ledger;
  return META.default;
};

export default function ActivitiesScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchActivities = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/activities?page=${pageNumber}&limit=50`);
      const list = res?.activities ?? res?.data ?? [];
      setItems(Array.isArray(list) ? list : []);
      setPage(res?.pagination?.current_page ?? pageNumber);
      setLastPage(res?.pagination?.last_page ?? 1);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={styles.navTitle}>Activity</Text>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#159df8" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={46} color="#cbd5e1" />
              <Text style={styles.emptyText}>No activity yet</Text>
            </View>
          ) : (
            <View style={styles.card}>
              {items.map((a, i) => {
                const meta = metaFor(a.activity ?? a.type);
                return (
                  <View
                    key={a.id ?? i}
                    style={[
                      styles.row,
                      i === items.length - 1 && { borderBottomWidth: 0 },
                    ]}
                  >
                    <View style={[styles.icon, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon} size={18} color={meta.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.log}>{a.log ?? a.title ?? "Activity"}</Text>
                      <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={12} color="#94a3b8" />
                        <Text style={styles.time}>{a.time ?? a.created_at}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Pagination */}
          {!loading && items.length > 0 && lastPage > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, page <= 1 && styles.disabled]}
                disabled={page <= 1}
                onPress={() => fetchActivities(page - 1)}
              >
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.pageInfo}>
                Page {page} of {lastPage}
              </Text>
              <TouchableOpacity
                style={[styles.pageBtn, page >= lastPage && styles.disabled]}
                disabled={page >= lastPage}
                onPress={() => fetchActivities(page + 1)}
              >
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </TouchableOpacity>
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

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 6,
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
    gap: 12,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  log: { fontSize: 14, fontWeight: "600", color: "#0f172a", lineHeight: 19 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  time: { fontSize: 11.5, color: "#94a3b8", fontWeight: "600" },

  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 16,
  },
  pageBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#159df8",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { backgroundColor: "#cbd5e1" },
  pageInfo: { fontSize: 14, fontWeight: "700", color: "#334155" },
});

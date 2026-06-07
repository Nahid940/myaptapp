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
import { useFocusEffect, useRouter } from "expo-router";
import { api } from "../../lib/api";

const PRIORITY_META: Record<string, { color: string; bg: string }> = {
  low: { color: "#16a34a", bg: "#dcfce7" },
  medium: { color: "#d97706", bg: "#fef3c7" },
  high: { color: "#ea580c", bg: "#ffedd5" },
  urgent: { color: "#dc2626", bg: "#fee2e2" },
};

const statusStyle = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "completed":
    case "resolved":
    case "done":
      return { color: "#16a34a", bg: "#dcfce7" };
    case "in_progress":
    case "in progress":
    case "processing":
      return { color: "#2563eb", bg: "#dbeafe" };
    case "rejected":
    case "cancelled":
      return { color: "#dc2626", bg: "#fee2e2" };
    default:
      return { color: "#d97706", bg: "#fef3c7" };
  }
};

export default function MaintenanceList() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const fetchItems = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/maintenances?page=${pageNumber}`);
      const list =
        res?.maintenances ?? res?.data ?? (Array.isArray(res) ? res : []);
      setItems(Array.isArray(list) ? list : []);

      const pg = res?.pagination ?? res?.meta ?? res ?? {};
      setPage(pg.current_page ?? 1);
      setLastPage(pg.last_page ?? 1);
    } catch (err) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Refetch when returning from the create screen.
  useFocusEffect(
    React.useCallback(() => {
      fetchItems(1);
    }, [])
  );

  const typeName = (item: any) =>
    item.type?.name ??
    item.maintenance_type?.name ??
    item.type_name ??
    item.type ??
    "General";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={styles.navTitle}>Maintenance</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#159df8" style={{ marginTop: 50 }} />
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="hammer-outline" size={50} color="#cbd5e1" />
            <Text style={styles.emptyText}>No maintenance requests yet</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push("/maintenance/create")}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.emptyBtnText}>Create Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item: any) => {
            const pm = PRIORITY_META[(item.priority || "").toLowerCase()] ?? {
              color: "#64748b",
              bg: "#f1f5f9",
            };
            const ss = statusStyle(item.status);
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardIcon}>
                    <Ionicons name="hammer" size={20} color="#159df8" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View style={styles.typeRow}>
                      <Ionicons name="construct-outline" size={13} color="#94a3b8" />
                      <Text style={styles.typeText}>{typeName(item)}</Text>
                    </View>
                  </View>
                  {item.status ? (
                    <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                      <Text style={[styles.badgeText, { color: ss.color }]}>
                        {String(item.status).replace(/_/g, " ")}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {item.description ? (
                  <Text style={styles.cardDesc} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}

                <View style={styles.cardFooter}>
                  {item.priority ? (
                    <View style={[styles.priorityChip, { backgroundColor: pm.bg }]}>
                      <Text style={[styles.priorityText, { color: pm.color }]}>
                        {String(item.priority).toUpperCase()}
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}
                  {item.created_at ? (
                    <View style={styles.dateRow}>
                      <Ionicons name="time-outline" size={13} color="#94a3b8" />
                      <Text style={styles.dateText}>{item.created_at}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })
        )}

        {/* Pagination */}
        {!loading && items.length > 0 && lastPage > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageBtn, page <= 1 && styles.disabled]}
              disabled={page <= 1}
              onPress={() => fetchItems(page - 1)}
            >
              <Ionicons name="chevron-back" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.pageInfo}>
              Page {page} of {lastPage}
            </Text>
            <TouchableOpacity
              style={[styles.pageBtn, page >= lastPage && styles.disabled]}
              disabled={page >= lastPage}
              onPress={() => fetchItems(page + 1)}
            >
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push("/maintenance/create")}
      >
        <Ionicons name="add" size={26} color="#fff" />
        <Text style={styles.fabText}>New Request</Text>
      </TouchableOpacity>
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
    padding: 16,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: 15.5, fontWeight: "800", color: "#0f172a" },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  typeText: { fontSize: 12.5, color: "#94a3b8", fontWeight: "600" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  cardDesc: { fontSize: 13.5, color: "#475569", lineHeight: 20, marginTop: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  priorityChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priorityText: { fontSize: 11, fontWeight: "800" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dateText: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },

  empty: { alignItems: "center", paddingVertical: 60, gap: 14 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#159df8",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

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
    backgroundColor: "#159df8",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { backgroundColor: "#cbd5e1" },
  pageInfo: { fontSize: 14, fontWeight: "700", color: "#334155" },

  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#159df8",
    paddingLeft: 16,
    paddingRight: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: "#159df8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});

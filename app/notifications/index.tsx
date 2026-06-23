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
import { useTheme } from "@/context/ThemeContext";

const statusStyle = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "active":
      return { color: "#159df8", bg: "#e0f2fe", label: "Active" };
    case "closed":
    case "read":
      return { color: "#64748b", bg: "#f1f5f9", label: "Read" };
    default:
      return { color: "#d97706", bg: "#fef3c7", label: status || "—" };
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchNotifications = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/notifications?page=${pageNumber}`);
      const list = res?.notifications ?? res?.data ?? [];
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
    fetchNotifications(1);
  }, []);

  const markRead = async (id: number) => {
    setBusyId(id);
    try {
      await api.put(`/notifications/${id}/status`, { status: "closed" });
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: "closed" } : n))
      );
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

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
        <Text style={[styles.navTitle, { color: colors.text }]}>Notifications</Text>
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
              <Ionicons name="notifications-off-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No notifications</Text>
            </View>
          ) : (
            items.map((n) => {
              const ss = statusStyle(n.status);
              const isActive = (n.status || "").toLowerCase() === "active";
              return (
                <View key={n.id} style={[styles.card, { backgroundColor: colors.card }]}>
                  <View
                    style={[
                      styles.iconWrap,
                      { backgroundColor: isActive ? "#e0f2fe" : colors.inputBg },
                    ]}
                  >
                    <Ionicons
                      name={isActive ? "notifications" : "notifications-outline"}
                      size={20}
                      color={isActive ? "#159df8" : colors.muted}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                        {n.title}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                        <Text style={[styles.badgeText, { color: ss.color }]}>{ss.label}</Text>
                      </View>
                    </View>
                    {n.desc ? (
                      <Text style={[styles.desc, { color: colors.muted }]}>{n.desc}</Text>
                    ) : null}
                    <View style={styles.footer}>
                      <Text style={styles.time}>{n.time ?? n.created_at}</Text>
                      {isActive && (
                        <Pressable
                          onPress={() => markRead(n.id)}
                          hitSlop={8}
                          style={styles.readBtn}
                        >
                          {busyId === n.id ? (
                            <ActivityIndicator size="small" color="#159df8" />
                          ) : (
                            <>
                              <Ionicons name="checkmark" size={14} color="#159df8" />
                              <Text style={styles.readText}>Mark read</Text>
                            </>
                          )}
                        </Pressable>
                      )}
                    </View>
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
                onPress={() => fetchNotifications(page - 1)}
              >
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={[styles.pageInfo, { color: colors.text }]}>
                Page {page} of {lastPage}
              </Text>
              <TouchableOpacity
                style={[styles.pageBtn, page >= lastPage && styles.disabled]}
                disabled={page >= lastPage}
                onPress={() => fetchNotifications(page + 1)}
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

  card: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flex: 1, fontSize: 15, fontWeight: "800" },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: "800" },
  desc: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  time: { fontSize: 11.5, color: "#94a3b8", fontWeight: "600" },
  readBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  readText: { color: "#159df8", fontSize: 12, fontWeight: "700" },

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
    backgroundColor: "#159df8",
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { backgroundColor: "#cbd5e1" },
  pageInfo: { fontSize: 14, fontWeight: "700" },
});

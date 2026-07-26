import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const priorityStyle = (priority?: string) => {
  switch ((priority || "").toLowerCase()) {
    case "high":
    case "urgent":
      return { color: "#dc2626", bg: "#fee2e2" };
    case "medium":
      return { color: "#d97706", bg: "#fef3c7" };
    case "low":
      return { color: "#16a34a", bg: "#dcfce7" };
    default:
      return { color: "#64748b", bg: "#f1f5f9" };
  }
};

const statusStyle = (status?: string) => {
  switch ((status || "").toLowerCase()) {
    case "solved":
    case "closed":
    case "resolved":
      return { color: "#16a34a", bg: "#dcfce7", label: status || "Solved" };
    case "open":
    case "active":
      return { color: "#0284c7", bg: "#e0f2fe", label: status || "Open" };
    case "in_progress":
    case "in progress":
      return { color: "#7c3aed", bg: "#ede9fe", label: status || "In Progress" };
    default:
      return { color: "#d97706", bg: "#fef3c7", label: status || "Pending" };
  }
};

export default function TicketsList() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const inFlight = useRef(false);

  const fetchTickets = async (pageNumber = 1) => {
    if (inFlight.current) return; // guard against overlapping requests
    inFlight.current = true;
    setLoading(true);
    try {
      const response = await api.get(`/tickets?page=${pageNumber}`);
      setTickets(Array.isArray(response?.tickets) ? response.tickets : response?.data ?? []);
      setPage(response?.pagination?.current_page ?? pageNumber);
      setLastPage(response?.pagination?.last_page ?? 1);
    } catch (err) {
      // keep existing list on failure
    } finally {
      setLoading(false);
      inFlight.current = false;
    }
  };

  useEffect(() => {
    fetchTickets(1);
  }, []);

  const goEdit = (item: any) =>
    router.push({
      pathname: "/(tabs)/tickets",
      params: {
        id: String(item.id),
        subject: item.subject ?? "",
        priority: item.priority ?? "",
        description: item.description ?? "",
      },
    } as any);

  const confirmDelete = (item: any) => {
    Alert.alert("Delete Ticket", `Delete "${item.subject ?? "this ticket"}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingId(item.id);
          try {
            await api.delete(`/tickets/${item.id}`);
            setTickets((prev) => prev.filter((t) => t.id !== item.id));
          } catch (err: any) {
            Alert.alert("Error", err?.message || "Could not delete. Please try again.");
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
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
        <Text style={[styles.navTitle, { color: colors.text }]}>My Tickets</Text>
        <Pressable
          hitSlop={10}
          onPress={() => router.push("/(tabs)/tickets" as any)}
          style={[styles.backBtn, { backgroundColor: "#159df8" }]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#159df8" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {tickets.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="ticket-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No tickets yet</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() => router.push("/(tabs)/tickets" as any)}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.emptyBtnText}>Open a Ticket</Text>
              </TouchableOpacity>
            </View>
          ) : (
            tickets.map((item: any) => {
              const ps = priorityStyle(item.priority);
              const ss = statusStyle(item.status);
              return (
                <View key={item.id} style={[styles.card, { backgroundColor: colors.card }]}>
                  <View style={styles.cardTop}>
                    <View style={[styles.iconWrap, { backgroundColor: ss.bg }]}>
                      <Ionicons name="ticket" size={20} color={ss.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.subject, { color: colors.text }]} numberOfLines={1}>
                        {item.subject || "Ticket"}
                      </Text>
                      {item.created_at ? (
                        <View style={styles.dateRow}>
                          <Ionicons name="time-outline" size={12} color="#94a3b8" />
                          <Text style={styles.dateText}>{item.created_at}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                      <Text style={[styles.badgeText, { color: ss.color }]}>
                        {String(ss.label).toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {item.description ? (
                    <Text style={[styles.desc, { color: colors.muted }]} numberOfLines={3}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <View style={[styles.priorityPill, { backgroundColor: ps.bg }]}>
                      <View style={[styles.priorityDot, { backgroundColor: ps.color }]} />
                      <Text style={[styles.priorityText, { color: ps.color }]}>
                        {(item.priority || "—").toString().toUpperCase()} PRIORITY
                      </Text>
                    </View>

                    <View style={styles.actions}>
                      <Pressable
                        hitSlop={8}
                        onPress={() => goEdit(item)}
                        style={[styles.actionBtn, { backgroundColor: colors.inputBg }]}
                      >
                        <Ionicons name="create-outline" size={18} color="#159df8" />
                      </Pressable>
                      <Pressable
                        hitSlop={8}
                        disabled={deletingId === item.id}
                        onPress={() => confirmDelete(item)}
                        style={[styles.actionBtn, { backgroundColor: "#fee2e2" }]}
                      >
                        {deletingId === item.id ? (
                          <ActivityIndicator size="small" color="#dc2626" />
                        ) : (
                          <Ionicons name="trash-outline" size={18} color="#dc2626" />
                        )}
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {/* Pagination */}
          {tickets.length > 0 && lastPage > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, page <= 1 && styles.disabled]}
                disabled={page <= 1}
                onPress={() => fetchTickets(page - 1)}
              >
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={[styles.pageInfo, { color: colors.text }]}>
                Page {page} of {lastPage}
              </Text>
              <TouchableOpacity
                style={[styles.pageBtn, page >= lastPage && styles.disabled]}
                disabled={page >= lastPage}
                onPress={() => fetchTickets(page + 1)}
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
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  subject: { fontSize: 15.5, fontWeight: "800" },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3 },
  dateText: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: "800" },

  desc: { fontSize: 13.5, lineHeight: 19, marginTop: 12 },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  priorityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: 10.5, fontWeight: "800", letterSpacing: 0.3 },

  empty: { alignItems: "center", paddingVertical: 70, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#159df8",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 6,
  },
  emptyBtnText: { color: "#fff", fontSize: 14.5, fontWeight: "800" },

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

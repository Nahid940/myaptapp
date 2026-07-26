import React, { useEffect, useState } from "react";
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

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const VISIT_META: Record<string, { icon: IconName; color: string; bg: string }> = {
  "personal visit": { icon: "person", color: "#2563eb", bg: "#dbeafe" },
  delivery: { icon: "cube", color: "#ea580c", bg: "#ffedd5" },
  "service / contractor": { icon: "construct", color: "#0d9488", bg: "#ccfbf1" },
  "estate agent": { icon: "business", color: "#7c3aed", bg: "#ede9fe" },
};

const metaFor = (t?: string) =>
  VISIT_META[(t || "").toLowerCase()] ?? { icon: "person", color: "#64748b", bg: "#f1f5f9" };

const statusStyle = (status?: string | null) => {
  switch ((status || "").toLowerCase()) {
    case "approved":
    case "checked_in":
    case "active":
      return { color: "#16a34a", bg: "#dcfce7", label: status as string };
    case "rejected":
    case "expired":
      return { color: "#dc2626", bg: "#fee2e2", label: status as string };
    default:
      return { color: "#d97706", bg: "#fef3c7", label: status || "Pending" };
  }
};

export default function VisitorListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchVisits = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/visits?page=${pageNumber}`);
      const list = res?.guests ?? res?.data ?? [];
      setData(Array.isArray(list) ? list : []);
      setPage(res?.pagination?.current_page ?? pageNumber);
      setLastPage(res?.pagination?.last_page ?? 1);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits(1);
  }, []);

  const confirmDelete = (g: any) => {
    Alert.alert(
      "Delete Guest",
      `Remove ${g.first_name ?? "this guest"}'s visit record? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeletingId(g.id);
            try {
              await api.delete(`/visits/${g.id}`);
              setData((prev) => prev.filter((v) => v.id !== g.id));
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Could not delete. Please try again.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const Row = ({ icon, label, value }: { icon: IconName; label: string; value?: string }) =>
    value ? (
      <View style={styles.detailRow}>
        <Ionicons name={icon} size={14} color={colors.muted} />
        <Text style={[styles.detailLabel, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    ) : null;

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
        <Text style={[styles.navTitle, { color: colors.text }]}>Guest List</Text>
        <Pressable
          hitSlop={10}
          onPress={() => router.push("/(tabs)/guestRegister" as any)}
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
          {data.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyText}>No guests registered yet</Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => router.push("/(tabs)/guestRegister" as any)}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.emptyAddText}>Register a Guest</Text>
              </TouchableOpacity>
            </View>
          ) : (
            data.map((g) => {
              const meta = metaFor(g.visit_type);
              const ss = statusStyle(g.status);
              return (
                <View key={g.id} style={[styles.card, { backgroundColor: colors.card }]}>
                  {/* Header */}
                  <View style={styles.cardTop}>
                    <View style={[styles.icon, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon} size={20} color={meta.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                        {g.first_name}
                      </Text>
                      <Text style={[styles.phone, { color: colors.muted }]}>{g.phone}</Text>
                    </View>
                    {g.pass ? (
                      <View style={styles.passBadge}>
                        <Ionicons name="card-outline" size={12} color="#159df8" />
                        <Text style={styles.passText}>{g.pass}</Text>
                      </View>
                    ) : null}
                    <Pressable
                      hitSlop={8}
                      onPress={() =>
                        router.push({
                          pathname: "/(tabs)/guestRegister",
                          params: {
                            id: String(g.id),
                            first_name: g.first_name ?? "",
                            phone: g.phone ?? "",
                            id_passport_no: g.id_passport_no ?? "",
                            remarks: g.remarks ?? "",
                            visit_type: g.visit_type ?? "",
                            access_method: g.access_method ?? "",
                            valid_from: g.valid_from ?? "",
                            valid_to: g.valid_to ?? "",
                            apartment_id: g.apartment_id != null ? String(g.apartment_id) : "",
                          },
                        } as any)
                      }
                      style={[styles.editBtn, { backgroundColor: colors.inputBg }]}
                    >
                      <Ionicons name="create-outline" size={18} color="#159df8" />
                    </Pressable>
                    <Pressable
                      hitSlop={8}
                      disabled={deletingId === g.id}
                      onPress={() => confirmDelete(g)}
                      style={[styles.editBtn, { backgroundColor: "#fee2e2" }]}
                    >
                      {deletingId === g.id ? (
                        <ActivityIndicator size="small" color="#dc2626" />
                      ) : (
                        <Ionicons name="trash-outline" size={18} color="#dc2626" />
                      )}
                    </Pressable>
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  {/* Details */}
                  <Row icon="albums-outline" label="Visit" value={g.visit_type} />
                  <Row icon="key-outline" label="Access" value={g.access_method} />
                  <Row
                    icon="calendar-outline"
                    label="Valid"
                    value={
                      g.valid_from || g.valid_to ? `${g.valid_from ?? "—"}  →  ${g.valid_to ?? "—"}` : undefined
                    }
                  />
                  <Row icon="finger-print-outline" label="ID" value={g.id_passport_no} />
                  <Row icon="home-outline" label="Visiting" value={g.visiting_name} />

                  {g.remarks ? (
                    <View style={[styles.note, { backgroundColor: colors.inputBg }]}>
                      <Ionicons name="chatbox-ellipses-outline" size={14} color={colors.muted} />
                      <Text style={[styles.noteText, { color: colors.muted }]}>{g.remarks}</Text>
                    </View>
                  ) : null}

                  {/* Footer */}
                  <View style={styles.cardFooter}>
                    <View style={[styles.badge, { backgroundColor: ss.bg }]}>
                      <Text style={[styles.badgeText, { color: ss.color }]}>
                        {String(ss.label).toUpperCase()}
                      </Text>
                    </View>
                    {g.created_at ? (
                      <Text style={[styles.created, { color: colors.muted }]}>{g.created_at}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })
          )}

          {/* Pagination */}
          {!loading && data.length > 0 && lastPage > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, page <= 1 && styles.disabled]}
                disabled={page <= 1}
                onPress={() => fetchVisits(page - 1)}
              >
                <Ionicons name="chevron-back" size={18} color="#fff" />
              </TouchableOpacity>
              <Text style={[styles.pageInfo, { color: colors.text }]}>
                Page {page} of {lastPage}
              </Text>
              <TouchableOpacity
                style={[styles.pageBtn, page >= lastPage && styles.disabled]}
                disabled={page >= lastPage}
                onPress={() => fetchVisits(page + 1)}
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
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 15.5, fontWeight: "800" },
  phone: { fontSize: 12.5, marginTop: 2, fontWeight: "600" },
  passBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  passText: { color: "#159df8", fontSize: 11.5, fontWeight: "800" },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, marginVertical: 12 },

  detailRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingVertical: 4 },
  detailLabel: { fontSize: 12.5, fontWeight: "600", width: 64 },
  detailValue: { flex: 1, fontSize: 13.5, fontWeight: "700" },

  note: {
    flexDirection: "row",
    gap: 7,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  noteText: { flex: 1, fontSize: 12.5, lineHeight: 18 },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 10.5, fontWeight: "800" },
  created: { fontSize: 11.5, fontWeight: "600" },

  empty: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { color: "#94a3b8", fontSize: 15, fontWeight: "600" },
  emptyAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#159df8",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 14,
    marginTop: 6,
  },
  emptyAddText: { color: "#fff", fontSize: 14.5, fontWeight: "800" },

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

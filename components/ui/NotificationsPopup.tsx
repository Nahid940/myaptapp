import React, { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";

export default function NotificationsPopup({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [count, setCount] = useState(0);
  const [busyId, setBusyId] = useState<number | null>(null);

  const fetchActive = async () => {
    setLoading(true);
    try {
      const res = await api.get("/notifications/active");
      const list = res?.notifications ?? [];
      setItems(Array.isArray(list) ? list : []);
      setCount(res?.active_count ?? (Array.isArray(list) ? list.length : 0));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) fetchActive();
  }, [visible]);

  const markRead = async (id: number) => {
    setBusyId(id);
    try {
      await api.put(`/notifications/${id}/status`, { status: "closed" });
      setItems((prev) => prev.filter((n) => n.id !== id));
      setCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    } finally {
      setBusyId(null);
    }
  };

  const viewAll = () => {
    onClose();
    router.push("/notifications" as any);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.panel, { backgroundColor: colors.card, marginTop: insets.top + 8 }]}
          onPress={() => {}}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="notifications" size={18} color="#159df8" />
              <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
              {count > 0 && (
                <View style={styles.countPill}>
                  <Text style={styles.countText}>{count}</Text>
                </View>
              )}
            </View>
            <Pressable hitSlop={8} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.muted} />
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator color="#159df8" style={{ paddingVertical: 34 }} />
          ) : items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="checkmark-done-circle-outline" size={42} color="#cbd5e1" />
              <Text style={styles.emptyText}>You're all caught up</Text>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {items.map((n, i) => (
                <View
                  key={n.id}
                  style={[
                    styles.item,
                    { borderBottomColor: colors.border },
                    i === items.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={styles.dot} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                      {n.title}
                    </Text>
                    {n.desc ? (
                      <Text style={[styles.itemDesc, { color: colors.muted }]} numberOfLines={2}>
                        {n.desc}
                      </Text>
                    ) : null}
                    <Text style={styles.itemTime}>{n.time ?? n.created_at}</Text>
                  </View>
                  <Pressable hitSlop={8} onPress={() => markRead(n.id)} style={styles.readBtn}>
                    {busyId === n.id ? (
                      <ActivityIndicator size="small" color="#159df8" />
                    ) : (
                      <Ionicons name="checkmark" size={18} color="#159df8" />
                    )}
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.viewAll} onPress={viewAll}>
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="arrow-forward" size={16} color="#159df8" />
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.35)",
    alignItems: "flex-end",
    paddingHorizontal: 12,
  },
  panel: {
    width: "94%",
    maxWidth: 430,
    borderRadius: 20,
    padding: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 16, fontWeight: "800" },
  countPill: {
    backgroundColor: "#ef4444",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  countText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#159df8",
    marginTop: 6,
  },
  itemTitle: { fontSize: 14.5, fontWeight: "700" },
  itemDesc: { fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  itemTime: { fontSize: 11, color: "#94a3b8", fontWeight: "600", marginTop: 4 },
  readBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },

  empty: { alignItems: "center", paddingVertical: 30, gap: 10 },
  emptyText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },

  viewAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f0f9ff",
  },
  viewAllText: { color: "#159df8", fontWeight: "800", fontSize: 14 },
});

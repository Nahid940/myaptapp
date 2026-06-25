import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { Field, PrimaryButton, FormHeader } from "@/components/ui/form";

type Priority = "low" | "medium" | "high" | "urgent";

const PRIORITY_META: Record<Priority, { color: string; bg: string; icon: any }> = {
  low: { color: "#16a34a", bg: "#dcfce7", icon: "arrow-down-circle" },
  medium: { color: "#d97706", bg: "#fef3c7", icon: "remove-circle" },
  high: { color: "#ea580c", bg: "#ffedd5", icon: "arrow-up-circle" },
  urgent: { color: "#dc2626", bg: "#fee2e2", icon: "alert-circle" },
};

const PRIORITIES: Priority[] = ["low", "medium", "high", "urgent"];

export default function MaintenanceCreate() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [typeId, setTypeId] = useState<number | null>(null);
  const [priority, setPriority] = useState<Priority>("medium");
  const [description, setDescription] = useState("");

  const [types, setTypes] = useState<any[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typeModal, setTypeModal] = useState(false);
  const [priorityModal, setPriorityModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; type?: string }>({});
  const [typesError, setTypesError] = useState<string | null>(null);

  // Find the first array anywhere in the response (handles {data:[]},
  // {data:{data:[]}}, {types:[]}, {data:{types:[]}}, plain array, etc.)
  const extractList = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res && typeof res === "object") {
      for (const v of Object.values(res)) {
        if (Array.isArray(v)) return v;
      }
      for (const v of Object.values(res)) {
        if (v && typeof v === "object") {
          const nested = extractList(v);
          if (nested.length) return nested;
        }
      }
    }
    return [];
  };

  const fetchTypes = async () => {
    setTypesLoading(true);
    setTypesError(null);
    try {
      const res = await api.get(`/maintenance-types`);
      const list = extractList(res);
      setTypes(list);
      if (list.length === 0) setTypesError("No maintenance types returned.");
    } catch (err: any) {
      setTypes([]);
      setTypesError(err?.message || "Failed to load types. Tap to retry.");
    } finally {
      setTypesLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const typeName = (t: any) =>
    t?.name ?? t?.title ?? t?.type_label ?? t?.label ?? t?.type ?? `Type #${t?.id}`;
  const selectedType = types.find((t) => t.id === typeId);

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!typeId) newErrors.type = "Please select a type";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setSubmitting(true);
    try {
      const response = await api.post("/maintenances", {
        title,
        type_id: typeId,
        priority,
        description,
      });

      if (response?.message || response?.data || response?.id) {
        Alert.alert("Success", "Maintenance request submitted!");
        router.replace("/maintenance" as any);
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pMeta = PRIORITY_META[priority];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <Pressable hitSlop={10} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </Pressable>
        <Text style={styles.navTitle}>New Request</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormHeader
            title="Maintenance Request"
            subtitle="Report something that needs fixing"
            icon="hammer"
          />

          <View style={styles.card}>
            <Field
              label="Title"
              icon="text-outline"
              required
              maxLength={100}
              placeholder="e.g. Leaking kitchen tap"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            {/* Type selector */}
            <Text style={styles.label}>
              Type<Text style={{ color: "#ef4444" }}> *</Text>
            </Text>
            <Pressable
              style={[styles.selector, errors.type && styles.selectorError]}
              onPress={() => setTypeModal(true)}
            >
              <Ionicons name="construct-outline" size={20} color="#159df8" />
              <Text style={[styles.selectorText, !selectedType && styles.placeholder]}>
                {selectedType ? typeName(selectedType) : "Select a type"}
              </Text>
              {typesLoading ? (
                <ActivityIndicator size="small" color="#94a3b8" />
              ) : (
                <Ionicons name="chevron-down" size={20} color="#94a3b8" />
              )}
            </Pressable>
            {errors.type ? <Text style={styles.fieldError}>{errors.type}</Text> : null}

            <View style={{ height: 16 }} />

            {/* Priority selector */}
            <Text style={styles.label}>Priority</Text>
            <Pressable style={styles.selector} onPress={() => setPriorityModal(true)}>
              <View style={[styles.dot, { backgroundColor: pMeta.bg }]}>
                <Ionicons name={pMeta.icon} size={16} color={pMeta.color} />
              </View>
              <Text style={[styles.selectorText, { color: pMeta.color, fontWeight: "700" }]}>
                {priority.toUpperCase()}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#94a3b8" />
            </Pressable>

            <View style={{ height: 16 }} />

            <Field
              label="Description"
              icon="document-text-outline"
              multiline
              placeholder="Describe the problem (optional)"
              value={description}
              onChangeText={setDescription}
              containerStyle={{ marginBottom: 24 }}
            />

            <PrimaryButton
              label="Submit Request"
              icon="paper-plane"
              loading={submitting}
              onPress={handleSubmit}
            />

            <TouchableOpacity
              onPress={() => router.replace("/maintenance" as any)}
              style={styles.listBtn}
            >
              <Ionicons name="list" size={18} color="#159df8" />
              <Text style={styles.listBtnText}>View All Requests</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Type modal */}
      <Modal visible={typeModal} transparent animationType="fade" onRequestClose={() => setTypeModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setTypeModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Type</Text>
            {typesLoading ? (
              <ActivityIndicator color="#159df8" style={{ paddingVertical: 18 }} />
            ) : types.length === 0 ? (
              <TouchableOpacity onPress={fetchTypes} style={{ paddingVertical: 16 }}>
                <Text style={styles.noTypes}>
                  {typesError ?? "No types available"}
                </Text>
                <Text style={[styles.noTypes, { color: "#159df8", marginTop: 4 }]}>
                  Tap to retry
                </Text>
              </TouchableOpacity>
            ) : (
              <FlatList
                data={types}
                keyExtractor={(item) => String(item.id)}
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => {
                  const active = item.id === typeId;
                  return (
                    <TouchableOpacity
                      style={[styles.modalItem, active && styles.modalItemActive]}
                      onPress={() => {
                        setTypeId(item.id);
                        setErrors((e) => ({ ...e, type: undefined }));
                        setTypeModal(false);
                      }}
                    >
                      <View style={[styles.dot, { backgroundColor: "#e0f2fe" }]}>
                        <Ionicons name="construct" size={16} color="#159df8" />
                      </View>
                      <Text style={styles.modalItemText}>{typeName(item)}</Text>
                      {active && <Ionicons name="checkmark-circle" size={20} color="#159df8" />}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Priority modal */}
      <Modal visible={priorityModal} transparent animationType="fade" onRequestClose={() => setPriorityModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setPriorityModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Select Priority</Text>
            {PRIORITIES.map((p) => {
              const m = PRIORITY_META[p];
              const active = p === priority;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => {
                    setPriority(p);
                    setPriorityModal(false);
                  }}
                >
                  <View style={[styles.dot, { backgroundColor: m.bg }]}>
                    <Ionicons name={m.icon} size={16} color={m.color} />
                  </View>
                  <Text style={[styles.modalItemText, { color: m.color, fontWeight: "700" }]}>
                    {p.toUpperCase()}
                  </Text>
                  {active && <Ionicons name="checkmark-circle" size={20} color="#159df8" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
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
  scroll: { padding: 18, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 7,
    marginLeft: 2,
  },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 14,
    height: 54,
  },
  selectorError: { borderColor: "#f43f5e" },
  selectorText: { flex: 1, fontSize: 15, color: "#0f172a", fontWeight: "600" },
  placeholder: { color: "#94a3b8", fontWeight: "400" },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldError: { color: "#e11d48", fontSize: 13, marginTop: 6, marginLeft: 4 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modal: { backgroundColor: "#fff", borderRadius: 20, padding: 16 },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
    marginLeft: 4,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  modalItemActive: { backgroundColor: "#f0f9ff" },
  modalItemText: { flex: 1, fontSize: 15, fontWeight: "600", color: "#0f172a" },
  noTypes: { color: "#94a3b8", fontSize: 14, paddingVertical: 16, textAlign: "center" },

  listBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
  },
  listBtnText: { color: "#159df8", fontWeight: "700", fontSize: 15 },
});

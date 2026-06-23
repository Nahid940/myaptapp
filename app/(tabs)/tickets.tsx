import { useRouter } from "expo-router";
import React, { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { Field, PrimaryButton, FormHeader } from "@/components/ui/form";
import { useTheme } from "@/context/ThemeContext";

const PRIORITY_META: Record<string, { color: string; bg: string; icon: any }> = {
  high: { color: "#dc2626", bg: "#fee2e2", icon: "arrow-up-circle" },
  medium: { color: "#d97706", bg: "#fef3c7", icon: "remove-circle" },
  low: { color: "#16a34a", bg: "#dcfce7", icon: "arrow-down-circle" },
};

export default function TicketForm() {
  const { colors, isDark } = useTheme();
  const priorityOptions = ["high", "medium", "low"];

  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState(priorityOptions[0]);
  const [description, setDescription] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!subject || !description) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/tickets", { subject, priority, description });

      if (response?.message) {
        Alert.alert("Success", `Ticket Submitted! Thank You.`);
        setSubject("");
        setPriority(priorityOptions[0]);
        setDescription("");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const meta = PRIORITY_META[priority];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormHeader
            title="Submit a Ticket"
            subtitle="Tell us about your issue"
            icon="construct"
          />

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Field
              label="Subject"
              icon="pencil-outline"
              required
              placeholder="Enter subject"
              value={subject}
              onChangeText={setSubject}
            />

            {/* Priority */}
            <Text style={[styles.label, { color: colors.text }]}>
              Priority<Text style={{ color: "#ef4444" }}> *</Text>
            </Text>
            <Pressable
              style={[styles.priorityBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
              onPress={() => setDropdownVisible(true)}
            >
              <View style={[styles.priorityDot, { backgroundColor: meta.bg }]}>
                <Ionicons name={meta.icon} size={18} color={meta.color} />
              </View>
              <Text style={[styles.priorityText, { color: meta.color }]}>
                {priority.toUpperCase()}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.muted} />
            </Pressable>

            <Modal
              visible={dropdownVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setDropdownVisible(false)}
            >
              <Pressable
                style={styles.modalOverlay}
                onPress={() => setDropdownVisible(false)}
              >
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Select Priority</Text>
                  <FlatList
                    data={priorityOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => {
                      const m = PRIORITY_META[item];
                      const active = item === priority;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.modalItem,
                            active && { backgroundColor: isDark ? "rgba(58,169,240,0.15)" : "#f0f9ff" },
                          ]}
                          onPress={() => {
                            setPriority(item);
                            setDropdownVisible(false);
                          }}
                        >
                          <View style={[styles.priorityDot, { backgroundColor: m.bg }]}>
                            <Ionicons name={m.icon} size={18} color={m.color} />
                          </View>
                          <Text style={[styles.modalItemText, { color: m.color }]}>
                            {item.toUpperCase()}
                          </Text>
                          {active && (
                            <Ionicons name="checkmark-circle" size={20} color="#159df8" />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />
                </View>
              </Pressable>
            </Modal>

            <View style={{ height: 16 }} />

            <Field
              label="Description"
              icon="document-text-outline"
              required
              multiline
              placeholder="Describe your issue in detail"
              value={description}
              onChangeText={setDescription}
              containerStyle={{ marginBottom: 24 }}
            />

            <PrimaryButton
              label="Submit Ticket"
              icon="paper-plane"
              loading={loading}
              colors={["#07ce60", "#059c4a"]}
              onPress={handleSubmit}
            />

            <TouchableOpacity
              onPress={() => router.push("/ticketsList")}
              style={styles.listBtn}
            >
              <Ionicons name="list" size={18} color="#159df8" />
              <Text style={styles.listBtnText}>View My Tickets</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },
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
  priorityBtn: {
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
  priorityDot: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },
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
  modalItemActive: {
    backgroundColor: "#f0f9ff",
  },
  modalItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
  },
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
  listBtnText: {
    color: "#159df8",
    fontWeight: "700",
    fontSize: 15,
  },
});

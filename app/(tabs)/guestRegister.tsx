import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { Field, PrimaryButton, FormHeader } from "@/components/ui/form";
import { useTheme } from "@/context/ThemeContext";

const VISIT_TYPES = ["Personal Visit", "Delivery", "Service / Contractor", "Estate Agent"];
const ACCESS_METHODS = ["QR Code", "Guest Pass", "Manual Pass"];

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const VISIT_ICON: Record<string, IconName> = {
  "Personal Visit": "person",
  Delivery: "cube",
  "Service / Contractor": "construct",
  "Estate Agent": "business",
};

const ACCESS_ICON: Record<string, IconName> = {
  "QR Code": "qr-code",
  "Guest Pass": "card",
  "Manual Pass": "create",
};

export default function GuestVisitForm() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [idNo, setIdNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [visitType, setVisitType] = useState(VISIT_TYPES[0]);
  const [accessMethod, setAccessMethod] = useState(ACCESS_METHODS[0]);

  const [validFrom, setValidFrom] = useState(new Date());
  const [validTo, setValidTo] = useState(new Date());

  const [modal, setModal] = useState<null | "visit" | "access">(null);
  const [iosDate, setIosDate] = useState<null | "from" | "to">(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ first_name?: string; phone?: string }>({});

  const fmtDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const openDate = (which: "from" | "to") => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: which === "from" ? validFrom : validTo,
        mode: "date",
        onChange: (e, date) => {
          if (e.type !== "set" || !date) return;
          which === "from" ? setValidFrom(date) : setValidTo(date);
        },
      });
    } else {
      setIosDate(which);
    }
  };

  const handleSubmit = async () => {
    const e: typeof errors = {};
    if (!firstName.trim()) e.first_name = "First name is required";
    if (!phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const payload = {
        first_name: firstName.trim(),
        phone: phone.trim(),
        id_passport_no: idNo.trim(),
        visit_type: visitType,
        access_method: accessMethod,
        valid_from: fmtDate(validFrom),
        valid_to: fmtDate(validTo),
        remarks: remarks.trim(),
      };

      const res = await api.post("/guest-register", payload);

      if (res?.success || res?.data || res?.message) {
        Alert.alert("Success", res?.message || "Guest registered successfully!");
        setFirstName("");
        setPhone("");
        setIdNo("");
        setRemarks("");
        setVisitType(VISIT_TYPES[0]);
        setAccessMethod(ACCESS_METHODS[0]);
        setValidFrom(new Date());
        setValidTo(new Date());
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Selector = ({
    label,
    value,
    icon,
    onPress,
  }: {
    label: string;
    value: string;
    icon: IconName;
    onPress: () => void;
  }) => (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        style={[styles.selector, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
        onPress={onPress}
      >
        <Ionicons name={icon} size={18} color="#159df8" />
        <Text style={[styles.selectorText, { color: colors.text }]}>{value}</Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
    </View>
  );

  const DateBox = ({ label, date, which }: { label: string; date: Date; which: "from" | "to" }) => (
    <View style={{ flex: 1 }}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <Pressable
        onPress={() => openDate(which)}
        style={[styles.selector, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
      >
        <Ionicons name="calendar-outline" size={18} color="#159df8" />
        <Text style={[styles.selectorText, { color: colors.text }]}>{fmtDate(date)}</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FormHeader title="Register a Guest" subtitle="Add visitor details" icon="person-add" />

          {/* Visitor */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={styles.sectionLabel}>Visitor</Text>
            <Field
              label="Full Name"
              icon="person-outline"
              required
              placeholder="e.g. Jane Visitor"
              value={firstName}
              onChangeText={setFirstName}
              error={errors.first_name}
            />
            <Field
              label="Phone"
              icon="call-outline"
              required
              keyboardType="phone-pad"
              placeholder="+254700111222"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
            />
            <Field
              label="ID / Passport No."
              icon="card-outline"
              placeholder="12345678"
              value={idNo}
              onChangeText={setIdNo}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          {/* Visit details */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={styles.sectionLabel}>Visit Details</Text>

            <Selector
              label="Visit Type"
              value={visitType}
              icon={VISIT_ICON[visitType] ?? "person"}
              onPress={() => setModal("visit")}
            />

            <Selector
              label="Access Method"
              value={accessMethod}
              icon={ACCESS_ICON[accessMethod] ?? "qr-code"}
              onPress={() => setModal("access")}
            />

            <View style={styles.row}>
              <DateBox label="Valid From" date={validFrom} which="from" />
              <DateBox label="Valid To" date={validTo} which="to" />
            </View>

            {Platform.OS === "ios" && iosDate && (
              <DateTimePicker
                value={iosDate === "from" ? validFrom : validTo}
                mode="date"
                display="spinner"
                onChange={(e, d) => {
                  if (d) iosDate === "from" ? setValidFrom(d) : setValidTo(d);
                  setIosDate(null);
                }}
              />
            )}

            <Field
              label="Remarks"
              icon="chatbox-ellipses-outline"
              multiline
              placeholder="e.g. Allow parking"
              value={remarks}
              onChangeText={setRemarks}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          <PrimaryButton
            label="Register Guest"
            icon="checkmark"
            loading={loading}
            colors={["#07ce60", "#059c4a"]}
            onPress={handleSubmit}
          />

          <TouchableOpacity onPress={() => router.push("/guests")} style={styles.listBtn}>
            <Ionicons name="list" size={18} color="#159df8" />
            <Text style={styles.listBtnText}>View Guest List</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Dropdown modal */}
      <Modal visible={!!modal} transparent animationType="fade" onRequestClose={() => setModal(null)}>
        <Pressable style={styles.overlay} onPress={() => setModal(null)}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {modal === "visit" ? "Visit Type" : "Access Method"}
            </Text>
            {(modal === "visit" ? VISIT_TYPES : ACCESS_METHODS).map((opt) => {
              const active = modal === "visit" ? opt === visitType : opt === accessMethod;
              const icon = modal === "visit" ? VISIT_ICON[opt] : ACCESS_ICON[opt];
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.modalItem,
                    active && { backgroundColor: isDark ? "rgba(58,169,240,0.15)" : "#f0f9ff" },
                  ]}
                  onPress={() => {
                    if (modal === "visit") setVisitType(opt);
                    else setAccessMethod(opt);
                    setModal(null);
                  }}
                >
                  <View style={[styles.modalIcon, { backgroundColor: "#e0f2fe" }]}>
                    <Ionicons name={icon} size={17} color="#159df8" />
                  </View>
                  <Text style={[styles.modalItemText, { color: colors.text }]}>{opt}</Text>
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
  safe: { flex: 1 },
  scroll: { padding: 18, paddingBottom: 40 },
  card: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 14,
    elevation: 4,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  label: {
    fontSize: 13.5,
    fontWeight: "700",
    marginBottom: 7,
    marginLeft: 2,
  },
  row: { flexDirection: "row", gap: 12 },
  selector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 54,
  },
  selectorText: { flex: 1, fontSize: 14.5, fontWeight: "600" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  modal: { borderRadius: 20, padding: 16 },
  modalTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8, marginLeft: 4 },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  modalIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalItemText: { flex: 1, fontSize: 15, fontWeight: "600" },

  listBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#bae6fd",
    backgroundColor: "#f0f9ff",
  },
  listBtnText: { color: "#159df8", fontWeight: "700", fontSize: 15 },
});

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import React, { useState } from "react";

import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../../lib/api";
import { Field, PrimaryButton, FormHeader } from "@/components/ui/form";

export default function GuestVisitForm() {
  /* -------------------- FORM -------------------- */
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    apartment: "",
    unit: "",
    vehicle_number: "",
    id_number: "",
    visit_duration: "",
    purpose: "",
  });

  const router = useRouter();

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const [loading, setLoading] = useState(false);

  /* -------------------- ACCOMPANYING -------------------- */
  const [persons, setPersons] = useState<{ first_name: string; phone: string }[]>([
    { first_name: "", phone: "" },
  ]);

  const handleAccompanyingChange = (
    index: number,
    field: "first_name" | "phone",
    value: string
  ) => {
    const updated = [...persons];
    updated[index][field] = value;
    setPersons(updated);
  };

  const addAccompanying = () => {
    setPersons([...persons, { first_name: "", phone: "" }]);
  };

  const removeAccompanying = (index: number) => {
    const updated = [...persons];
    updated.splice(index, 1);
    setPersons(updated);
  };

  /* -------------------- DATES -------------------- */
  const [entryDate, setEntryDate] = useState(new Date());
  const [exitDate, setExitDate] = useState(new Date());

  const formatDateTime = (date: Date) => {
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };

  /* -------------------- ANDROID PICKER -------------------- */
  const openAndroidDateTime = (type: "entry" | "exit") => {
    DateTimePickerAndroid.open({
      value: type === "entry" ? entryDate : exitDate,
      mode: "date",
      onChange: (event, date) => {
        if (event.type !== "set" || !date) return;
        DateTimePickerAndroid.open({
          value: date,
          mode: "time",
          is24Hour: true,
          onChange: (e, time) => {
            if (e.type !== "set" || !time) return;
            const finalDate = new Date(date);
            finalDate.setHours(time.getHours());
            finalDate.setMinutes(time.getMinutes());
            type === "entry" ? setEntryDate(finalDate) : setExitDate(finalDate);
          },
        });
      },
    });
  };

  /* -------------------- iOS PICKER -------------------- */
  const [iosPicker, setIosPicker] = useState<"entry" | "exit" | null>(null);

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
    if (!form.first_name || !form.phone || !entryDate || !exitDate) {
      Alert.alert("Error", "Please fill all required fields (First Name, Phone, Entry & Exit).");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        entryDate: entryDate?.toISOString(),
        exitDate: exitDate?.toISOString(),
        persons: persons.filter((p) => p.first_name || p.phone),
      };

      const response = await api.post("/guest-register", payload);

      if (response?.data?.status === "success") {
        Alert.alert("Success", "Guest visit registered successfully!");
        setForm({
          first_name: "",
          last_name: "",
          phone: "",
          apartment: "",
          unit: "",
          vehicle_number: "",
          id_number: "",
          visit_duration: "",
          purpose: "",
        });
        setEntryDate(new Date());
        setExitDate(new Date());
        setPersons([{ first_name: "", phone: "" }]);
      } else {
        Alert.alert("Error", response?.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- DATE FIELD -------------------- */
  const DateField = ({
    label,
    date,
    type,
  }: {
    label: string;
    date: Date;
    type: "entry" | "exit";
  }) => (
    <View style={{ flex: 1 }}>
      <Text style={styles.label}>
        {label}
        <Text style={{ color: "#ef4444" }}> *</Text>
      </Text>
      <Pressable
        onPress={() =>
          Platform.OS === "android" ? openAndroidDateTime(type) : setIosPicker(type)
        }
        style={styles.dateField}
      >
        <Ionicons name="calendar-outline" size={18} color="#159df8" style={{ marginRight: 8 }} />
        <Text style={styles.dateText}>{formatDateTime(date)}</Text>
      </Pressable>
    </View>
  );

  /* -------------------- UI -------------------- */
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
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
            title="Register a Guest"
            subtitle="Add visitor details"
            icon="person-add"
          />

          {/* Guest details */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Guest Details</Text>
            <View style={styles.row}>
              <Field
                label="First Name"
                required
                containerStyle={{ flex: 1 }}
                value={form.first_name}
                onChangeText={(t) => handleChange("first_name", t)}
              />
              <Field
                label="Last Name"
                containerStyle={{ flex: 1 }}
                value={form.last_name}
                onChangeText={(t) => handleChange("last_name", t)}
              />
            </View>

            <Field
              label="Phone"
              icon="call-outline"
              required
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(t) => handleChange("phone", t)}
            />

            <View style={styles.row}>
              <DateField label="Entry Date & Time" date={entryDate} type="entry" />
              <DateField label="Exit Date & Time" date={exitDate} type="exit" />
            </View>

            {Platform.OS === "ios" && iosPicker && (
              <DateTimePicker
                value={iosPicker === "entry" ? entryDate : exitDate}
                mode="datetime"
                display="spinner"
                onChange={(e, d) => {
                  if (d) iosPicker === "entry" ? setEntryDate(d) : setExitDate(d);
                  setIosPicker(null);
                }}
              />
            )}
          </View>

          {/* Extra info */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Additional Info</Text>
            <View style={styles.row}>
              <Field
                label="Vehicle Number"
                icon="car-outline"
                containerStyle={{ flex: 1 }}
                value={form.vehicle_number}
                onChangeText={(t) => handleChange("vehicle_number", t)}
              />
              <Field
                label="ID Number"
                icon="card-outline"
                containerStyle={{ flex: 1 }}
                value={form.id_number}
                onChangeText={(t) => handleChange("id_number", t)}
              />
            </View>

            <Field
              label="Visit Duration"
              icon="time-outline"
              value={form.visit_duration}
              onChangeText={(t) => handleChange("visit_duration", t)}
            />

            <Field
              label="Purpose of Visit"
              icon="chatbox-ellipses-outline"
              multiline
              value={form.purpose}
              onChangeText={(t) => handleChange("purpose", t)}
              containerStyle={{ marginBottom: 0 }}
            />
          </View>

          {/* Accompanying */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Accompanying Persons</Text>
            {persons.map((p, i) => (
              <View key={i} style={styles.personRow}>
                <TextInput
                  style={styles.personInput}
                  placeholder="Name"
                  placeholderTextColor="#94a3b8"
                  value={p.first_name}
                  onChangeText={(t) => handleAccompanyingChange(i, "first_name", t)}
                />
                <TextInput
                  style={styles.personInput}
                  placeholder="Phone"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={p.phone}
                  onChangeText={(t) => handleAccompanyingChange(i, "phone", t)}
                />
                {i > 0 && (
                  <TouchableOpacity
                    onPress={() => removeAccompanying(i)}
                    style={styles.removeBtn}
                  >
                    <Ionicons name="close" size={18} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity onPress={addAccompanying} style={styles.addBtn}>
              <Ionicons name="add" size={18} color="#159df8" />
              <Text style={styles.addBtnText}>Add Person</Text>
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <PrimaryButton
            label="Save Guest"
            icon="checkmark"
            loading={loading}
            colors={["#07ce60", "#059c4a"]}
            onPress={handleSubmit}
          />

          <TouchableOpacity
            onPress={() => router.push("/guests")}
            style={styles.listBtn}
          >
            <Ionicons name="list" size={18} color="#159df8" />
            <Text style={styles.listBtnText}>View Guest List</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f1f5f9" },
  scroll: { padding: 18, paddingBottom: 40 },
  card: {
    backgroundColor: "#fff",
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
    color: "#475569",
    marginBottom: 7,
    marginLeft: 2,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 54,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 13.5,
    color: "#0f172a",
    fontWeight: "600",
    flex: 1,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  personInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 48,
    fontSize: 15,
    color: "#0f172a",
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#bae6fd",
    borderStyle: "dashed",
    backgroundColor: "#f0f9ff",
    marginTop: 4,
  },
  addBtnText: {
    color: "#159df8",
    fontWeight: "700",
    fontSize: 14,
  },
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
  listBtnText: {
    color: "#159df8",
    fontWeight: "700",
    fontSize: 15,
  },
});

import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";

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

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const [loading, setLoading] = useState(false); 

  /* -------------------- ACCOMPANYING -------------------- */
  const [persons, setPersons] = useState([{ first_name: "", phone: "" }]);

  const handleAccompanyingChange = (index: number, field: string, value: string) => {
    const updated = [...persons];
    updated[index][field] = value;
    setPersons(updated);
  };

  const addAccompanying = () => {
    setPersons([...persons, { name: "", phone: "" }]);
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
    const hours = date.getHours() % 12 || 12; // convert 0-23 → 1-12
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes} ${ampm}`;
  };

  /* -------------------- ANDROID PICKER (DATE + TIME) -------------------- */
  const openAndroidDateTime = (type: "entry" | "exit") => {
    // First pick DATE
    DateTimePickerAndroid.open({
      value: type === "entry" ? entryDate : exitDate,
      mode: "date",
      onChange: (event, date) => {
        if (event.type !== "set" || !date) return;

        // Then pick TIME
        DateTimePickerAndroid.open({
          value: date,
          mode: "time",
          is24Hour: true,
          onChange: (e, time) => {
            if (e.type !== "set" || !time) return;

            const finalDate = new Date(date);
            finalDate.setHours(time.getHours());
            finalDate.setMinutes(time.getMinutes());

            type === "entry"
              ? setEntryDate(finalDate)
              : setExitDate(finalDate);
          },
        });
      },
    });
  };

  /* -------------------- iOS PICKER -------------------- */
  const [iosPicker, setIosPicker] = useState<"entry" | "exit" | null>(null);

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = async () => {
  // 1️⃣ Validate required fields
  if (!form.first_name || !form.phone || !entryDate || !exitDate) {
    Alert.alert("Error", "Please fill all required fields (First Name, Phone, Entry & Exit).");
    return;
  }

  setLoading(true);

    try {

      const payload = {
        ...form,
        entryDate: entryDate ? entryDate.toISOString() : null,
        exitDate: exitDate ? exitDate.toISOString() : null,
        persons: persons.filter(p => p.name || p.phone),
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
        setPersons([{ name: "", phone: "" }]);
      } else {
        Alert.alert("Error", response?.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Process Error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  /* -------------------- UI -------------------- */
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.heading}>Add Guest Information</Text>

        {/* NAME */}
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={form.first_name}
              onChangeText={t => handleChange("first_name", t)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={form.last_name}
              onChangeText={t => handleChange("last_name", t)}
            />
          </View>
        </View>

        {/* PHONE */}
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone *</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={t => handleChange("phone", t)}
            />
          </View>
        </View>

        {/* ENTRY / EXIT */}
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Entry Date & Time *</Text>
            <Pressable
              onPress={() =>
                Platform.OS === "android"
                  ? openAndroidDateTime("entry")
                  : setIosPicker("entry")
              }
            >
              <TextInput style={styles.input} value={formatDateTime(entryDate)} editable={false} />
            </Pressable>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Exit Date & Time *</Text>
            <Pressable
              onPress={() =>
                Platform.OS === "android"
                  ? openAndroidDateTime("exit")
                  : setIosPicker("exit")
              }
            >
              <TextInput style={styles.input} value={formatDateTime(exitDate)} editable={false} />
            </Pressable>
          </View>
        </View>

        {/* iOS picker */}
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

        {/* VEHICLE / ID */}
        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vehicle Number</Text>
            <TextInput
              style={styles.input}
              value={form.vehicle_number}
              onChangeText={t => handleChange("vehicle_number", t)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>ID</Text>
            <TextInput
              style={styles.input}
              value={form.id_number}
              onChangeText={t => handleChange("id_number", t)}
            />
          </View>
        </View>

        {/* VISIT DURATION */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Visit Duration</Text>
          <TextInput
            style={styles.input}
            value={form.visit_duration}
            onChangeText={t => handleChange("visit_duration", t)}
          />
        </View>

        {/* PURPOSE */}
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.label}>Purpose of Visit</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            value={form.purpose}
            onChangeText={t => handleChange("purpose", t)}
          />
        </View>

        {/* ACCOMPANYING */}
        <Text style={styles.label}>Accompanying Persons</Text>
        {persons.map((p, i) => (
          <View key={i} style={styles.row}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Name"
              value={p.first_name}
              onChangeText={t => handleAccompanyingChange(i, "first_name", t)}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
              placeholder="Phone"
              value={p.phone}
              onChangeText={t => handleAccompanyingChange(i, "phone", t)}
            />
            {i > 0 && (
              <TouchableOpacity onPress={() => removeAccompanying(i)} style={styles.removeButton}>
                <Text style={{ color: "#fff" }}>X</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity onPress={addAccompanying} style={styles.addButton}>
          <Text style={{ color: "#fff" }}>Add More</Text>
        </TouchableOpacity>

        {/* SUBMIT */}
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={{ fontWeight: "bold" }}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f1f1", padding: 16 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  row: { flexDirection: "row", marginBottom: 12 },
  inputContainer: { flex: 1, marginRight: 8 },
  label: { fontWeight: "600", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  addButton: {
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    width: 100,
  },
  removeButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: "#FFD700",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
});

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Pressable, Platform  } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from '@react-native-community/datetimepicker';


export default function GuestVisitForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    apartment: "",
    unit: "",
    entryDate: "",
    exitDate: "",
    vehicleNumber: "",
    idNumber: "",
    visitDuration: "",
    purpose: "",
  });

  const [accompanying, setAccompanying] = useState([{ name: "", phone: "" }]);

  const handleChange = (field: string, value: string) => {
    // setForm({ ...form, [field]: value });
  };

  const handleAccompanyingChange = (index: number, field: string, value: string) => {
    const updated = [...accompanying];
    updated[index][field] = value;
    setAccompanying(updated);
  };

  const addAccompanying = () => {
    setAccompanying([...accompanying, { name: "", phone: "" }]);
  };

  const removeAccompanying = (index: number) => {
    const updated = [...accompanying];
    updated.splice(index, 1);
    setAccompanying(updated);
  };

  const handleSubmit = () => {
    console.log("Guest Visit Data:", form);
    console.log("Accompanying Persons:", accompanying);
    Alert.alert("Success", "Guest Visit Registered!");
  };


  const [entryDate, setEntryDate] = useState<Date | null>(null);
  const [exitDate, setExitDate] = useState<Date | null>(null);

  const [showEntryPicker, setShowEntryPicker] = useState(false);
  const [showExitPicker, setShowExitPicker] = useState(false);

  const formatDateTime = (date: Date) => {
    return date.toISOString().replace('T', ' ').substring(0, 16);
  };

   const handleEntryChange = (event: any, selectedDate?: Date) => {
    // Always hide the picker
    if (Platform.OS === "android") {
      setShowEntryPicker(false);
    }

    // Only update if user pressed OK
    if (event.type === "set" && selectedDate) {
      setEntryDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.heading}>Add Guest Information</Text>

        {/* Name */}
        <View style={styles.row}>
            <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
                style={styles.input}
                value={form.firstName}
                onChangeText={(text) => handleChange("firstName", text)}
            />
            </View>
            <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
                style={styles.input}
                value={form.lastName}
                onChangeText={(text) => handleChange("lastName", text)}
            />
            </View>
        </View>

        {/* Phone & Apartment */}
        <View style={styles.row}>
            <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone *</Text>
            <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => handleChange("phone", text)}
            />
            </View>
            
        </View>

        <View style={styles.row}>
  {/* Entry Date & Time */}
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Entry Date & Time *</Text>

    <Pressable onPress={() => setShowEntryPicker(true)}>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD HH:MM"
        value={entryDate ? formatDateTime(entryDate) : ''}
        editable={false}
      />
    </Pressable>

    {showEntryPicker && (
      <DateTimePicker
        value={entryDate || new Date()}
        mode="datetime"
        display="default"
        onChange={(event, selectedDate) => {
          setShowEntryPicker(false);
          if (event.type === 'set' && selectedDate) setEntryDate(selectedDate);
        }}
      />
    )}
  </View>

  {/* Exit Date & Time */}
  <View style={styles.inputContainer}>
    <Text style={styles.label}>Exit Date & Time *</Text>

    <Pressable onPress={() => setShowExitPicker(true)}>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD HH:MM"
        value={exitDate ? formatDateTime(exitDate) : ''}
        editable={false}
      />
    </Pressable>

    {showExitPicker && (
      <DateTimePicker
        value={exitDate || new Date()}
        mode="datetime"
        display="default"
        onChange={handleEntryChange}
      />
    )}
  </View>
</View>

        {/* Vehicle & ID */}
        <View style={styles.row}>
            <View style={styles.inputContainer}>
            <Text style={styles.label}>Vehicle Number</Text>
            <TextInput
                style={styles.input}
                value={form.vehicleNumber}
                onChangeText={(text) => handleChange("vehicleNumber", text)}
            />
            </View>
            <View style={styles.inputContainer}>
            <Text style={styles.label}>ID</Text>
            <TextInput
                style={styles.input}
                value={form.idNumber}
                onChangeText={(text) => handleChange("idNumber", text)}
            />
            </View>
        </View>

        {/* Visit Duration */}
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Visit Duration</Text>
            <TextInput
            style={styles.input}
            value={form.visitDuration}
            onChange={handleEntryChange}
            />
        </View>

        {/* Purpose */}
        <View style={{ marginBottom: 16 }}>
            <Text style={styles.label}>Purpose of Visit</Text>
            <TextInput
            style={[styles.input, { height: 80 }]}
            multiline
            value={form.purpose}
            onChangeText={(text) => handleChange("purpose", text)}
            />
        </View>

        {/* Accompanying Persons */}
        <Text style={[styles.label, { marginBottom: 8 }]}>Accompanying Persons</Text>
        {accompanying.map((person, index) => (
            <View key={index} style={styles.row}>
            <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Name"
                value={person.name}
                onChangeText={(text) => handleAccompanyingChange(index, "name", text)}
            />
            <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                placeholder="Phone"
                value={person.phone}
                onChangeText={(text) => handleAccompanyingChange(index, "phone", text)}
            />
            {index > 0 && (
                <TouchableOpacity
                onPress={() => removeAccompanying(index)}
                style={styles.removeButton}
                >
                <Text style={{ color: "#fff" }}>X</Text>
                </TouchableOpacity>
            )}
            </View>
        ))}
        <TouchableOpacity onPress={addAccompanying} style={styles.addButton}>
            <Text style={{ color: "#fff" }}>Add More</Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={{ color: "#000", fontWeight: "bold" }}>Save</Text>
        </TouchableOpacity>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  inputContainer: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#555",
  },
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
    width:80
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
    marginTop: 16,
  },
});

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";

export default function TicketForm() {
  const priorityOptions = ["high", "low", "medium"];

  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState(priorityOptions[0]);
  const [description, setDescription] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !description) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/tickets", {
        subject,
        priority,
        description
      }
    );

      // Check if the server responded with a message or success indicator
      if (response?.message) {
        Alert.alert("Success", `Ticket Submitted! Thank You.`);
        
        // Clear form fields
        setSubject("");
        setPriority(priorityOptions[0]); // Make sure priorityOptions exists
        setDescription("");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again");
      }
    } catch (error) {
      console.error("Process Error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
        <Text style={styles.heading}>Submit a Ticket</Text>

        {/* Subject */}
        <Text style={styles.label}>Subject *</Text>
        <TextInput
            style={styles.input}
            placeholder="Enter subject"
            value={subject}
            onChangeText={setSubject}
        />

        {/* Priority Dropdown */}
        <Text style={styles.label}>Priority *</Text>
        <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownVisible(true)}
        >
            <Text>{priority}</Text>
        </TouchableOpacity>

        <Modal
            visible={dropdownVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setDropdownVisible(false)}
        >
            <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setDropdownVisible(false)}
            />
            <View style={styles.modalContent}>
            <FlatList
                data={priorityOptions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                    setPriority(item);
                    setDropdownVisible(false);
                    }}
                >
                    <Text>{item.toUpperCase()}</Text>
                </TouchableOpacity>
                )}
            />
            </View>
        </Modal>

        {/* Description */}
        <Text style={styles.label}>Description *</Text>
        <TextInput
            style={[styles.input, { height: 100 }]}
            multiline
            placeholder="Describe your issue"
            value={description}
            onChangeText={setDescription}
        />

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={{ fontWeight: "bold", color: "#000" }}>Submit Ticket</Text>
        </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f1f1f1" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 24, color: "#333" },
  label: { fontWeight: "600", marginBottom: 6, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: "#FFD700",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  modalContent: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
  },
  modalItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#eee" },
});

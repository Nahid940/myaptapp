import React from "react";
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const contacts = [
  { role: "IT", name: "John Doe", phone: "+880123456789" },
  { role: "Accounts", name: "John Doe", phone: "+880123456789" },
  { role: "Manager", name: "John Doe", phone: "+880123456789" },
  { role: "Care Taker", name: "Jane Smith", phone: "+880987654321" },
  { role: "Fire Service", name: "Fire Dept", phone: "199" },
  { role: "Electricity Technician", name: "Electric Co.", phone: "+8801122334455" },
];

export default function HelpPage() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.pageTitle}>Help & Contacts</Text>

        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, styles.headerText, { flex: 2 }]}>Service</Text>
          <Text style={[styles.cell, styles.headerText, { flex: 3 }]}>Name</Text>
          <Text style={[styles.cell, styles.headerText, { flex: 2 }]}>Phone</Text>
        </View>

        {/* Table Rows */}
        {contacts.map((contact, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
            onPress={() => Linking.openURL(`tel:${contact.phone}`)}
          >
            <Text style={[styles.cell, { flex: 2 }]}>{contact.role}</Text>
            <Text style={[styles.cell, { flex: 3 }]}>{contact.name}</Text>
            <Text style={[styles.cell, { flex: 2, color: '#1E88E5', textDecorationLine: 'underline' }]}>{contact.phone}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f1f1f1",
  },

  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  tableHeader: {
    backgroundColor: "#1976D2",
    borderRadius: 8,
  },

  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  cell: {
    fontSize: 16,
    paddingHorizontal: 8,
  },

  rowEven: {
    backgroundColor: "#ffffff",
  },

  rowOdd: {
    backgroundColor: "#e8f0fe",
  },
});

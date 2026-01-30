import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const tickets = [
  { id: 1, subject: "Login Issue", priority: "High", description: "Cannot login to app", status: "sloved" },
  { id: 2, subject: "Payment Failed", priority: "Medium", description: "Card payment failed", status: "pending" },
  { id: 3, subject: "UI Bug", priority: "Low", description: "Button alignment issue", status: "pensing" },
];

export default function TicketsList() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
        {/* Table Header */}
        <Text style={styles.heading}>My Tickets</Text>
        <View style={[styles.row, styles.header]}>
            <Text style={[styles.cell, styles.headerText]}>Subject</Text>
            <Text style={[styles.cell, styles.headerText]}>Priority</Text>
            <Text style={[styles.cell, styles.headerText]}>Description</Text>
            <Text style={[styles.cell, styles.headerText]}>Status</Text>
            <Text style={[styles.cell, styles.headerText]}>Action</Text>
        </View>

        {/* Table Rows */}
        {tickets.map((item) => (
            <View key={item.id} style={styles.row}>
            <Text style={styles.cell}>{item.subject}</Text>
            <Text style={[styles.cell, styles[item.priority.toLowerCase()]]}>
                {item.priority}
            </Text>
            <Text style={styles.cell}>{item.description}</Text>
            <Text style={styles.cell}>{item.status}</Text>
            <Text style={styles.cell}>-</Text>
            </View>
        ))}
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#df1447",
  },
  container: {
    padding: 10,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
  },
  header: {
    backgroundColor: "#f5f5f5",
  },
  cell: {
    flex: 1,
    fontSize: 14,
  },
  headerText: {
    fontWeight: "bold",
  },
  high: {
    color: "red",
    fontWeight: "bold",
  },
  medium: {
    color: "orange",
    fontWeight: "bold",
  },
  low: {
    color: "green",
    fontWeight: "bold",
  },
});
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function StatusCell({ status }: { status: string }) {
  // Determine icon & color based on status
  let iconName: React.ComponentProps<typeof Ionicons>["name"], color;

  switch (status.toLowerCase()) {
    case "paid":
      iconName = "checkmark-circle"; // filled checkmark
      color = "#4CAF50"; // green
      break;
    case "pending":
      iconName = "time-outline"; // clock
      color = "#da5306"; // yellow
      break;
    case "partial":
      iconName = "alert-circle"; // warning
      color = "#a6ff00"; // orange
      break;
    default:
      iconName = "help-circle";
      color = "#999";
  }

  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Ionicons name={iconName} size={12} color={color} style={styles.icon} />
      <Text style={[styles.text, { color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  icon: {
    marginRight: 5,
  },
  text: {
    fontWeight: "bold",
    fontSize: 10,
  },
});

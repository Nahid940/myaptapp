import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "@/lib/api";

export default function AlertsList() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts from API
  const fetchAlerts = async () => {
    try {
      const res = await api.get("/alerts");
      setAlerts(res.data); // assumes API returns array of alerts
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Function to get color based on alert type
  const getCardStyle = (type: string) => {
    switch (type) {
      case "emergency":
        return { borderLeftColor: "red" };
      case "info":
        return { borderLeftColor: "blue" };
      case "maintenance":
        return { borderLeftColor: "orange" };
      default:
        return { borderLeftColor: "#ccc" };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#df1447" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>Alerts</Text>

        {alerts.map((alert) => (
          <View key={alert.id} style={[styles.card, getCardStyle(alert.type)]}>
            <Text style={styles.title}>{alert.title}</Text>
            <Text style={styles.title}>{alert.created_at}</Text>
            <Text style={styles.message}>{alert.message}</Text>
            <Text style={[styles.type, { color: getCardStyle(alert.type).borderLeftColor }]}>
              {alert.type.toUpperCase()}
            </Text>
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
    marginLeft: 10,
    color: "#df1447",
  },
  container: {
    padding: 10,
    backgroundColor: "#f9f9f9",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 12,
    borderRadius: 8,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  message: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  type: {
    fontSize: 12,
    fontWeight: "bold",
    alignSelf: "flex-end",
  },
});

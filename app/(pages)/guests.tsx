import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { api } from "../../lib/api";
export default function VisitorListScreen() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVisitors(page);
  }, [page]);

  const fetchVisitors = async (page) => {
    setLoading(true);

    try {
    const response = await api.get(`/visits?page=${page}`);
        setData(response.data);
        //setLastPage(response.data.last_page);
        //setLastPage(response.pagination.last_page);
    } catch (err) {
        console.error("Error fetching tickets:", err);
    } finally {
        setLoading(false);
    }

    
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {item.first_name} {item.last_name}
      </Text>

      <View style={styles.row}><Text style={styles.label}>Phone</Text><Text style={styles.value}>{item.phone}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Apartment / Unit</Text><Text style={styles.value}>{item.apartment} - {item.unit}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Vehicle No</Text><Text style={styles.value}>{item.vehicle_number}</Text></View>
      <View style={styles.row}><Text style={styles.label}>ID Number</Text><Text style={styles.value}>{item.id_number}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Visit Duration</Text><Text style={styles.value}>{item.visit_duration}</Text></View>
      <View style={styles.row}><Text style={styles.label}>Purpose</Text><Text style={styles.value}>{item.purpose}</Text></View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
        <Text style={styles.header}>Visitor Records</Text>

        {loading ? (
            <ActivityIndicator size="large" color="#2563EB" />
        ) : (
            <FlatList
            data={data}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 90 }}
            ListEmptyComponent={
                <Text style={styles.emptyText}>No visitor records found</Text>
            }
            />
        )}

        {/* Pagination */}
        <View style={styles.pagination}>
            <TouchableOpacity
            style={[styles.pageBtn, page === 1 && styles.disabled]}
            disabled={page === 1}
            onPress={() => setPage(page - 1)}
            >
            <Text style={styles.pageText}>Previous</Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
            Page {page} of {lastPage}
            </Text>

            <TouchableOpacity
            style={[styles.pageBtn, page === lastPage && styles.disabled]}
            disabled={page === lastPage}
            onPress={() => setPage(page + 1)}
            >
            <Text style={styles.pageText}>Next</Text>
            </TouchableOpacity>
        </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  value: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    textAlign: "right",
    maxWidth: "60%",
  },
  pagination: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  pageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#2563EB",
    borderRadius: 6,
  },
  pageText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  pageInfo: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  disabled: {
    backgroundColor: "#9CA3AF",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6B7280",
    fontSize: 14,
  },
});


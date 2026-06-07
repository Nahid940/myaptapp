import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Button, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../../lib/api";


export default function TicketsList() {

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

    const fetchTickets = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`/tickets?page=${pageNumber}`);
      setTickets(response.tickets);
      setPage(response.pagination.current_page);
      setLastPage(response.pagination.last_page);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);


  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'open':
        return { color: '#f1065f', textAlign: 'center' as const };
      case 'solved':
        return { color: '#61f186', textAlign: 'center' as const };
      default:
        return { color: '#555' };
    }
  };


  return (

     <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.heading}>My Tickets</Text>

        {/* Table Header */}
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, styles.headerText]}>Subject</Text>
          <Text style={[styles.cell, styles.headerText]}>Description</Text>
          <Text style={[styles.cell, styles.headerText]}>Priority</Text>
          <Text style={[styles.cell, styles.headerText]}>Status</Text>
          <Text style={[styles.cell, styles.headerText]}>Date</Text>
          <Text style={[styles.cell, styles.headerText]}>Action</Text>
        </View>

        {/* Loading */}
        {loading && <ActivityIndicator size="large" color="#df1447" />}

        {/* Table Rows */}
        {tickets.map((item: any) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.cell}>{item.subject}</Text>
            <Text style={styles.cell}>{item.description}</Text>
            <Text style={[styles.cell, styles[item.priority.toLowerCase() as keyof typeof styles]]}>
              {item.priority.toUpperCase()}
            </Text>
            <Text style={[styles.cell, getStatusStyle(item.status)]}>{item.status.toUpperCase()}</Text>

            <Text style={styles.cell}>{item.created_at}</Text>
            <Text style={styles.cell}></Text>
          </View>
        ))}

        <View style={styles.pagination}>
            <TouchableOpacity
            style={[styles.pageBtn, page === 1 && styles.disabled]}
            disabled={page === 1}
            onPress={() => fetchTickets(page - 1)}
            >
            <Text style={styles.pageText}>Previous</Text>
            </TouchableOpacity>

            <Text style={styles.pageInfo}>
            Page {page} of {lastPage}
            </Text>

            <TouchableOpacity
            style={[styles.pageBtn, page === lastPage && styles.disabled]}
            disabled={page === lastPage}
            onPress={() => fetchTickets(page + 1)}
            >
            <Text style={styles.pageText}>Next</Text>
            </TouchableOpacity>
        </View>


      </View>
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
    flex: 1,
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
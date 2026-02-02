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


  return (

     <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>My Tickets</Text>

        {/* Table Header */}
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, styles.headerText]}>Subject</Text>
          <Text style={[styles.cell, styles.headerText]}>Priority</Text>
          <Text style={[styles.cell, styles.headerText]}>Description</Text>
          <Text style={[styles.cell, styles.headerText]}>Status</Text>
          <Text style={[styles.cell, styles.headerText]}>Action</Text>
        </View>

        {/* Loading */}
        {loading && <ActivityIndicator size="large" color="#df1447" />}

        {/* Table Rows */}
        {tickets.map((item: any) => (
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

        {/* Pagination */}
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageButton, page <= 1 && styles.disabledButton]}
            disabled={page <= 1}
            onPress={() => fetchTickets(page - 1)}
          >
            <Text style={styles.pageButtonText}>Prev</Text>
          </TouchableOpacity>

          <Text style={styles.pageInfo}>Page {page} / {lastPage}</Text>

          <TouchableOpacity
            style={[styles.pageButton, page >= lastPage && styles.disabledButton]}
            disabled={page >= lastPage}
            onPress={() => fetchTickets(page + 1)}
          >
            <Text style={styles.pageButtonText}>Next</Text>
          </TouchableOpacity>
        </View>


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

  pagination: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 20,
  paddingHorizontal: 20,
},

pageButton: {
  backgroundColor: "#df1447",
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
},

disabledButton: {
  backgroundColor: "#ccc",
},

pageButtonText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 16,
},

pageInfo: {
  fontSize: 16,
  fontWeight: "600",
  color: "#333",
},
});
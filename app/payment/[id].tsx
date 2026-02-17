import React,{ useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
// Built-in Expo Icons
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams  } from "expo-router";
import { api } from '@/lib/api';
export default function PaymentDetails() {
  const router = useRouter();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const params = useLocalSearchParams<{ id: string }>();
  const paymentId = params.id;

  const fetchPayment = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/payments/${paymentId}`);
      setPayment(response.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    fetchPayment()
  }, [])


  if (!payment) {
      return (
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" />
          </View>
        </SafeAreaView>
      );
    }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.navbar}>
        <TouchableOpacity>
          <Ionicons name="arrow-back" size={24} color="#1e293b" onPress = {() => router.push('/payments')} />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Payment Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Success Header */}
        <View style={styles.statusContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={50} color="#10b981" />
          </View>
          <Text style={styles.statusText}>Payment Success!</Text>
          <Text style={styles.amountText}>{payment.amount}</Text>
        </View>

        {/* Transaction Info Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Transaction Details</Text>
          <DetailRow label="Payment Month" value={payment.payment_month} />
          <DetailRow label="Payment Year" value={payment.payment_year} />
          <DetailRow label="Payment Date" value={payment.created_at_details} />
          <DetailRow label="Reference" value={payment.reference} />
          <DetailRow label="Payment Method" value={payment.payment_method} isCard />
          <DetailRow label="Remarks" value={payment.remarks} />
          
          <View style={styles.divider} />
          
          <DetailRow label="Subtotal" value={payment.amount} />
          <DetailRow label="Total Amount" value={payment.amount} isBold />
        </View>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.downloadButton}>
            <MaterialCommunityIcons name="file-download-outline" size={20} color="#2563eb" />
            <Text style={styles.downloadText}>Download PDF Receipt</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value, isBold, isCard }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {isCard && <Ionicons name="card-outline" size={16} color="#64748b" style={{marginRight: 6}} />}
      <Text style={[styles.rowValue, isBold && styles.boldValue]}>
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#cfeff7' },
  navbar: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  navTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  content: { padding: 20 },
  statusContainer: { alignItems: 'center', marginVertical: 30 },
  iconCircle: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    backgroundColor: '#f0fdf4', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20
  },
  statusText: { fontSize: 20, fontWeight: '700', color: '#10b981', marginBottom: 5 },
  amountText: { fontSize: 40, fontWeight: '800', color: '#1e293b' },
  dateText: { fontSize: 14, color: '#94a3b8' },
  detailsCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    // Minimal shadow for clean look
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2 
  },
  cardHeader: { fontSize: 14, fontWeight: '800', color: '#1e293b', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  rowLabel: { fontSize: 15, color: '#64748b' },
  rowValue: { fontSize: 15, fontWeight: '500', color: '#334155' },
  boldValue: { fontWeight: '800', color: '#1e293b', fontSize: 16 },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  footer: { marginTop: 40, alignItems: 'center' },
  downloadButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#dbeafe',
    backgroundColor: '#eff6ff'
  },
  downloadText: { color: '#2563eb', fontWeight: '700', fontSize: 15 },
  supportText: { marginTop: 20, color: '#94a3b8', fontSize: 13 },
  linkText: { color: '#2563eb', fontWeight: '600' }
});
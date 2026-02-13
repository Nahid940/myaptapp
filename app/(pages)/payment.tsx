import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Share } from 'react-native';
// Built-in Expo Icons
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from "expo-router";

export default function PaymentDetails() {
  
  const onShare = async () => {
    try {
      await Share.share({
        message: 'Payment Successful: $30.50 for Pro Subscription. Ref: #TRX-99281',
      });
    } catch (error) {
      //console.log(error.message);
    }
  };
  const router = useRouter();
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
          <Text style={styles.amountText}>300.50</Text>
          <Text style={styles.dateText}>Feb 13, 2026 • 08:09 PM</Text>
        </View>

        {/* Transaction Info Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardHeader}>Transaction Details</Text>
          
          <DetailRow label="Reference ID" value="#TRX-99281" />
          <DetailRow label="Payment Method" value="•••• 4242" isCard />
          <DetailRow label="Billing Name" value="Alex Johnson" />
          
          <View style={styles.divider} />
          
          <DetailRow label="Subtotal" value="$29.00" />
          <DetailRow label="Tax (5%)" value="$1.50" />
          <DetailRow label="Total Amount" value="$30.50" isBold />
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
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, TextInput } from 'react-native';
import Colors from '../../constants/Colors';
import { useMockData } from '../../context/MockDataContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettlementsScreen() {
  const { rentals, settlements, commissionConfig, makeSettlement } = useMockData();

  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'history'

  const completedRentals = rentals.filter(r => r.status === 'Completed' || r.status === 'Active' || r.status === 'Delivered');

  const unsettledRentals = useMemo(() => {
    return completedRentals.filter(r => r.settlementStatus !== 'Settled');
  }, [completedRentals]);

  const settledRentals = useMemo(() => {
    return completedRentals.filter(r => r.settlementStatus === 'Settled');
  }, [completedRentals]);

  const pendingCommissionAmount = unsettledRentals.reduce((sum, r) => {
    return sum + Math.round((r.agreedRentalAmount || r.totalAmount || 0) * (commissionConfig.commissionRate / 100));
  }, 0);

  const totalPaidCommission = settlements.reduce((sum, s) => sum + s.totalCommissionAmount, 0);

  const handlePayCommission = () => {
    if (unsettledRentals.length === 0) {
      if (Platform.OS === 'web') window.alert("No pending commission to pay.");
      else Alert.alert("Info", "No pending commission to pay.");
      return;
    }

    const confirmMsg = `Pay MediUnify commission of ₹${pendingCommissionAmount} for ${unsettledRentals.length} rentals?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        makeSettlement(unsettledRentals, pendingCommissionAmount);
        window.alert("Payment successful!");
      }
    } else {
      Alert.alert("Pay Commission", confirmMsg, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay Now", onPress: () => {
            makeSettlement(unsettledRentals, pendingCommissionAmount);
            Alert.alert("Success", "Payment successful!");
          }
        }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.unifiedCard}>
        <View style={styles.header}>
        <View>
          <Text style={styles.title}>Payments & Settlements</Text>
          <Text style={styles.subtitle}>Track and pay your commission to MediUnify.</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Current Commission Rate</Text>
          <Text style={styles.summaryNumber}>{commissionConfig.commissionRate}%</Text>
          <Text style={styles.summaryHelp}>On total rental amount</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pending Commission</Text>
          <Text style={[styles.summaryNumber, { color: Colors.danger }]}>₹{pendingCommissionAmount}</Text>
          <Text style={styles.summaryHelp}>{unsettledRentals.length} Unsettled Rentals</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Paid to MediUnify</Text>
          <Text style={[styles.summaryNumber, { color: Colors.success }]}>₹{totalPaidCommission}</Text>
          <Text style={styles.summaryHelp}>{settlements.length} Successful Payments</Text>
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <Pressable 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]} 
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Pending Payments</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'history' && styles.activeTab]} 
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>Payment History</Text>
        </Pressable>
      </View>

      {activeTab === 'pending' && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Unsettled Rentals</Text>
            {unsettledRentals.length > 0 && (
              <Pressable style={styles.primaryButton} onPress={handlePayCommission}>
                <Text style={styles.primaryButtonText}>Pay ₹{pendingCommissionAmount}</Text>
              </Pressable>
            )}
          </View>
          
          {unsettledRentals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color={Colors.success} />
              <Text style={styles.emptyTitle}>You're all caught up!</Text>
              <Text style={styles.emptyDesc}>There are no pending commissions to pay at this time.</Text>
            </View>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 1 }]}>RENTAL ID</Text>
                <Text style={[styles.th, { flex: 2 }]}>EQUIPMENT</Text>
                <Text style={[styles.th, { flex: 1 }]}>RENTAL AMOUNT</Text>
                <Text style={[styles.th, { flex: 1 }]}>COMMISSION</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
              </View>
              {unsettledRentals.map((rental, index) => {
                const amount = rental.agreedRentalAmount || rental.totalAmount || 0;
                const comm = Math.round(amount * (commissionConfig.commissionRate / 100));
                return (
                  <View key={rental.rentalId || rental.id} style={[styles.tableRow, index === unsettledRentals.length - 1 && { borderBottomWidth: 0 }]}>
                    <Text style={[styles.td, { flex: 1, fontWeight: 'bold' }]}>{rental.rentalId || rental.id}</Text>
                    <Text style={[styles.td, { flex: 2 }]} numberOfLines={1}>{rental.equipmentName}</Text>
                    <Text style={[styles.td, { flex: 1 }]}>₹{amount}</Text>
                    <Text style={[styles.td, { flex: 1, color: Colors.danger, fontWeight: 'bold' }]}>₹{comm}</Text>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[styles.badgeText, { color: '#DC2626' }]}>Unpaid</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {activeTab === 'history' && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment History</Text>
          
          {settlements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={Colors.textLight} />
              <Text style={styles.emptyTitle}>No Payment History</Text>
              <Text style={styles.emptyDesc}>Your successful commission payments will appear here.</Text>
            </View>
          ) : (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 1.5 }]}>TRANSACTION ID</Text>
                <Text style={[styles.th, { flex: 1 }]}>DATE</Text>
                <Text style={[styles.th, { flex: 1 }]}>RENTALS COUNT</Text>
                <Text style={[styles.th, { flex: 1 }]}>AMOUNT PAID</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
              </View>
              {settlements.map((settle, index) => (
                <View key={settle.settlementId} style={[styles.tableRow, index === settlements.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={{ flex: 1.5 }}>
                    <Text style={[styles.td, { fontWeight: 'bold' }]}>{settle.transactionId}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textLight }}>{settle.settlementId}</Text>
                  </View>
                  <Text style={[styles.td, { flex: 1 }]}>{new Date(settle.paidAt).toLocaleDateString()}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>{settle.rentalIds?.length || 0} Rentals</Text>
                  <Text style={[styles.td, { flex: 1, fontWeight: 'bold', color: Colors.success }]}>₹{settle.totalCommissionAmount}</Text>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={[styles.badge, { backgroundColor: '#D1FAE5' }]}>
                      <Text style={[styles.badgeText, { color: '#059669' }]}>Successful</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  unifiedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
    marginBottom: 24,
    overflow: 'hidden'
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 14, color: Colors.textLight, marginTop: 4 },
  
  summaryGrid: { flexDirection: 'row', gap: 16, marginBottom: 24, flexWrap: 'wrap' },
  summaryCard: { 
    flex: 1, 
    minWidth: 200,
    backgroundColor: '#ffffff', 
    padding: 20, 
    borderRadius: 16, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
  },
  summaryLabel: { fontSize: 13, color: Colors.textLight, fontWeight: '600', marginBottom: 8 },
  summaryNumber: { fontSize: 28, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  summaryHelp: { fontSize: 12, color: Colors.textLight },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', marginBottom: 24 },
  tab: { paddingVertical: 12, paddingHorizontal: 24, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: Colors.textLight },
  activeTabText: { color: Colors.primary },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  
  primaryButton: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  table: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  th: { fontSize: 12, fontWeight: 'bold', color: Colors.textLight, textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  td: { fontSize: 14, color: Colors.text },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },

  emptyState: { padding: 48, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text, marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: Colors.textLight, textAlign: 'center' },
});

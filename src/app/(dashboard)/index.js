import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useMockData } from '../../context/MockDataContext';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { equipment, stats: mockStats, activity, requests, vendorProfile } = useMockData();

  const handleAddEquipment = () => {
    router.push('/(dashboard)/equipment?action=add');
  };

  const isNewVendor = equipment.length === 0;

  if (isNewVendor) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to MediUnify, Global Medical Supplies</Text>
          <Text style={styles.welcomeSubtitle}>Let's get your store ready to receive rental requests.</Text>
        </View>

        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>Setup Progress</Text>
          <View style={styles.setupSteps}>
            <View style={styles.step}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.stepTextCompleted}>Account Created</Text>
            </View>
            <View style={styles.step}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.stepTextCompleted}>Vendor Approved</Text>
            </View>
            <View style={styles.step}>
              <Ionicons name="radio-button-off" size={20} color={Colors.primary} />
              <Text style={styles.stepTextPending}>Add Equipment</Text>
            </View>
            <View style={styles.step}>
              <Ionicons name="radio-button-off" size={20} color={Colors.textLight} />
              <Text style={styles.stepTextFuture}>Complete Catalogue</Text>
            </View>
          </View>
        </View>

        <View style={styles.emptyStateCard}>
          <Ionicons name="cube-outline" size={48} color={Colors.primary} style={{ opacity: 0.8 }} />
          <Text style={styles.emptyTitle}>You haven't added any equipment yet</Text>
          <Text style={styles.emptyDesc}>Add your first equipment to make it available for rental requests.</Text>
          <Pressable style={styles.primaryButton} onPress={handleAddEquipment}>
            <Text style={styles.primaryButtonText}>+ Add Equipment</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Welcome back, {vendorProfile?.businessName || 'Vendor'}</Text>
          <Text style={styles.bannerSubtitle}>Here's what's happening with your rentals today.</Text>
        </View>
        <View style={styles.bannerIllustration}>
          <Ionicons name="medkit" size={60} color="rgba(255, 255, 255, 0.15)" style={{ transform: [{ rotate: '15deg' }] }} />
        </View>
      </View>
      
      {/* Stats Cards */}
      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Equipment</Text>
          <Text style={[styles.statValue, { color: '#0F4C75' }]}>{mockStats.totalEquipment}</Text>
          <Pressable onPress={() => router.push('/equipment')}><Text style={[styles.statLink, { color: '#0F4C75' }]}>View Equipment</Text></Pressable>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Available Stock</Text>
          <Text style={[styles.statValue, { color: '#4AD6A1' }]}>{mockStats.availableNow}</Text>
          <Pressable onPress={() => router.push('/inventory')}><Text style={[styles.statLink, { color: '#4AD6A1' }]}>View Inventory</Text></Pressable>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Active Rentals</Text>
          <Text style={[styles.statValue, { color: '#3282B8' }]}>{mockStats.currentlyRented}</Text>
          <Pressable onPress={() => router.push('/rentals')}><Text style={[styles.statLink, { color: '#3282B8' }]}>View Rentals</Text></Pressable>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Pending Requests</Text>
          <Text style={[styles.statValue, { color: '#F59E0B' }]}>{mockStats.pendingRequests}</Text>
          <Pressable onPress={() => router.push('/requests')}><Text style={[styles.statLink, { color: '#0F4C75' }]}>View Requests</Text></Pressable>
        </View>
      </View>

      {/* Recent Rental Requests */}
      <View style={styles.mainCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Recent Rental Requests</Text>
          <Pressable onPress={() => router.push('/requests')}>
            <Text style={styles.viewAllLink}>View All →</Text>
          </Pressable>
        </View>
        
        {requests.length === 0 ? (
          <View style={styles.emptyListState}>
            <Text style={styles.emptyListTitle}>No rental requests yet.</Text>
            <Text style={styles.emptyListDesc}>New rental requests will appear here when customers request your equipment.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1 }]}>REQUEST ID</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>EQUIPMENT</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>CUSTOMER</Text>
              <Text style={[styles.th, { flex: 1 }]}>DATE</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
            </View>
            {requests.slice(0, 3).map((req, index) => (
              <View key={req.id} style={[styles.tableRow, index === Math.min(requests.length, 3) - 1 && { borderBottomWidth: 0 }]}>
                <Text style={[styles.td, { flex: 1, color: '#64748B' }]}>{req.id}</Text>
                <Text style={[styles.td, { flex: 1.5 }]} numberOfLines={1}>{req.equipmentName}</Text>
                <Text style={[styles.td, { flex: 1.5 }]} numberOfLines={1}>{req.customerName}</Text>
                <Text style={[styles.td, { flex: 1 }]}>{new Date(req.createdAt).toLocaleDateString()}</Text>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <View style={[styles.statusBadge, 
                    req.status === 'New Request' ? { backgroundColor: '#FEF3C7' } :
                    req.status === 'Accepted' ? { backgroundColor: '#D1FAE5' } :
                    req.status === 'Rejected' ? { backgroundColor: '#FEE2E2' } :
                    { backgroundColor: '#F1F5F9' }
                  ]}>
                    <Text style={[styles.statusBadgeText,
                      req.status === 'New Request' ? { color: '#D97706' } :
                      req.status === 'Accepted' ? { color: '#059669' } :
                      req.status === 'Rejected' ? { color: '#DC2626' } :
                      { color: '#475569' }
                    ]}>
                      {req.status === 'New Request' ? 'Pending' : req.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>


    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  welcomeSection: { marginBottom: 24 },
  welcomeTitle: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 14, color: '#64748B' },
  
  setupCard: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  setupTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  setupSteps: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepTextCompleted: { fontSize: 13, fontWeight: '600', color: Colors.success },
  stepTextPending: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  stepTextFuture: { fontSize: 13, fontWeight: '500', color: Colors.textLight },
  
  emptyStateCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16, marginBottom: 8 },
  emptyDesc: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 24, maxWidth: 300 },
  primaryButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.primary, marginBottom: 16 },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 24 },
  statCard: { 
    flex: 1, 
    minWidth: 140, 
    backgroundColor: '#fff', 
    padding: 14, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#F8FAFC', 
    boxShadow: '0 4px 8px -2px rgba(0, 0, 0, 0.05)' 
  },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  statLink: { fontSize: 11, fontWeight: '700' },
  bannerContainer: {
    height: 96,
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundImage: 'linear-gradient(135deg, #0F4C75 0%, #4AD6A1 100%)',
    boxShadow: '0 8px 15px -5px rgba(15, 76, 117, 0.2)'
  },
  bannerContent: { flex: 1, justifyContent: 'center' },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  bannerSubtitle: { fontSize: 13, color: '#E0F2FE' },
  bannerIllustration: { justifyContent: 'center', alignItems: 'center' },

  mainCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: '#F8FAFC',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)'
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  viewAllLink: { fontSize: 14, color: '#0369A1', fontWeight: '600' },
  
  table: { width: '100%' },
  tableHeader: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', backgroundColor: '#F8FAFC', paddingHorizontal: 16, borderRadius: 8 },
  th: { fontSize: 11, fontWeight: 'bold', color: '#64748B' },
  tableRow: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingHorizontal: 16, alignItems: 'center' },
  td: { fontSize: 13, color: '#1E293B', fontWeight: '500' },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusBadgeText: { fontSize: 12, fontWeight: 'bold' },
  
  emptyListState: { paddingVertical: 32, alignItems: 'center', justifyContent: 'center' },
  emptyListTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  emptyListDesc: { fontSize: 12, color: '#64748B', textAlign: 'center' },
  
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  listItemTitle: { fontSize: 14, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  listItemSub: { fontSize: 12, color: '#64748B' },
  viewLink: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  
  activityList: { gap: 16 },
  activityItem: { flexDirection: 'row', alignItems: 'center' },
  activityIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 12, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  activityTime: { fontSize: 11, color: '#64748B' }
});
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert } from 'react-native';
import Colors from '../../constants/Colors';
import { useMockData } from '../../context/MockDataContext';
import { Ionicons } from '@expo/vector-icons';

const STATUS_COLORS = {
  'Scheduled': Colors.primary,
  'Active': Colors.success,
  'Due Today': Colors.warning,
  'Overdue': Colors.danger,
  'Completed': Colors.textLight
};

export default function RentalsScreen() {
  const { rentals, returnRental } = useMockData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [viewRental, setViewRental] = useState(null);

  const getRentalStatus = (rental) => {
    if (rental.status === 'Completed') return 'Completed';
    
    const start = new Date(rental.requestedStartDate || rental.startDate);
    const end = new Date(rental.requestedEndDate || rental.endDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    if (today < start) return 'Scheduled';
    if (today > end) return 'Overdue';
    if (today.getTime() === end.getTime()) return 'Due Today';
    return 'Active';
  };

  const getRemainingDays = (rental) => {
    if (rental.status === 'Completed') return 'Completed';
    const end = new Date(rental.requestedEndDate || rental.endDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    end.setHours(0,0,0,0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} Days Overdue`;
    if (diffDays === 0) return `Due Today`;
    return `${diffDays} Days Remaining`;
  };

  const processedRentals = useMemo(() => {
    return rentals.map(r => ({
      ...r,
      computedStatus: getRentalStatus(r),
      remainingText: getRemainingDays(r)
    }));
  }, [rentals]);

  const categories = ['All', ...new Set(processedRentals.map(r => r.category).filter(Boolean))];

  const filteredRentals = useMemo(() => {
    return processedRentals.filter(r => {
      if (statusFilter !== 'All' && r.computedStatus !== statusFilter) return false;
      if (categoryFilter !== 'All' && r.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = 
          (r.rentalId && r.rentalId.toLowerCase().includes(q)) ||
          (r.id && r.id.toLowerCase().includes(q)) || // fallback to id
          (r.equipmentName && r.equipmentName.toLowerCase().includes(q)) ||
          (r.customerName && r.customerName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [processedRentals, statusFilter, categoryFilter, searchQuery]);

  // Summaries (Only active/ongoing)
  const activeRentals = processedRentals.filter(r => r.computedStatus !== 'Completed');
  
  const summary = {
    active: activeRentals.filter(r => r.computedStatus === 'Active').length,
    scheduled: activeRentals.filter(r => r.computedStatus === 'Scheduled').length,
    dueToday: activeRentals.filter(r => r.computedStatus === 'Due Today').length,
    overdue: activeRentals.filter(r => r.computedStatus === 'Overdue').length,
    totalUnits: activeRentals.reduce((sum, r) => sum + (r.quantity || 1), 0)
  };

  const handleAction = (actionType) => {
    if (!viewRental) return;
    
    const confirmWeb = (msg) => {
      if (Platform.OS === 'web') return window.confirm(msg);
      return true;
    };

    if (actionType === 'return') {
      if (Platform.OS === 'web') {
        if (!window.confirm("Confirm that the rented equipment has been returned by the customer.")) return;
        returnRental(viewRental.rentalId || viewRental.id);
        setViewRental(null); 
      } else {
        Alert.alert("Mark Equipment as Returned?", "Confirm that the rented equipment has been returned by the customer.", [
          { text: "Cancel", style: "cancel" },
          { text: "Mark as Returned", onPress: () => {
              returnRental(viewRental.rentalId || viewRental.id);
              setViewRental(null);
          }}
        ]);
      }
    }
  };

  const currentView = viewRental ? processedRentals.find(r => (r.rentalId || r.id) === (viewRental.rentalId || viewRental.id)) : null;

  if (currentView) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Active Rental {currentView.rentalId || currentView.id}</Text>
            <View style={[styles.badge, { backgroundColor: STATUS_COLORS[currentView.computedStatus] + '15', marginTop: 8 }]}>
              <Text style={[styles.badgeText, { color: STATUS_COLORS[currentView.computedStatus] }]}>{currentView.computedStatus}</Text>
            </View>
          </View>
          <Pressable style={styles.secondaryButton} onPress={() => setViewRental(null)}>
            <Text style={styles.secondaryButtonText}>Back to Rentals</Text>
          </Pressable>
        </View>

        <View style={styles.detailGrid}>
          {/* Left Column */}
          <View style={styles.detailColMain}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rental Information</Text>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Rental ID</Text><Text style={styles.infoValue}>{currentView.rentalId || currentView.id}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Request ID</Text><Text style={styles.infoValue}>{currentView.requestId || 'N/A'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Created Date</Text><Text style={styles.infoValue}>{currentView.createdAt || 'N/A'}</Text></View>
              
              <View style={{flexDirection: 'row', alignItems: 'center', marginVertical: 16, backgroundColor: '#F8FAFC', padding: 16, borderRadius: 8}}>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text style={styles.infoLabel}>Start Date</Text>
                  <Text style={[styles.infoValue, {fontWeight: 'bold', marginTop: 4}]}>{currentView.requestedStartDate}</Text>
                </View>
                <View style={{paddingHorizontal: 16, alignItems: 'center'}}>
                  <Text style={[styles.infoLabel, {fontSize: 12}]}>{currentView.rentalDuration}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
                  <Text style={[styles.infoLabel, {fontSize: 12, color: currentView.computedStatus === 'Overdue' ? Colors.danger : Colors.primary}]}>
                    {currentView.remainingText}
                  </Text>
                </View>
                <View style={{flex: 1, alignItems: 'center'}}>
                  <Text style={styles.infoLabel}>End Date</Text>
                  <Text style={[styles.infoValue, {fontWeight: 'bold', marginTop: 4}]}>{currentView.requestedEndDate}</Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Equipment Details</Text>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Equipment Name</Text><Text style={styles.infoValue}>{currentView.equipmentName}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Category</Text><Text style={styles.infoValue}>{currentView.category}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Type</Text><Text style={styles.infoValue}>{currentView.equipmentType}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Quantity</Text><Text style={[styles.infoValue, {fontWeight: 'bold'}]}>{currentView.quantity}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Rental Price</Text><Text style={styles.infoValue}>₹{currentView.rentalPrice} / {currentView.rentalPriceUnit}</Text></View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Activity Timeline</Text>
              {currentView.activityTimeline?.map((act, idx) => (
                <View key={idx} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View>
                    <Text style={styles.timelineTime}>{act.time}</Text>
                    <Text style={styles.timelineText}>{act.text}</Text>
                  </View>
                </View>
              ))}
              {!currentView.activityTimeline && (
                <Text style={styles.infoLabel}>No activity recorded yet.</Text>
              )}
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.detailColSide}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Customer Information</Text>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{currentView.customerName}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Mobile</Text><Text style={styles.infoValue}>{currentView.mobileNumber}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{currentView.email}</Text></View>
              
              <Text style={[styles.cardTitle, {marginTop: 20, fontSize: 14}]}>RENTAL ADDRESS</Text>
              <Text style={[styles.infoValue, {marginBottom: 4}]}>{currentView.deliveryAddress}</Text>
              <Text style={styles.infoValue}>{currentView.city} - {currentView.pincode}</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Rental Amount Breakdown</Text>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Rental Amount</Text><Text style={styles.infoValue}>₹{currentView.rentalPrice}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Security Deposit</Text><Text style={styles.infoValue}>₹{currentView.securityDeposit || 0}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Delivery Charges</Text><Text style={styles.infoValue}>₹{currentView.deliveryCharges || 0}</Text></View>
              <View style={[styles.infoRow, {borderTopWidth: 1, borderTopColor: '#E2E8F0', marginTop: 12, paddingTop: 12}]}>
                <Text style={[styles.infoLabel, {fontWeight: 'bold', color: '#1E293B'}]}>Total Amount</Text>
                <Text style={[styles.infoValue, {fontWeight: 'bold', color: '#1E293B', fontSize: 16}]}>₹{currentView.totalAmount}</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Actions</Text>
              
              {currentView.computedStatus !== 'Completed' && (
                <Pressable style={styles.primaryButton} onPress={() => handleAction('return')}>
                  <Text style={styles.primaryButtonText}>Mark as Returned</Text>
                </Pressable>
              )}

              {currentView.computedStatus === 'Completed' && (
                <Text style={styles.infoLabel}>This rental is completed and closed.</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.unifiedCard}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Active Rentals</Text>
            <Text style={styles.subtitle}>Track and manage your ongoing equipment rentals.</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.active}</Text>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: Colors.success }]} />
              <Text style={styles.summaryLabel}>Active Rentals</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.scheduled}</Text>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.summaryLabel}>Starting Soon</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.dueToday}</Text>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: Colors.warning }]} />
              <Text style={styles.summaryLabel}>Due Today</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.overdue}</Text>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
              <Text style={styles.summaryLabel}>Overdue</Text>
            </View>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{summary.totalUnits}</Text>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: Colors.textLight }]} />
              <Text style={styles.summaryLabel}>Total Units</Text>
            </View>
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by ID, Equipment, Customer..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.filterGroup}>
            <View style={styles.pickerContainer}>
              {Platform.OS === 'web' ? (
                <select style={styles.nativeSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {['All', 'Scheduled', 'Active', 'Due Today', 'Overdue', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <Text style={styles.pickerText}>{statusFilter}</Text>
              )}
            </View>
            <View style={styles.pickerContainer}>
              {Platform.OS === 'web' ? (
                <select style={styles.nativeSelect} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <Text style={styles.pickerText}>{categoryFilter}</Text>
              )}
            </View>
            {(searchQuery || statusFilter !== 'All' || categoryFilter !== 'All') && (
              <Pressable style={styles.clearBtn} onPress={() => { setSearchQuery(''); setStatusFilter('All'); setCategoryFilter('All'); }}>
                <Text style={styles.clearBtnText}>Clear Filters</Text>
              </Pressable>
            )}
          </View>
        </View>

        {filteredRentals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No Active Rentals</Text>
            <Text style={styles.emptyDesc}>Accepted and fulfilled rentals will appear here while they are ongoing.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ width: '100%' }}>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 1.2 }]}>Rental ID</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Equipment</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Customer</Text>
                <Text style={[styles.th, { flex: 0.8 }]}>Qty</Text>
                <Text style={[styles.th, { flex: 1.2 }]}>Start Date</Text>
                <Text style={[styles.th, { flex: 1.2 }]}>End Date</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Remaining Days</Text>
                <Text style={[styles.th, { flex: 1 }]}>Amount</Text>
                <Text style={[styles.th, { flex: 1 }]}>Status</Text>
                <Text style={[styles.th, { width: 80, textAlign: 'center' }]}>Action</Text>
              </View>
              
              {filteredRentals.map(rental => (
                <View key={rental.rentalId || rental.id} style={styles.tableRow}>
                  <Text style={[styles.td, { flex: 1.2, fontWeight: 'bold', color: Colors.primary }]}>{rental.rentalId || rental.id}</Text>
                  <View style={[styles.td, { flex: 1.5 }]}>
                    <Text style={styles.mainText} numberOfLines={1}>{rental.equipmentName}</Text>
                    <Text style={styles.subText} numberOfLines={1}>{rental.category}</Text>
                  </View>
                  <Text style={[styles.td, { flex: 1.5 }]} numberOfLines={1}>{rental.customerName || rental.patient}</Text>
                  <Text style={[styles.td, { flex: 0.8 }]}>{rental.quantity || 1}</Text>
                  <Text style={[styles.td, { flex: 1.2 }]}>{rental.requestedStartDate || '-'}</Text>
                  <Text style={[styles.td, { flex: 1.2 }]}>{rental.requestedEndDate || '-'}</Text>
                  <Text style={[styles.td, { flex: 1.5, color: rental.computedStatus === 'Overdue' ? Colors.danger : Colors.text }]}>{rental.remainingText}</Text>
                  <Text style={[styles.td, { flex: 1 }]}>₹{rental.totalAmount || 0}</Text>
                  <View style={[styles.td, { flex: 1 }]}>
                    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[rental.computedStatus] + '15' }]}>
                      <Text style={[styles.badgeText, { color: STATUS_COLORS[rental.computedStatus] }]}>{rental.computedStatus}</Text>
                    </View>
                  </View>
                  <View style={[styles.td, { width: 80, alignItems: 'center' }]}>
                    <Pressable style={styles.viewBtn} onPress={() => setViewRental(rental)}>
                      <Text style={styles.viewBtnText}>View</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  subtitle: { fontSize: 13, color: Colors.textLight, marginTop: 4 },
  
  summaryGrid: { flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  summaryCard: { 
    flex: 1, 
    minWidth: 120,
    backgroundColor: '#F8FAFC', 
    paddingVertical: 14, 
    paddingHorizontal: 12,
    borderRadius: 10, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0', 
  },
  summaryNumber: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 3 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  summaryLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  
  filtersContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' },
  searchBox: { flex: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', height: 38 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: Colors.text, outlineStyle: 'none' },
  filterGroup: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  pickerContainer: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, height: 38, justifyContent: 'center', overflow: 'hidden' },
  nativeSelect: { height: '100%', borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 12, fontSize: 13, color: Colors.text, outlineStyle: 'none', cursor: 'pointer' },
  pickerText: { paddingHorizontal: 12, fontSize: 13, color: Colors.text },
  clearBtn: { paddingHorizontal: 12, height: 38, justifyContent: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 },
  clearBtnText: { fontSize: 12, fontWeight: 'bold', color: Colors.text },
  
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginTop: 12, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textLight, textAlign: 'center' },
  table: { minWidth: 950, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  th: { fontSize: 11, fontWeight: '700', color: Colors.textLight, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  td: { fontSize: 13, color: Colors.text, paddingRight: 8 },
  mainText: { fontSize: 13, fontWeight: '700', color: Colors.text, marginBottom: 2 },
  subText: { fontSize: 11, color: Colors.textLight },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  
  viewBtn: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#F0F9FF', borderRadius: 16 },
  viewBtnText: { fontSize: 12, fontWeight: '700', color: Colors.primary },
  
  // Detail View Styles
  detailGrid: { flexDirection: 'row', gap: 24, marginTop: 16, flexWrap: 'wrap' },
  detailColMain: { flex: 2, minWidth: 300, gap: 24 },
  detailColSide: { flex: 1, minWidth: 250, gap: 24 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 14, color: Colors.textLight },
  infoValue: { fontSize: 14, color: Colors.text, textAlign: 'right', flex: 1, marginLeft: 16 },
  
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 4, marginRight: 12 },
  timelineTime: { fontSize: 12, color: Colors.textLight, marginBottom: 2 },
  timelineText: { fontSize: 14, color: Colors.text },
  
  primaryButton: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#F1F5F9', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: Colors.text, fontSize: 14, fontWeight: 'bold' },
});
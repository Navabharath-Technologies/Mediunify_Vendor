import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert } from 'react-native';
import Colors from '../../constants/Colors';
import { useMockData } from '../../context/MockDataContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function NotificationsScreen() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useMockData();

  const [searchQuery, setSearchQuery] = useState('');
  const [readFilter, setReadFilter] = useState('All'); // All, Unread, Read
  const [categoryFilter, setCategoryFilter] = useState('All'); // All, Rental Requests, Rental Status, Inventory, Account

  const handleMarkAllRead = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (unreadCount === 0) return;

    if (Platform.OS === 'web') {
      if (window.confirm("Mark all notifications as read?")) {
        markAllNotificationsAsRead();
      }
    } else {
      Alert.alert("Mark All as Read", "Mark all notifications as read?", [
        { text: "Cancel", style: "cancel" },
        { text: "Mark All as Read", onPress: () => markAllNotificationsAsRead() }
      ]);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.isRead) {
      markNotificationAsRead(notif.id);
    }
    
    // Navigate based on relatedType
    if (notif.relatedType === 'rental-request') {
      router.push('/requests');
    } else if (notif.relatedType === 'active-rental') {
      router.push('/rentals');
    } else if (notif.relatedType === 'rental-history') {
      router.push('/history');
    } else if (notif.relatedType === 'inventory') {
      router.push('/inventory');
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (readFilter === 'Unread' && n.isRead) return false;
      if (readFilter === 'Read' && !n.isRead) return false;
      
      if (categoryFilter !== 'All' && n.category !== categoryFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = 
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.message && n.message.toLowerCase().includes(q)) ||
          (n.relatedId && n.relatedId.toLowerCase().includes(q)) ||
          (n.equipmentName && n.equipmentName.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [notifications, readFilter, categoryFilter, searchQuery]);

  const summary = {
    all: notifications.length,
    unread: notifications.filter(n => !n.isRead).length
  };

  // Helper to format date
  const formatTime = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Helper to pick icon
  const getIcon = (category) => {
    switch (category) {
      case 'Rental Requests': return 'document-text';
      case 'Rental Status': return 'car';
      case 'Inventory': return 'layers';
      case 'Account': return 'person';
      default: return 'notifications';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.unifiedCard}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>Stay updated with your rental requests, equipment and account activity.</Text>
          </View>
          <Pressable 
            style={[styles.primaryButton, summary.unread === 0 && styles.disabledButton]} 
            onPress={handleMarkAllRead}
            disabled={summary.unread === 0}
          >
            <Ionicons name="checkmark-done" size={18} color={summary.unread === 0 ? "#94A3B8" : "#fff"} style={{marginRight: 8}} />
            <Text style={[styles.primaryButtonText, summary.unread === 0 && {color: '#94A3B8'}]}>Mark All as Read</Text>
          </Pressable>
        </View>

        <View style={styles.summaryGrid}>
          <Pressable style={[styles.summaryCard, readFilter === 'All' && styles.summaryCardActive]} onPress={() => setReadFilter('All')}>
            <Text style={styles.summaryNumber}>{summary.all}</Text>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.summaryLabel}>All Notifications</Text>
            </View>
          </Pressable>
          <Pressable style={[styles.summaryCard, readFilter === 'Unread' && styles.summaryCardActive]} onPress={() => setReadFilter('Unread')}>
            <Text style={styles.summaryNumber}>{summary.unread}</Text>
            <View style={styles.labelRow}>
              <View style={[styles.dot, { backgroundColor: Colors.danger }]} />
              <Text style={styles.summaryLabel}>Unread</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#94A3B8" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notifications..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.filterGroup}>
            <View style={styles.pickerContainer}>
              {Platform.OS === 'web' ? (
                <select style={styles.nativeSelect} value={readFilter} onChange={(e) => setReadFilter(e.target.value)}>
                  <option value="All">All Read States</option>
                  <option value="Unread">Unread</option>
                  <option value="Read">Read</option>
                </select>
              ) : (
                <Text style={styles.pickerText}>{readFilter}</Text>
              )}
            </View>
            <View style={styles.pickerContainer}>
              {Platform.OS === 'web' ? (
                <select style={styles.nativeSelect} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {['All', 'Rental Requests', 'Rental Status', 'Inventory', 'Account'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <Text style={styles.pickerText}>{categoryFilter}</Text>
              )}
            </View>
            {(searchQuery || readFilter !== 'All' || categoryFilter !== 'All') && (
              <Pressable style={styles.clearBtn} onPress={() => { setSearchQuery(''); setReadFilter('All'); setCategoryFilter('All'); }}>
                <Text style={styles.clearBtnText}>Clear Filters</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.listContainer}>
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyDesc}>You’re all caught up. New updates will appear here.</Text>
            </View>
          ) : (
            filteredNotifications.map((notif, index, arr) => (
              <Pressable 
                key={notif.id} 
                style={[styles.notifCard, !notif.isRead && styles.notifCardUnread, index === arr.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => handleNotificationClick(notif)}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={getIcon(notif.category)} size={22} color={!notif.isRead ? Colors.primary : Colors.textLight} />
                </View>
                <View style={styles.notifContent}>
                  <View style={styles.notifHeader}>
                    <Text style={[styles.notifTitle, !notif.isRead && styles.notifTitleUnread]}>{notif.title}</Text>
                    <Text style={styles.notifTime}>{formatTime(notif.createdAt)}</Text>
                  </View>
                  <Text style={styles.notifMessage}>{notif.message}</Text>
                  
                  {/* Meta details if available */}
                  {(notif.relatedId || notif.equipmentName) && (
                    <View style={styles.metaRow}>
                      {notif.relatedId && <Text style={styles.metaText}>ID: {notif.relatedId}</Text>}
                      {notif.relatedId && notif.equipmentName && <Text style={styles.metaDot}>•</Text>}
                      {notif.equipmentName && <Text style={styles.metaText}>{notif.equipmentName}</Text>}
                    </View>
                  )}
                </View>
                
                {!notif.isRead && (
                  <Pressable style={styles.markReadAction} onPress={(e) => { e.stopPropagation(); markNotificationAsRead(notif.id); }}>
                    <Ionicons name="ellipse" size={10} color={Colors.primary} />
                    <Text style={styles.markReadText}>Mark as read</Text>
                  </Pressable>
                )}
              </Pressable>
            ))
          )}
        </View>
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
  
  primaryButton: { flexDirection: 'row', backgroundColor: Colors.primary, paddingVertical: 9, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center' },
  disabledButton: { backgroundColor: '#F1F5F9' },
  primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  
  summaryGrid: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  summaryCard: { 
    minWidth: 150,
    backgroundColor: '#F8FAFC', 
    paddingVertical: 14, 
    paddingHorizontal: 20,
    borderRadius: 10, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0', 
  },
  summaryCardActive: { backgroundColor: '#EFF6FF', borderColor: Colors.primary },
  summaryNumber: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  labelRow: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  summaryLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  
  filtersContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' },
  searchBox: { flex: 1, minWidth: 220, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', height: 38 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: Colors.text, outlineStyle: 'none' },
  filterGroup: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  pickerContainer: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, height: 38, justifyContent: 'center', overflow: 'hidden' },
  nativeSelect: { height: '100%', borderWidth: 0, backgroundColor: 'transparent', paddingHorizontal: 12, fontSize: 13, color: Colors.text, outlineStyle: 'none', cursor: 'pointer' },
  pickerText: { paddingHorizontal: 12, fontSize: 13, color: Colors.text },
  clearBtn: { paddingHorizontal: 12, height: 38, justifyContent: 'center', backgroundColor: '#F1F5F9', borderRadius: 8 },
  clearBtnText: { fontSize: 12, fontWeight: 'bold', color: Colors.text },
  
  listContainer: { borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginTop: 12, marginBottom: 4 },
  emptyDesc: { fontSize: 13, color: Colors.textLight, textAlign: 'center' },
  
  notifCard: { flexDirection: 'row', backgroundColor: '#ffffff', padding: 18, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'flex-start' },
  notifCardUnread: { backgroundColor: '#F8FAFC' },
  
  iconContainer: { marginRight: 16, marginTop: 2 },
  
  notifContent: { flex: 1 },
  notifHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  notifTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  notifTitleUnread: { fontWeight: '700', color: Colors.text },
  notifTime: { fontSize: 11, color: Colors.textLight },
  notifMessage: { fontSize: 13, color: '#475569', lineHeight: 19 },
  
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  metaText: { fontSize: 11, color: Colors.textLight, fontWeight: '500' },
  metaDot: { fontSize: 11, color: Colors.textLight, marginHorizontal: 6 },
  
  markReadAction: { flexDirection: 'row', alignItems: 'center', padding: 8, alignSelf: 'center', marginLeft: 16 },
  markReadText: { fontSize: 12, color: Colors.primary, fontWeight: '600', marginLeft: 4 }
});

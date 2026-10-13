import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, TextInput, Modal } from 'react-native';
import Colors from '../../constants/Colors';
import { useMockData } from '../../context/MockDataContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

export default function InventoryScreen() {
  const { equipment, stats, updateInventory, deleteEquipment } = useMockData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  
  const { action, id } = useLocalSearchParams();
  const [manageItem, setManageItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Manage Form State
  const [editTotal, setEditTotal] = useState('');
  const [editUnavailable, setEditUnavailable] = useState('');

  useEffect(() => {
    if (action === 'manage' && id) {
      const eq = equipment.find(e => e.id === id);
      if (eq) {
        setManageItem(eq);
        setEditTotal(eq.stock ? eq.stock.toString() : '0');
        setEditUnavailable(eq.unavailable ? eq.unavailable.toString() : '0');
      } else {
        setManageItem(null);
      }
    } else {
      setManageItem(null);
    }
  }, [action, id, equipment]);

  const handleOpenManage = (eq) => {
    router.push(`/inventory?action=manage&id=${eq.id}`);
  };

  const handleUpdateInventory = () => {
    if (!manageItem) return;
    
    const newTotal = parseInt(editTotal, 10);
    const newUnavail = parseInt(editUnavailable, 10);
    const rented = manageItem.rented || 0;
    
    if (isNaN(newTotal) || newTotal < 0) {
      if (Platform.OS === 'web') window.alert('Total quantity cannot be negative.');
      else Alert.alert('Error', 'Total quantity cannot be negative.');
      return;
    }
    if (isNaN(newUnavail) || newUnavail < 0) {
      if (Platform.OS === 'web') window.alert('Unavailable quantity cannot be negative.');
      else Alert.alert('Error', 'Unavailable quantity cannot be negative.');
      return;
    }
    if (newTotal < rented) {
      if (Platform.OS === 'web') window.alert('Total quantity cannot be less than the quantity currently rented.');
      else Alert.alert('Error', 'Total quantity cannot be less than the quantity currently rented.');
      return;
    }
    if (newTotal < rented + newUnavail) {
      if (Platform.OS === 'web') window.alert('Total quantity must be at least the sum of rented and unavailable quantities.');
      else Alert.alert('Error', 'Total quantity must be at least the sum of rented and unavailable quantities.');
      return;
    }

    updateInventory(manageItem.id, newTotal, newUnavail);
    
    if (Platform.OS === 'web') window.alert('Inventory updated successfully.');
    else Alert.alert('Success', 'Inventory updated successfully.');
    
    router.push('/(dashboard)/inventory');
  };

  // Derive dynamic categories from actual equipment data
  const uniqueCategories = ['All Categories', ...new Set(equipment.map(eq => eq.category).filter(Boolean))];

  let filteredEquipment = equipment.filter(eq => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = (eq.name && eq.name.toLowerCase().includes(q)) || 
                            (eq.category && eq.category.toLowerCase().includes(q)) || 
                            (eq.equipmentType && eq.equipmentType.toLowerCase().includes(q));
      if (!matchesSearch) return false;
    }
    if (filterCategory !== 'All Categories' && eq.category !== filterCategory) return false;
    
    const availableQty = (eq.stock || 0) - (eq.rented || 0) - (eq.unavailable || 0);
    if (filterStatus === 'Available' && (availableQty <= 0 || eq.availability !== 'Available')) return false;
    if (filterStatus === 'Unavailable' && (availableQty <= 0 && eq.availability !== 'Available')) return false; // Basic filter representation
    if (filterStatus === 'Maintenance' && eq.availability === 'Maintenance') return false; // Just placeholder based on available logic
    
    return true;
  });

  if (manageItem) {
    const rented = manageItem.rented || 0;
    const currentTotal = parseInt(editTotal, 10) || 0;
    const currentUnavail = parseInt(editUnavailable, 10) || 0;
    const derivedAvailable = Math.max(0, currentTotal - rented - currentUnavail);

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Inventory</Text>
          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Back to Inventory</Text>
          </Pressable>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.detailHeader}>
            <View style={styles.detailIconBox}><Ionicons name="cube" size={32} color={Colors.primary} /></View>
            <View>
              <Text style={styles.detailName}>{manageItem.name}</Text>
              <Text style={styles.detailCategory}>{manageItem.category} • {manageItem.equipmentType}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Inventory Update</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Total Quantity</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={editTotal} onChangeText={setEditTotal} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Rented (Controlled by System)</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={rented.toString()} editable={false} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Unavailable / Maintenance</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={editUnavailable} onChangeText={setEditUnavailable} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Available (Calculated)</Text>
              <TextInput style={[styles.input, styles.inputDisabled, { borderColor: Colors.success, color: Colors.success, fontWeight: 'bold' }]} value={derivedAvailable.toString()} editable={false} />
            </View>
          </View>
          <Text style={styles.helpText}>Formula: Total = Available + Rented + Unavailable</Text>
          
          <Pressable style={[styles.primaryButton, { marginTop: 20, alignSelf: 'flex-start' }]} onPress={handleUpdateInventory}>
            <Text style={styles.primaryButtonText}>Update Inventory</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.unifiedCard}>
        {/* Header inside unified card */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.subtitle}>Manage your equipment stock and availability.</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable style={[styles.cancelButton, { borderColor: Colors.primary }]} onPress={() => router.push('/(dashboard)/import')}>
              <Text style={[styles.cancelButtonText, { color: Colors.primary }]}>Import Inventory</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/(dashboard)/equipment?action=add')}>
              <Text style={styles.primaryButtonText}>+ Add Equipment</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats Row integrated inside unified card */}
        <View style={styles.grid}>
          <View style={[styles.statCard, { borderBottomColor: Colors.primary }]}>
            <Text style={styles.statValue}>{stats.totalEquipment}</Text>
            <Text style={styles.statLabel}>Total Equipment</Text>
          </View>
          <View style={[styles.statCard, { borderBottomColor: Colors.primary }]}>
            <Text style={styles.statValue}>{stats.totalStock}</Text>
            <Text style={styles.statLabel}>Total Stock</Text>
          </View>
          <View style={[styles.statCard, { borderBottomColor: Colors.success }]}>
            <Text style={[styles.statValue, { color: Colors.success }]}>{stats.availableNow}</Text>
            <Text style={styles.statLabel}>Available Stock</Text>
          </View>
          <View style={[styles.statCard, { borderBottomColor: Colors.warning }]}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>{stats.currentlyRented}</Text>
            <Text style={styles.statLabel}>Rented</Text>
          </View>
          <View style={[styles.statCard, { borderBottomColor: Colors.danger }]}>
            <Text style={[styles.statValue, { color: Colors.danger }]}>{stats.unavailableStock}</Text>
            <Text style={styles.statLabel}>Unavailable</Text>
          </View>
        </View>

        {/* Search & Filters */}
        <View style={styles.toolbar}>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search equipment..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.filters}>
            <View style={styles.selectWrapper}>
              <select style={styles.nativeSelect} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </View>
            <View style={styles.selectWrapper}>
              <select style={styles.nativeSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </View>
          </View>
        </View>

        {/* Table content directly attached inside the unified card */}
        {equipment.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="layers-outline" size={48} color={Colors.primary} style={{ opacity: 0.5, marginBottom: 12 }} />
            <Text style={{fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 8}}>No equipment in inventory yet.</Text>
            <Text style={{color: Colors.textLight, marginBottom: 20}}>Add equipment to start managing your inventory.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/(dashboard)/equipment?action=add')}>
              <Text style={styles.primaryButtonText}>+ Add Equipment</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>EQUIPMENT NAME</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>TOTAL</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>AVAILABLE</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>RENTED</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>UNAVAILABLE</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>ACTIONS</Text>
            </View>
            {filteredEquipment.map((eq, index, arr) => {
              const rented = eq.rented || 0;
              const unavail = eq.unavailable || 0;
              const available = Math.max(0, (eq.stock || 0) - rented - unavail);
              const isAvailable = available > 0 && eq.availability === 'Available';
              
              return (
                <View key={eq.id} style={[styles.tableRow, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.tableName}>{eq.name}</Text>
                    <Text style={styles.tableCategory}>{eq.category}</Text>
                  </View>
                  <Text style={[styles.td, { flex: 1, textAlign: 'center', fontWeight: 'bold' }]}>{eq.stock || 0}</Text>
                  <Text style={[styles.td, { flex: 1, textAlign: 'center', color: Colors.success, fontWeight: 'bold' }]}>{available}</Text>
                  <Text style={[styles.td, { flex: 1, textAlign: 'center', color: Colors.warning, fontWeight: 'bold' }]}>{rented}</Text>
                  <Text style={[styles.td, { flex: 1, textAlign: 'center', color: Colors.danger, fontWeight: 'bold' }]}>{unavail}</Text>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={[styles.statusBadge, isAvailable ? styles.badgeAvailable : styles.badgeOut]}>
                      <Text style={[styles.statusBadgeText, isAvailable ? styles.badgeTextAvailable : styles.badgeTextOut]}>
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                    <Pressable style={styles.actionBtn} onPress={() => handleOpenManage(eq)}>
                      <Text style={styles.actionBtnText}>Manage</Text>
                    </Pressable>
                    <Pressable style={[styles.actionIconBtn, { backgroundColor: '#FEE2E2' }]} onPress={() => setDeleteConfirmId(eq.id)} title="Delete">
                      <Ionicons name="trash" size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal transparent animationType="fade" visible={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconBox}>
                <Ionicons name="warning" size={32} color="#EF4444" />
              </View>
              <Text style={styles.modalTitle}>Delete Equipment</Text>
              <Text style={styles.modalText}>Are you sure you want to delete this equipment? This action cannot be undone and will remove it from your inventory.</Text>
              
              <View style={styles.modalActions}>
                <Pressable style={styles.modalCancelBtn} onPress={() => setDeleteConfirmId(null)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalDeleteBtn} onPress={() => {
                  deleteEquipment(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}>
                  <Text style={styles.modalDeleteText}>Yes, Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}

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
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 3 },
  subtitle: { fontSize: 13, color: Colors.textLight },
  
  primaryButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  
  cancelButton: { backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center' },
  cancelButtonText: { color: Colors.text, fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { 
    flex: 1, 
    minWidth: 120, 
    backgroundColor: '#F8FAFC', 
    padding: 14, 
    borderRadius: 10, 
    borderBottomWidth: 3, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },

  toolbar: { flexDirection: 'row', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: 180, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 14, fontSize: 13, backgroundColor: '#F8FAFC', outlineStyle: 'none' },
  filters: { flexDirection: 'row', gap: 10 },
  selectWrapper: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#F8FAFC', overflow: 'hidden' },
  nativeSelect: { paddingVertical: 9, paddingHorizontal: 12, fontSize: 13, color: '#1E293B', borderWidth: 0, backgroundColor: 'transparent', minWidth: 120, outlineStyle: 'none' },

  mainCard: { backgroundColor: '#fff', borderRadius: 12, padding: 24, borderWidth: 1, borderColor: '#E2E8F0', maxWidth: 800 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  detailIconBox: { width: 64, height: 64, borderRadius: 12, backgroundColor: Colors.primary + '15', justifyContent: 'center', alignItems: 'center' },
  detailName: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  detailCategory: { fontSize: 14, color: Colors.textLight },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  inputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  inputGroup: { flex: 1, minWidth: 150, marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1E293B', backgroundColor: '#F8FAFC' },
  inputDisabled: { backgroundColor: '#E2E8F0', color: Colors.textLight },
  helpText: { fontSize: 12, color: Colors.textLight, fontStyle: 'italic', marginTop: -4 },

  emptyStateContainer: { padding: 40, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 },
  
  table: { borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 20, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', alignItems: 'center' },
  th: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  tableName: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  tableCategory: { fontSize: 12, color: '#64748B' },
  td: { fontSize: 13, color: '#475569' },
  
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: 'bold' },
  badgeAvailable: { backgroundColor: '#D1FAE5' },
  badgeTextAvailable: { color: '#059669' },
  badgeOut: { backgroundColor: '#FEF3C7' },
  badgeTextOut: { color: '#D97706' },
  
  actionBtn: { backgroundColor: '#F0F9FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  actionBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  actionIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24, zIndex: 1000 },
  modalContainer: { width: '100%', maxWidth: 320, backgroundColor: '#fff', borderRadius: 16, padding: 24, alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' },
  modalIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  modalText: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F1F5F9', alignItems: 'center' },
  modalCancelText: { color: '#475569', fontWeight: '700', fontSize: 13 },
  modalDeleteBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#EF4444', alignItems: 'center' },
  modalDeleteText: { color: '#fff', fontWeight: '700', fontSize: 13 }
});
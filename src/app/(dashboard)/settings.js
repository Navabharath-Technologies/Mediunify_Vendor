import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, TextInput, Modal, Platform } from 'react-native';
import { router } from 'expo-router';
import Colors from '../../constants/Colors';
import { useMockData } from '../../context/MockDataContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { vendorProfile, updateProfile, changePassword } = useMockData();
  
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [toast, setToast] = useState('');

  const STATUS_COLORS = {
    'Approved': Colors.success,
    'Pending': Colors.warning,
    'Verified': Colors.success,
    'Rejected': Colors.danger,
    'Suspended': Colors.danger,
    'Pending Verification': Colors.warning
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const toggleNotification = (key) => {
    const newPrefs = {
      ...vendorProfile.notificationPreferences,
      [key]: !vendorProfile.notificationPreferences?.[key]
    };
    updateProfile({ notificationPreferences: newPrefs });
    showToast('Preference updated.');
  };

  const handleChangePassword = () => {
    let errs = {};
    if (!passwordData.current) errs.current = 'Required';
    if (!passwordData.new) errs.new = 'Required';
    if (!passwordData.confirm) errs.confirm = 'Required';
    if (passwordData.new && passwordData.confirm && passwordData.new !== passwordData.confirm) {
      errs.confirm = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    changePassword(passwordData.current, passwordData.new);
    setPasswordData({ current: '', new: '', confirm: '' });
    setPasswordErrors({});
    setShowPasswordModal(false);
    showToast('Password changed successfully.');
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    router.replace('/login');
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'Approved': return 'Your vendor account is active.';
      case 'Pending': return 'Your vendor account is awaiting Admin verification.';
      case 'Rejected': return 'Your vendor account requires attention.';
      case 'Suspended': return 'Your vendor account is currently suspended.';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account preferences and security.</Text>
      </View>
        <View style={styles.grid}>
          {/* Main Column */}
          <View style={styles.colMain}>
            {/* Account & Security */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Account & Security</Text>
              
              <View style={styles.infoRow}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Ionicons name="mail-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Email Address</Text>
                </View>
                <Text style={styles.infoValue}>{vendorProfile.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                  <Ionicons name="call-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Mobile Number</Text>
                </View>
                <Text style={styles.infoValue}>{vendorProfile.mobileNumber}</Text>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12}}>
                  <Ionicons name="lock-closed-outline" size={16} color="#64748B" />
                  <Text style={styles.infoLabel}>Password</Text>
                </View>
                <Pressable style={styles.secondaryButton} onPress={() => setShowPasswordModal(true)}>
                  <Text style={styles.secondaryButtonText}>Change Password</Text>
                </Pressable>
              </View>
            </View>

            {/* Notification Preferences */}
            <View style={styles.card}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                <Text style={[styles.cardTitle, {marginBottom: 0}]}>Notification Preferences</Text>
                <Pressable onPress={() => {
                  updateProfile({
                    notificationPreferences: { rentalRequests: true, rentalStatus: true, inventoryAlerts: true, accountUpdates: true }
                  });
                  showToast('Notification preferences reset to defaults.');
                }}>
                  <Text style={{color: Colors.primary, fontSize: 13, fontWeight: '600'}}>Reset Defaults</Text>
                </Pressable>
              </View>

              <View style={styles.prefRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.prefTitle}>New Rental Requests</Text>
                  <Text style={styles.prefDesc}>Receive notifications when a new request is received, accepted, rejected or cancelled.</Text>
                </View>
                <Switch 
                  value={vendorProfile.notificationPreferences?.rentalRequests} 
                  onValueChange={() => toggleNotification('rentalRequests')}
                  trackColor={{ false: '#E2E8F0', true: Colors.primary + '80' }}
                  thumbColor={vendorProfile.notificationPreferences?.rentalRequests ? Colors.primary : '#94A3B8'}
                  activeThumbColor={Colors.primary}
                />
              </View>

              <View style={styles.prefRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.prefTitle}>Rental Status Updates</Text>
                  <Text style={styles.prefDesc}>Alerts for rentals starting, due today, overdue, returned or completed.</Text>
                </View>
                <Switch 
                  value={vendorProfile.notificationPreferences?.rentalStatus} 
                  onValueChange={() => toggleNotification('rentalStatus')}
                  trackColor={{ false: '#E2E8F0', true: Colors.primary + '80' }}
                  thumbColor={vendorProfile.notificationPreferences?.rentalStatus ? Colors.primary : '#94A3B8'}
                  activeThumbColor={Colors.primary}
                />
              </View>

              <View style={styles.prefRow}>
                <View style={{flex: 1}}>
                  <Text style={styles.prefTitle}>Inventory Alerts</Text>
                  <Text style={styles.prefDesc}>Notifications about low stock, unavailability and other inventory issues.</Text>
                </View>
                <Switch 
                  value={vendorProfile.notificationPreferences?.inventoryAlerts} 
                  onValueChange={() => toggleNotification('inventoryAlerts')}
                  trackColor={{ false: '#E2E8F0', true: Colors.primary + '80' }}
                  thumbColor={vendorProfile.notificationPreferences?.inventoryAlerts ? Colors.primary : '#94A3B8'}
                  activeThumbColor={Colors.primary}
                />
              </View>

              <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
                <View style={{flex: 1}}>
                  <Text style={styles.prefTitle}>Account & Admin Updates</Text>
                  <Text style={styles.prefDesc}>Receive important updates about your account status and verification.</Text>
                </View>
                <Switch 
                  value={vendorProfile.notificationPreferences?.accountUpdates} 
                  onValueChange={() => toggleNotification('accountUpdates')}
                  trackColor={{ false: '#E2E8F0', true: Colors.primary + '80' }}
                  thumbColor={vendorProfile.notificationPreferences?.accountUpdates ? Colors.primary : '#94A3B8'}
                  activeThumbColor={Colors.primary}
                />
              </View>
            </View>
          </View>

          {/* Side Column */}
          <View style={styles.colSide}>
            {/* Account Status */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Account Status</Text>
              
              <View style={styles.statusBox}>
                <Text style={{fontWeight: 'bold', color: '#1E293B', marginBottom: 4}}>
                  Status: <Text style={{color: STATUS_COLORS[vendorProfile.accountStatus]}}>{vendorProfile.accountStatus}</Text>
                </Text>
                <Text style={{color: '#64748B', fontSize: 13}}>{getStatusMessage(vendorProfile.accountStatus)}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Vendor ID</Text>
                <Text style={styles.infoValue}>{vendorProfile.vendorId}</Text>
              </View>
              
              <View style={[styles.infoRow, {borderBottomWidth: 0, paddingBottom: 0}]}>
                <Text style={styles.infoLabel}>Verification Status</Text>
                <Text style={[styles.infoValue, {color: STATUS_COLORS[vendorProfile.verificationStatus]}]}>{vendorProfile.verificationStatus}</Text>
              </View>
            </View>

            {/* Session */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Session</Text>
              <Text style={{fontSize: 13, color: '#64748B', marginBottom: 16}}>
                Log out of your MediUnify Vendor account on this device.
              </Text>
              <Pressable style={styles.dangerButton} onPress={() => setShowLogoutModal(true)}>
                <Ionicons name="log-out-outline" size={18} color={Colors.danger} style={{marginRight: 8}} />
                <Text style={styles.dangerButtonText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>

      {/* Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Pressable onPress={() => setShowPasswordModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.inputWrapModal}>
                <Text style={styles.fieldLabel}>Current Password *</Text>
                <TextInput style={[styles.input, passwordErrors.current && styles.inputError]} secureTextEntry value={passwordData.current} onChangeText={t => setPasswordData({...passwordData, current: t})} />
                {passwordErrors.current && <Text style={styles.errorText}>{passwordErrors.current}</Text>}
              </View>
              <View style={styles.inputWrapModal}>
                <Text style={styles.fieldLabel}>New Password *</Text>
                <TextInput style={[styles.input, passwordErrors.new && styles.inputError]} secureTextEntry value={passwordData.new} onChangeText={t => setPasswordData({...passwordData, new: t})} />
                {passwordErrors.new && <Text style={styles.errorText}>{passwordErrors.new}</Text>}
              </View>
              <View style={styles.inputWrapModal}>
                <Text style={styles.fieldLabel}>Confirm New Password *</Text>
                <TextInput style={[styles.input, passwordErrors.confirm && styles.inputError]} secureTextEntry value={passwordData.confirm} onChangeText={t => setPasswordData({...passwordData, confirm: t})} />
                {passwordErrors.confirm && <Text style={styles.errorText}>{passwordErrors.confirm}</Text>}
              </View>
              <View style={styles.modalActions}>
                <Pressable style={[styles.secondaryButton, {flex: 1}]} onPress={() => setShowPasswordModal(false)}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable>
                <Pressable style={[styles.primaryButton, {flex: 1}]} onPress={handleChangePassword}><Text style={styles.primaryButtonText}>Update Password</Text></Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Logout</Text>
              <Pressable onPress={() => setShowLogoutModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={{color: '#1E293B', fontSize: 16, fontWeight: '600', marginBottom: 8}}>Are you sure you want to logout?</Text>
              <Text style={{color: '#64748B', fontSize: 14, marginBottom: 24}}>You will be signed out of your MediUnify Vendor account.</Text>
              
              <View style={styles.modalActions}>
                <Pressable style={[styles.secondaryButton, {flex: 1}]} onPress={() => setShowLogoutModal(false)}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable>
                <Pressable style={[styles.dangerButtonFilled, {flex: 1}]} onPress={handleLogout}><Text style={styles.dangerButtonFilledText}>Logout</Text></Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {toast !== '' && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    marginBottom: 20
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748B' },
  
  grid: { flexDirection: 'row', gap: 20 },
  colMain: { flex: 2, gap: 20 },
  colSide: { flex: 1, gap: 20 },

  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 16, letterSpacing: 0.3 },

  infoRow: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  infoValue: { fontSize: 15, color: '#0F172A', fontWeight: '500', marginTop: 6 },

  prefRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  prefTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  prefDesc: { fontSize: 13, color: '#64748B', paddingRight: 20 },

  statusBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 8, marginBottom: 12 },

  inputWrapModal: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, color: '#64748B', fontWeight: '500', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 40, fontSize: 14, color: '#1E293B', ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  inputError: { borderColor: Colors.danger },
  errorText: { color: Colors.danger, fontSize: 12, marginTop: 4 },

  primaryButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  secondaryButton: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  
  dangerButton: { flexDirection: 'row', backgroundColor: '#FEF2F2', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FECACA' },
  dangerButtonText: { color: Colors.danger, fontSize: 14, fontWeight: '600' },
  dangerButtonFilled: { backgroundColor: Colors.danger, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dangerButtonFilledText: { color: '#fff', fontSize: 14, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 400, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  modalBody: { padding: 24 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },

  toast: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#1E293B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 100 },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '500' }
});

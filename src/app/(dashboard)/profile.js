import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Modal } from 'react-native';
import Colors from '../../constants/Colors';
import { useMockData } from '../../context/MockDataContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { vendorProfile, updateProfile, changePassword } = useMockData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...vendorProfile });
  const [errors, setErrors] = useState({});

  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [docModal, setDocModal] = useState({ visible: false, docType: null });
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

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const el = document.getElementById('dashboard-content-scroll');
      if (el) el.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }, []);

  const handleSaveProfile = () => {
    let newErrors = {};
    if (!formData.businessName) newErrors.businessName = 'Required';
    if (!formData.businessType) newErrors.businessType = 'Required';
    if (!formData.businessAddress) newErrors.businessAddress = 'Required';
    if (!formData.city) newErrors.city = 'Required';
    if (!formData.state) newErrors.state = 'Required';
    if (!formData.pincode) newErrors.pincode = 'Required';
    if (!formData.primaryContactName) newErrors.primaryContactName = 'Required';
    if (!formData.mobileNumber) newErrors.mobileNumber = 'Required';
    if (!formData.email) {
      newErrors.email = 'Required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    updateProfile(formData);
    setIsEditing(false);
    showToast('Profile updated successfully.');
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

  const handleReplaceDocument = (docKey) => {
    setDocModal({ visible: true, docType: docKey });
  };

  const submitDocument = () => {
    // Mocking document upload
    updateProfile({
      [docModal.docType]: {
        ...vendorProfile[docModal.docType],
        status: 'Pending Verification',
        name: 'New_Document_Uploaded.pdf'
      }
    });
    setDocModal({ visible: false, docType: null });
    showToast('Document submitted for verification.');
  };

  return (
    <View style={styles.container}>
      {/* Dark Blue Header Card */}
        <View style={styles.darkHeaderCard}>
          <View style={styles.darkHeaderTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.darkAvatar}>
                 <Text style={styles.darkAvatarText}>{vendorProfile.businessName ? vendorProfile.businessName.charAt(0).toUpperCase() : 'V'}</Text>
              </View>
              <View style={{ marginLeft: 16 }}>
                <Text style={styles.darkTitle}>{vendorProfile.businessName}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 4 }}>
                   <Ionicons name="briefcase-outline" size={14} color="#94A3B8" />
                   <Text style={styles.darkSubtitle}> {vendorProfile.businessType}</Text>
                </View>
                <Text style={styles.darkSubtitleSmall}>ID: {vendorProfile.vendorId}  •  Joined: {new Date(vendorProfile.createdAt).toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</Text>
              </View>
            </View>
            {!isEditing && (
              <Pressable style={styles.darkEditBtn} onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil" size={12} color="#fff" style={{marginRight: 4}} />
                <Text style={styles.darkEditBtnText}>Edit Profile</Text>
              </Pressable>
            )}
          </View>
          
          <View style={styles.darkMetricsRow}>
            <View style={styles.darkMetricBox}>
              <View style={styles.darkMetricIcon}><Ionicons name="star" size={16} color="#FBBF24" /></View>
              <View>
                 <Text style={styles.darkMetricValue}>4.95</Text>
                 <Text style={styles.darkMetricLabel}>RATING</Text>
              </View>
            </View>
            <View style={styles.darkMetricBox}>
              <View style={styles.darkMetricIcon}><Ionicons name="checkmark-done-circle" size={16} color="#4AD6A1" /></View>
              <View>
                 <Text style={styles.darkMetricValue}>124</Text>
                 <Text style={styles.darkMetricLabel}>COMPLETED RENTALS</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: vendorProfile.verificationStatus === 'Verified' ? Colors.success : Colors.warning, paddingVertical: 16, paddingHorizontal: 20 }]}>
           <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
              <View style={{width: 32, height: 32, borderRadius: 16, backgroundColor: vendorProfile.verificationStatus === 'Verified' ? '#D1FAE5' : '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 12}}>
                 <Ionicons name={vendorProfile.verificationStatus === 'Verified' ? 'ribbon-outline' : 'time-outline'} size={16} color={vendorProfile.verificationStatus === 'Verified' ? Colors.success : Colors.warning} />
              </View>
              <View style={{flex: 1}}>
                 <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
                    <Text style={{fontSize: 13, fontWeight: '700', color: '#1E293B'}}>Vendor Verification & Platform Authorization</Text>
                    <Text style={{fontSize: 10, fontWeight: '800', color: vendorProfile.verificationStatus === 'Verified' ? Colors.success : Colors.warning, letterSpacing: 0.5}}>
                      {vendorProfile.verificationStatus === 'Verified' ? 'ACTIVE & VERIFIED' : vendorProfile.verificationStatus.toUpperCase()}
                    </Text>
                 </View>
                 <Text style={{fontSize: 12, color: '#64748B', lineHeight: 18}}>
                   {vendorProfile.verificationStatus === 'Verified' 
                     ? 'Authorized for listing and renting medical equipment on the MediUnify platform under national healthcare guidelines.' 
                     : 'Your account is currently under review or requires attention to be fully authorized.'}
                 </Text>
                 <View style={{flexDirection: 'row', marginTop: 10, gap: 24}}>
                    <Text style={{fontSize: 11, fontWeight: '600', color: '#334155'}}>Account Status: <Text style={{color: '#0F172A'}}>{vendorProfile.accountStatus}</Text></Text>
                    <Text style={{fontSize: 11, fontWeight: '600', color: '#334155'}}>Verification Ref: <Text style={{color: '#0F172A'}}>VU-{vendorProfile.vendorId.replace('VEND-', '')}-2026</Text></Text>
                 </View>
              </View>
           </View>
        </View>

        {isEditing ? (
          <>
            {/* Business Information Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Business Information</Text>
              <View style={{gap: 16}}>
                <View style={styles.fieldRowEdit}><Text style={styles.fieldLabel}>Business Name *</Text><TextInput style={[styles.input, errors.businessName && styles.inputError]} value={formData.businessName} onChangeText={t => setFormData({...formData, businessName: t})} /></View>
                <View style={styles.fieldRowEdit}><Text style={styles.fieldLabel}>Business Type *</Text><TextInput style={[styles.input, errors.businessType && styles.inputError]} value={formData.businessType} onChangeText={t => setFormData({...formData, businessType: t})} /></View>
                <View style={styles.fieldRowEdit}><Text style={styles.fieldLabel}>Address *</Text><TextInput style={[styles.input, errors.businessAddress && styles.inputError]} value={formData.businessAddress} onChangeText={t => setFormData({...formData, businessAddress: t})} /></View>
                <View style={{flexDirection: 'row', gap: 16}}>
                  <View style={[styles.fieldRowEdit, {flex: 1}]}><Text style={styles.fieldLabel}>City *</Text><TextInput style={[styles.input, errors.city && styles.inputError]} value={formData.city} onChangeText={t => setFormData({...formData, city: t})} /></View>
                  <View style={[styles.fieldRowEdit, {flex: 1}]}><Text style={styles.fieldLabel}>State *</Text><TextInput style={[styles.input, errors.state && styles.inputError]} value={formData.state} onChangeText={t => setFormData({...formData, state: t})} /></View>
                  <View style={[styles.fieldRowEdit, {flex: 1}]}><Text style={styles.fieldLabel}>Pincode *</Text><TextInput style={[styles.input, errors.pincode && styles.inputError]} value={formData.pincode} onChangeText={t => setFormData({...formData, pincode: t})} keyboardType="numeric" /></View>
                </View>
              </View>
            </View>

            {/* Personal & Contact Information Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Personal & Contact Information</Text>
              <View style={{gap: 16}}>
                <View style={styles.fieldRowEdit}><Text style={styles.fieldLabel}>Contact Person *</Text><TextInput style={[styles.input, errors.primaryContactName && styles.inputError]} value={formData.primaryContactName} onChangeText={t => setFormData({...formData, primaryContactName: t})} /></View>
                <View style={{flexDirection: 'row', gap: 16}}>
                  <View style={[styles.fieldRowEdit, {flex: 1}]}><Text style={styles.fieldLabel}>Mobile Number *</Text><TextInput style={[styles.input, errors.mobileNumber && styles.inputError]} value={formData.mobileNumber} onChangeText={t => setFormData({...formData, mobileNumber: t})} keyboardType="phone-pad" /></View>
                  <View style={[styles.fieldRowEdit, {flex: 1}]}><Text style={styles.fieldLabel}>Email Address *</Text><TextInput style={[styles.input, errors.email && styles.inputError]} value={formData.email} onChangeText={t => setFormData({...formData, email: t})} keyboardType="email-address" autoCapitalize="none" /></View>
                </View>
              </View>
            </View>

            <View style={styles.editActions}>
              <Pressable style={[styles.secondaryButton, { marginRight: 12 }]} onPress={() => { setIsEditing(false); setFormData(vendorProfile); setErrors({}); }}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={handleSaveProfile}>
                <Text style={styles.primaryButtonText}>Save Changes</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.grid}>
            {/* Left Column */}
            <View style={styles.colMain}>
              {/* Business Information Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Business Information</Text>
                <View style={styles.infoGridRow}>
                  <View style={styles.infoGridItem}>
                     <Ionicons name="business-outline" size={16} color="#94A3B8" style={{marginTop: 2}} />
                     <View style={{marginLeft: 12, flex: 1}}>
                        <Text style={styles.infoGridLabel}>Business Name</Text>
                        <Text style={styles.infoGridValue}>{vendorProfile.businessName || '-'}</Text>
                     </View>
                  </View>
                  <View style={styles.infoGridItem}>
                     <Ionicons name="briefcase-outline" size={16} color="#94A3B8" style={{marginTop: 2}} />
                     <View style={{marginLeft: 12, flex: 1}}>
                        <Text style={styles.infoGridLabel}>Business Type</Text>
                        <Text style={styles.infoGridValue}>{vendorProfile.businessType || '-'}</Text>
                     </View>
                  </View>
                  <View style={styles.infoGridItem}>
                     <Ionicons name="location-outline" size={16} color="#94A3B8" style={{marginTop: 2}} />
                     <View style={{marginLeft: 12, flex: 1}}>
                        <Text style={styles.infoGridLabel}>Address & City</Text>
                        <Text style={styles.infoGridValue}>{vendorProfile.businessAddress}, {vendorProfile.city} ({vendorProfile.pincode})</Text>
                     </View>
                  </View>
                </View>
              </View>

              {/* Documents Section */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Documents & Proofs</Text>
                {[
                  { key: 'businessRegistrationDocument', label: 'Business Registration / License' },
                  { key: 'governmentIdDocument', label: 'Government ID Proof' },
                  { key: 'addressProofDocument', label: 'Address Proof' }
                ].map(doc => {
                  const docData = vendorProfile[doc.key];
                  return (
                    <View key={doc.key} style={styles.docRow}>
                      <View style={{flex: 1}}>
                        <Text style={{fontWeight: '600', color: '#1E293B', fontSize: 13, marginBottom: 4}}>{doc.label}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                          <Text style={{fontSize: 12, color: '#64748B'}}>{docData?.name || 'No document'}</Text>
                          {docData && (
                            <View style={[styles.badge, { backgroundColor: STATUS_COLORS[docData.status] + '15', paddingVertical: 2, paddingHorizontal: 6 }]}>
                              <Text style={[styles.badgeText, { color: STATUS_COLORS[docData.status], fontSize: 10 }]}>{docData.status}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={{flexDirection: 'row', gap: 16}}>
                        {docData && (
                          <Pressable><Text style={{color: Colors.primary, fontWeight: '600', fontSize: 13}}>View</Text></Pressable>
                        )}
                        <Pressable onPress={() => handleReplaceDocument(doc.key)}>
                          <Text style={{color: Colors.primary, fontWeight: '600', fontSize: 13}}>Replace</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.colSide}>
              {/* Personal & Contact Information Card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Personal & Contact Information</Text>
                <View style={styles.infoGridRow}>
                  <View style={styles.infoGridItem}>
                     <Ionicons name="call-outline" size={16} color="#94A3B8" style={{marginTop: 2}} />
                     <View style={{marginLeft: 12, flex: 1}}>
                        <Text style={styles.infoGridLabel}>Mobile Number</Text>
                        <Text style={styles.infoGridValue}>{vendorProfile.mobileNumber || '-'}</Text>
                     </View>
                  </View>
                  <View style={styles.infoGridItem}>
                     <Ionicons name="mail-outline" size={16} color="#94A3B8" style={{marginTop: 2}} />
                     <View style={{marginLeft: 12, flex: 1}}>
                        <Text style={styles.infoGridLabel}>Email Address</Text>
                        <Text style={styles.infoGridValue}>{vendorProfile.email || '-'}</Text>
                     </View>
                  </View>
                  <View style={styles.infoGridItem}>
                     <Ionicons name="person-outline" size={16} color="#94A3B8" style={{marginTop: 2}} />
                     <View style={{marginLeft: 12, flex: 1}}>
                        <Text style={styles.infoGridLabel}>Contact Person</Text>
                        <Text style={styles.infoGridValue}>{vendorProfile.primaryContactName || '-'}</Text>
                     </View>
                  </View>
                </View>
              </View>

              {/* Account Security Section */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Account Security</Text>
                <Text style={{fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 20}}>
                  Update your password regularly to keep your vendor account secure.
                </Text>
                <Pressable style={styles.secondaryButton} onPress={() => setShowPasswordModal(true)}>
                  <Ionicons name="lock-closed-outline" size={16} color="#475569" style={{marginRight: 8}} />
                  <Text style={styles.secondaryButtonText}>Change Password</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

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
                <Text style={styles.fieldLabel}>Current Password</Text>
                <TextInput style={[styles.input, passwordErrors.current && styles.inputError]} secureTextEntry value={passwordData.current} onChangeText={t => setPasswordData({...passwordData, current: t})} />
                {passwordErrors.current && <Text style={styles.errorText}>{passwordErrors.current}</Text>}
              </View>
              <View style={styles.inputWrapModal}>
                <Text style={styles.fieldLabel}>New Password</Text>
                <TextInput style={[styles.input, passwordErrors.new && styles.inputError]} secureTextEntry value={passwordData.new} onChangeText={t => setPasswordData({...passwordData, new: t})} />
                {passwordErrors.new && <Text style={styles.errorText}>{passwordErrors.new}</Text>}
              </View>
              <View style={styles.inputWrapModal}>
                <Text style={styles.fieldLabel}>Confirm New Password</Text>
                <TextInput style={[styles.input, passwordErrors.confirm && styles.inputError]} secureTextEntry value={passwordData.confirm} onChangeText={t => setPasswordData({...passwordData, confirm: t})} />
                {passwordErrors.confirm && <Text style={styles.errorText}>{passwordErrors.confirm}</Text>}
              </View>
              <View style={styles.modalActions}>
                <Pressable style={[styles.secondaryButton, {flex: 1}]} onPress={() => setShowPasswordModal(false)}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable>
                <Pressable style={[styles.primaryButton, {flex: 1}]} onPress={handleChangePassword}><Text style={styles.primaryButtonText}>Change Password</Text></Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Document Replacement Modal */}
      <Modal visible={docModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Replace Document</Text>
              <Pressable onPress={() => setDocModal({visible: false, docType: null})}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text style={{color: '#1E293B', marginBottom: 16}}>Replace this verification document?</Text>
              <Text style={{color: '#64748B', fontSize: 13, marginBottom: 24}}>Supported formats: PDF, JPG, PNG.</Text>
              <View style={styles.uploadBox}>
                <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
                <Text style={{color: Colors.primary, marginTop: 8, fontWeight: '600'}}>Click to browse files</Text>
              </View>
              <View style={styles.modalActions}>
                <Pressable style={[styles.secondaryButton, {flex: 1}]} onPress={() => setDocModal({visible: false, docType: null})}><Text style={styles.secondaryButtonText}>Cancel</Text></Pressable>
                <Pressable style={[styles.primaryButton, {flex: 1}]} onPress={submitDocument}><Text style={styles.primaryButtonText}>Replace</Text></Pressable>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 2 },
  subtitle: { fontSize: 13, color: '#64748B' },
  
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: 16, 
    padding: 24, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 16 },

  darkHeaderCard: { 
    backgroundColor: '#022B54', 
    borderRadius: 16, 
    padding: 24, 
    marginBottom: 20, 
    boxShadow: '0 8px 24px rgba(2, 43, 84, 0.15)',
  },
  darkHeaderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  darkAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0EA5E9', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  darkAvatarText: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  darkTitle: { fontSize: 18, fontWeight: 'bold', color: '#ffffff' },
  darkSubtitle: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  darkSubtitleSmall: { fontSize: 11, color: '#64748B', marginTop: 6 },
  darkEditBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  darkEditBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '600' },
  darkMetricsRow: { flexDirection: 'row', gap: 12 },
  darkMetricBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F3B6A', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  darkMetricIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  darkMetricValue: { fontSize: 14, fontWeight: 'bold', color: '#ffffff', marginBottom: 1 },
  darkMetricLabel: { fontSize: 9, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 },

  grid: { flexDirection: 'row', gap: 20 },
  colMain: { flex: 1.1, gap: 20 },
  colSide: { flex: 0.9, gap: 20 },

  infoGridRow: { gap: 16 },
  infoGridItem: { flexDirection: 'row', alignItems: 'flex-start' },
  infoGridLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 2, letterSpacing: 0.2 },
  infoGridValue: { fontSize: 13, color: '#0F172A', fontWeight: '600', lineHeight: 18 },

  fieldRowEdit: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, color: '#475569', fontWeight: '600', marginBottom: 6 },
  inputWrap: { marginTop: 4 },
  inputWrapModal: { marginBottom: 16 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingHorizontal: 12, height: 40, fontSize: 14, color: '#1E293B', ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  inputError: { borderColor: Colors.danger },
  errorText: { color: Colors.danger, fontSize: 12, marginTop: 4 },

  infoRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 6 },
  infoValue: { fontSize: 15, color: '#0F172A', fontWeight: '600' },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '600' },

  primaryButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  secondaryButton: { flexDirection: 'row', backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: '#475569', fontSize: 13, fontWeight: '700' },

  editActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, marginBottom: 24 },

  statusBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 8, marginBottom: 20 },
  docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 450, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  modalBody: { padding: 24 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },

  uploadBox: { height: 120, borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC', marginBottom: 24 },

  toast: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#1E293B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 10, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', zIndex: 100 },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '500' }
});

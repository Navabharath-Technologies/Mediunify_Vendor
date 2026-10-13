import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, Alert, Modal } from 'react-native';
import Colors from '../../constants/Colors';
import { useMockData } from '../../context/MockDataContext';
import { Ionicons } from '@expo/vector-icons';

const STATUS_COLORS = {
  'New Request': Colors.primary,
  'Rental Confirmed': Colors.success,
  'Payment Received': Colors.success,
  'Preparing': Colors.warning,
  'Ready for Delivery': Colors.success,
  'Delivered': Colors.success,
  'Rejected': Colors.danger,
  'Cancelled': Colors.textLight,
  'Completed': Colors.success
};

export default function RequestsScreen() {
  const { requests, equipment, confirmRental, rejectRequest, startPreparing, markReadyForDelivery, markAsDelivered, markPaymentReceived, simulateNewRequest } = useMockData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [viewRequest, setViewRequest] = useState(null);
  
  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAmount, setConfirmAmount] = useState('');
  const [confirmDuration, setConfirmDuration] = useState('');
  const [confirmQuantity, setConfirmQuantity] = useState('');
  const [vendorNotes, setVendorNotes] = useState('');

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('Equipment unavailable');
  const [rejectOtherReason, setRejectOtherReason] = useState('');

  // Derived filters
  const categories = ['All', ...new Set(requests.map(r => r.category).filter(Boolean))];

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Status Filter
      if (statusFilter !== 'All' && req.status !== statusFilter) return false;
      // Category Filter
      if (categoryFilter !== 'All' && req.category !== categoryFilter) return false;
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = 
          (req.id && req.id.toLowerCase().includes(q)) ||
          (req.equipmentName && req.equipmentName.toLowerCase().includes(q)) ||
          (req.customerName && req.customerName.toLowerCase().includes(q)) ||
          (req.category && req.category.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [requests, statusFilter, categoryFilter, searchQuery]);

  const summary = {
    newReqs: requests.filter(r => r.status === 'New Request').length,
    confirmed: requests.filter(r => ['Rental Confirmed', 'Payment Received', 'Preparing', 'Ready for Delivery'].includes(r.status)).length,
    rejected: requests.filter(r => r.status === 'Rejected').length,
    delivered: requests.filter(r => r.status === 'Delivered').length,
    total: requests.length
  };

  const handleOpenConfirm = () => {
    if (!currentView) return;
    setConfirmAmount(currentView.agreedRentalAmount ? currentView.agreedRentalAmount.toString() : (currentView.totalAmount ? currentView.totalAmount.toString() : ''));
    setConfirmDuration(currentView.rentalDuration || '');
    setConfirmQuantity(currentView.quantity ? currentView.quantity.toString() : '1');
    setVendorNotes(currentView.vendorNotes || '');
    setShowConfirmModal(true);
  };

  const handleOpenReject = () => {
    setRejectReason('Equipment unavailable');
    setRejectOtherReason('');
    setShowRejectModal(true);
  };

  const handleAction = (actionType) => {
    if (!currentView) return;
    
    const confirmWeb = (msg) => {
      if (Platform.OS === 'web') return window.confirm(msg);
      return true;
    };

    switch (actionType) {
      case 'confirm_submit':
        if (!confirmAmount || !confirmDuration || !confirmQuantity) {
          const err = "Please fill in agreed amount, duration, and quantity.";
          if (Platform.OS === 'web') window.alert(err);
          else Alert.alert("Missing Fields", err);
          return;
        }
        confirmRental(currentView.id, parseFloat(confirmAmount), confirmDuration, parseInt(confirmQuantity, 10), vendorNotes);
        setShowConfirmModal(false);
        if (Platform.OS === 'web') window.alert("Rental confirmed successfully!");
        else Alert.alert("Success", "Rental confirmed successfully!");
        break;
      case 'mark_payment':
        if (confirmWeb("Have you received the agreed rental payment from the customer?")) {
           markPaymentReceived(currentView.id);
        }
        break;
      case 'reject_confirm':
        const finalReason = rejectReason === 'Other' ? rejectOtherReason : rejectReason;
        if (!finalReason.trim()) {
          const err = "Please provide a reason for rejecting this request.";
          if (Platform.OS === 'web') window.alert(err);
          else Alert.alert("Reason Required", err);
          return;
        }
        rejectRequest(currentView.id, finalReason);
        setShowRejectModal(false);
        setRejectOtherReason('');
        break;
      case 'prepare':
        if (confirmWeb("Mark this equipment as being prepared?")) {
           startPreparing(currentView.id);
        }
        break;
      case 'ready':
        if (confirmWeb("Is the requested equipment prepared and ready for delivery?")) {
           markReadyForDelivery(currentView.id);
        }
        break;
      case 'deliver':
        if (confirmWeb("Confirm that this equipment has been delivered to the customer?")) {
           const res = markAsDelivered(currentView.id);
           if (res && !res.success) {
             if (Platform.OS === 'web') window.alert(res.message);
             else Alert.alert("Error", res.message);
           }
        }
        break;
    }
  };

  // Ensure viewRequest stays updated
  const currentView = viewRequest ? requests.find(r => r.id === viewRequest.id) || viewRequest : null;

  if (currentView) {
    const isNew = currentView.status === 'New Request';

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={styles.title}>Rental Request {currentView.id}</Text>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[currentView.status] + '15' }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[currentView.status] }]}>{currentView.status}</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>Created on {currentView.createdAt ? new Date(currentView.createdAt).toLocaleDateString() : 'Recent'}</Text>
            </View>
            <Pressable style={styles.secondaryButton} onPress={() => setViewRequest(null)}>
              <Ionicons name="arrow-back" size={16} color={Colors.text} style={{ marginRight: 6 }} />
              <Text style={styles.secondaryButtonText}>Back to Requests</Text>
            </Pressable>
          </View>

          <View style={styles.detailGrid}>
            {/* Left Column */}
            <View style={styles.detailColMain}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Request Information</Text>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Request ID</Text><Text style={styles.infoValue}>{currentView.id}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Request Date</Text><Text style={styles.infoValue}>{currentView.createdAt}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Requested Start</Text><Text style={styles.infoValue}>{currentView.requestedStartDate}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Requested End</Text><Text style={styles.infoValue}>{currentView.requestedEndDate}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Rental Duration</Text><Text style={styles.infoValue}>{currentView.rentalDuration}</Text></View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Equipment Details</Text>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Equipment Name</Text><Text style={styles.infoValue}>{currentView.equipmentName}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Category</Text><Text style={styles.infoValue}>{currentView.category}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Type</Text><Text style={styles.infoValue}>{currentView.equipmentType}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Qty Requested</Text><Text style={[styles.infoValue, {fontWeight: 'bold'}]}>{currentView.quantity}</Text></View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Activity Timeline</Text>
                {currentView.activityTimeline?.map((act, idx) => (
                  <View key={idx} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.timelineTime}>{act.time}</Text>
                      <Text style={styles.timelineText}>{act.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Right Column */}
            <View style={styles.detailColSide}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Customer Information</Text>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Name</Text><Text style={styles.infoValue}>{currentView.customerName}</Text></View>
                <View style={styles.infoRow}><Text style={styles.infoLabel}>Mobile</Text><Text style={styles.infoValue}>{currentView.mobileNumber}</Text></View>
                {currentView.email && (
                  <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{currentView.email}</Text></View>
                )}
                
                <Text style={[styles.cardTitle, {marginTop: 20, fontSize: 13}]}>FULFILMENT LOCATION</Text>
                <Text style={[styles.infoValue, {marginBottom: 4}]}>{currentView.deliveryAddress}</Text>
                <Text style={styles.infoValue}>{currentView.city} - {currentView.pincode}</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>{isNew ? 'Agreed Rental Details' : 'Final Agreed Details'}</Text>
                {isNew ? (
                  <View>
                    <Text style={[styles.infoLabel, { marginBottom: 12 }]}>To be confirmed after discussing with customer.</Text>
                    <View style={styles.infoRow}><Text style={styles.infoLabel}>Requested Duration</Text><Text style={styles.infoValue}>{currentView.rentalDuration}</Text></View>
                    <View style={styles.infoRow}><Text style={styles.infoLabel}>Estimated Total</Text><Text style={[styles.infoValue, {fontWeight: 'bold'}]}>₹{currentView.totalAmount}</Text></View>
                  </View>
                ) : (
                  <View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Agreed Amount</Text>
                      <Text style={[styles.infoValue, {fontWeight: 'bold', fontSize: 16, color: Colors.primary}]}>
                        ₹{currentView.agreedRentalAmount || currentView.totalAmount}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Confirmed Duration</Text>
                      <Text style={styles.infoValue}>{currentView.rentalDuration}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Confirmed Qty</Text>
                      <Text style={styles.infoValue}>{currentView.confirmedQuantity || currentView.quantity}</Text>
                    </View>
                    {currentView.vendorNotes ? (
                      <View style={{ marginTop: 10, padding: 10, backgroundColor: '#F8FAFC', borderRadius: 8 }}>
                        <Text style={[styles.infoLabel, { marginBottom: 4 }]}>Vendor Notes:</Text>
                        <Text style={[styles.infoValue, { fontStyle: 'italic' }]}>{currentView.vendorNotes}</Text>
                      </View>
                    ) : null}
                  </View>
                )}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Actions</Text>
                
                {isNew && (
                  <View style={{ gap: 12 }}>
                    <Pressable 
                      style={[styles.secondaryButton, { borderColor: Colors.primary }]} 
                      onPress={() => { if (Platform.OS === 'web') window.location.href = `tel:${currentView.mobileNumber}`; }}
                    >
                      <Ionicons name="call-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                      <Text style={[styles.secondaryButtonText, { color: Colors.primary }]}>Call Customer</Text>
                    </Pressable>

                    <Pressable 
                      style={[styles.primaryButton, { backgroundColor: Colors.success }]} 
                      onPress={handleOpenConfirm}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.primaryButtonText}>Confirm Rental</Text>
                    </Pressable>

                    <Pressable 
                      style={[styles.secondaryButton, { borderColor: Colors.danger }]} 
                      onPress={handleOpenReject}
                    >
                      <Ionicons name="close-circle-outline" size={16} color={Colors.danger} style={{ marginRight: 6 }} />
                      <Text style={[styles.secondaryButtonText, { color: Colors.danger }]}>Reject Request</Text>
                    </Pressable>
                  </View>
                )}

                {currentView.status === 'Rental Confirmed' && (
                  <Pressable style={styles.primaryButton} onPress={() => handleAction('mark_payment')}>
                    <Ionicons name="card-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryButtonText}>Mark Payment Received</Text>
                  </Pressable>
                )}

                {currentView.status === 'Payment Received' && (
                  <Pressable style={styles.primaryButton} onPress={() => handleAction('prepare')}>
                    <Ionicons name="build-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryButtonText}>Start Preparing</Text>
                  </Pressable>
                )}

                {currentView.status === 'Preparing' && (
                  <Pressable style={styles.primaryButton} onPress={() => handleAction('ready')}>
                    <Ionicons name="cube-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryButtonText}>Mark Ready for Delivery</Text>
                  </Pressable>
                )}

                {currentView.status === 'Ready for Delivery' && (
                  <Pressable style={styles.primaryButton} onPress={() => handleAction('deliver')}>
                    <Ionicons name="checkmark-done-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryButtonText}>Mark as Delivered</Text>
                  </Pressable>
                )}

                {['Rejected', 'Cancelled', 'Completed', 'Delivered'].includes(currentView.status) && (
                  <Text style={styles.infoLabel}>No further actions required. Request is {currentView.status.toLowerCase()}.</Text>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Rock-solid, Full-Screen Confirm Rental Request Modal */}
        <Modal
          visible={showConfirmModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowConfirmModal(false)} />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalTitle}>Confirm Rental Request</Text>
                  <Text style={styles.modalSubtitle}>Enter the final details agreed upon with the customer.</Text>
                </View>
                <Pressable style={styles.closeBtn} onPress={() => setShowConfirmModal(false)}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </Pressable>
              </View>

              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Final Agreed Rental Amount (₹) *</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  placeholder="e.g. 2600"
                  placeholderTextColor="#94A3B8"
                  value={confirmAmount} 
                  onChangeText={setConfirmAmount} 
                />

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Confirmed Rental Duration *</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="e.g. 5 Days"
                  placeholderTextColor="#94A3B8"
                  value={confirmDuration} 
                  onChangeText={setConfirmDuration} 
                />

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Quantity *</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric" 
                  placeholder="e.g. 1"
                  placeholderTextColor="#94A3B8"
                  value={confirmQuantity} 
                  onChangeText={setConfirmQuantity} 
                />

                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Vendor Notes (Optional)</Text>
                <TextInput 
                  style={[styles.input, { height: 75, textAlignVertical: 'top' }]} 
                  multiline 
                  placeholder="Special instructions, condition notes..."
                  placeholderTextColor="#94A3B8"
                  value={vendorNotes} 
                  onChangeText={setVendorNotes} 
                />
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable style={styles.secondaryButton} onPress={() => setShowConfirmModal(false)}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.primaryButton, { backgroundColor: Colors.success }]} 
                  onPress={() => handleAction('confirm_submit')}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryButtonText}>Confirm Rental</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Reject Modal */}
        <Modal
          visible={showRejectModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowRejectModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowRejectModal(false)} />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.modalTitle}>Reject Rental Request</Text>
                  <Text style={styles.modalSubtitle}>Please select the reason for rejecting this request.</Text>
                </View>
                <Pressable style={styles.closeBtn} onPress={() => setShowRejectModal(false)}>
                  <Ionicons name="close" size={20} color="#64748B" />
                </Pressable>
              </View>

              <View style={{ marginBottom: 20 }}>
                <Text style={styles.inputLabel}>Reason for Rejection *</Text>
                {Platform.OS === 'web' ? (
                  <select 
                    style={styles.nativeSelectFull} 
                    value={rejectReason} 
                    onChange={(e) => setRejectReason(e.target.value)}
                  >
                    <option value="Equipment unavailable">Equipment unavailable</option>
                    <option value="Insufficient quantity">Insufficient quantity</option>
                    <option value="Equipment under maintenance">Equipment under maintenance</option>
                    <option value="Service area not supported">Service area not supported</option>
                    <option value="Rental dates unavailable">Rental dates unavailable</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <TextInput style={styles.input} value={rejectReason} onChangeText={setRejectReason} />
                )}
                
                {rejectReason === 'Other' && (
                  <TextInput 
                    style={[styles.input, { marginTop: 10, minHeight: 70 }]} 
                    placeholder="Enter custom rejection reason..." 
                    placeholderTextColor="#94A3B8"
                    multiline
                    value={rejectOtherReason}
                    onChangeText={setRejectOtherReason}
                  />
                )}
              </View>

              <View style={styles.modalActions}>
                <Pressable style={styles.secondaryButton} onPress={() => setShowRejectModal(false)}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.primaryButton, { backgroundColor: Colors.danger }]} 
                  onPress={() => handleAction('reject_confirm')}
                >
                  <Text style={styles.primaryButtonText}>Reject Request</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.unifiedCard}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Rental Requests</Text>
            <Text style={styles.subtitle}>Review and manage incoming equipment rental requests.</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => {
            const newId = simulateNewRequest();
            if (Platform.OS === 'web') window.alert(`Simulated new request: ${newId}`);
            else Alert.alert('Success', `Simulated new request: ${newId}`);
          }}>
            <Ionicons name="add" size={16} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.primaryButtonText}>Simulate Request</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.newReqs}</Text>
            <Text style={styles.statLabel}>New Requests</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: Colors.success}]}>{summary.confirmed}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: Colors.danger}]}>{summary.rejected}</Text>
            <Text style={styles.statLabel}>Rejected</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, {color: Colors.primary}]}>{summary.delivered}</Text>
            <Text style={styles.statLabel}>Delivered</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{summary.total}</Text>
            <Text style={styles.statLabel}>Total Requests</Text>
          </View>
        </View>

        <View style={styles.toolbar}>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search by ID, Equipment, Customer..." 
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View style={styles.filters}>
            <View style={styles.selectWrapper}>
              {Platform.OS === 'web' ? (
                <select style={styles.nativeSelect} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              ) : <Text>Category Filter</Text>}
            </View>
            <View style={styles.selectWrapper}>
              {Platform.OS === 'web' ? (
                <select style={styles.nativeSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Statuses</option>
                  <option value="New Request">New Request</option>
                  <option value="Rental Confirmed">Rental Confirmed</option>
                  <option value="Payment Received">Payment Received</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready for Delivery">Ready for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              ) : <Text>Status Filter</Text>}
            </View>
            <Pressable style={[styles.secondaryButton, {paddingVertical: 8}]} onPress={() => {setSearchQuery(''); setStatusFilter('All'); setCategoryFilter('All');}}>
              <Text style={styles.secondaryButtonText}>Clear Filters</Text>
            </Pressable>
          </View>
        </View>

        {filteredRequests.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="document-text-outline" size={48} color={Colors.primary} style={{ opacity: 0.5, marginBottom: 12 }} />
            <Text style={{fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 8}}>No Rental Requests Found</Text>
            <Text style={{color: Colors.textLight, textAlign: 'center'}}>Rental requests from customers will appear here when your equipment is requested.</Text>
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 1.2 }]}>REQUEST ID</Text>
              <Text style={[styles.th, { flex: 2 }]}>EQUIPMENT</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>CUSTOMER</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>DURATION & QTY</Text>
              <Text style={[styles.th, { flex: 1 }]}>AMOUNT</Text>
              <Text style={[styles.th, { flex: 1.2, textAlign: 'center' }]}>STATUS</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>ACTIONS</Text>
            </View>
            {filteredRequests.map((req, index, arr) => (
              <View key={req.id} style={[styles.tableRow, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={[styles.reqId, { flex: 1.2 }]}>{req.id}</Text>
                <View style={{ flex: 2 }}>
                  <Text style={styles.tableName}>{req.equipmentName}</Text>
                  <Text style={styles.tableCategory}>{req.category}</Text>
                </View>
                <Text style={[styles.td, { flex: 1.5 }]}>{req.customerName}</Text>
                <Text style={[styles.td, { flex: 1.5 }]}>{req.rentalDuration} • Qty: {req.confirmedQuantity || req.quantity}</Text>
                <Text style={[styles.td, { flex: 1, fontWeight: 'bold' }]}>₹{req.agreedRentalAmount || req.totalAmount || '-'}</Text>
                <View style={{ flex: 1.2, alignItems: 'center' }}>
                  <View style={[styles.badge, { backgroundColor: STATUS_COLORS[req.status] + '15' }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLORS[req.status] }]}>{req.status}</Text>
                  </View>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Pressable style={styles.actionBtn} onPress={() => setViewRequest(req)}>
                    <Text style={styles.actionBtnText}>View</Text>
                  </Pressable>
                </View>
              </View>
            ))}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  subtitle: { fontSize: 13, color: Colors.textLight },
  
  primaryButton: { flexDirection: 'row', backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  
  secondaryButton: { flexDirection: 'row', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  secondaryButtonText: { color: Colors.text, fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, minWidth: 120, backgroundColor: '#F8FAFC', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 3 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600' },

  toolbar: { flexDirection: 'row', gap: 12, marginBottom: 16, flexWrap: 'wrap' },
  searchInput: { flex: 1, minWidth: 200, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, paddingVertical: 9, paddingHorizontal: 14, fontSize: 13, backgroundColor: '#F8FAFC', outlineStyle: 'none' },
  filters: { flexDirection: 'row', gap: 10 },
  selectWrapper: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#F8FAFC', overflow: 'hidden' },
  nativeSelect: { paddingVertical: 9, paddingHorizontal: 12, fontSize: 13, color: '#1E293B', borderWidth: 0, backgroundColor: 'transparent', minWidth: 140, outlineStyle: 'none' },
  nativeSelectFull: { width: '100%', paddingVertical: 8, paddingHorizontal: 10, fontSize: 13, color: '#1E293B', borderColor: '#CBD5E1', borderWidth: 1, borderRadius: 6, backgroundColor: '#fff' },

  emptyStateContainer: { padding: 40, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 },
  
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' },
  
  table: { width: '100%', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 20, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', alignItems: 'center' },
  th: { fontSize: 11, fontWeight: '700', color: '#64748B', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  reqId: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  tableName: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 2 },
  tableCategory: { fontSize: 12, color: '#64748B' },
  td: { fontSize: 13, color: '#475569' },
  
  actionBtn: { backgroundColor: '#F0F9FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  actionBtnText: { color: Colors.primary, fontWeight: '700', fontSize: 12 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  detailGrid: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },
  detailColMain: { flex: 2, minWidth: 320 },
  detailColSide: { flex: 1, minWidth: 300 },
  
  cardTitle: { fontSize: 14, fontWeight: '800', color: Colors.primary, letterSpacing: 0.5, textTransform: 'uppercase' },
  infoRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },
  infoLabel: { flex: 1, color: '#64748B', fontSize: 13, fontWeight: '600' },
  infoValue: { flex: 1.5, color: '#1E293B', fontSize: 14, fontWeight: '500' },
  
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary, marginTop: 4, marginRight: 12 },
  timelineTime: { fontSize: 12, color: '#64748B', marginBottom: 2, fontWeight: '600' },
  timelineText: { fontSize: 14, color: '#1E293B', fontWeight: '500' },

  inputLabel: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1E293B', backgroundColor: '#F8FAFC' },

  // Proper Viewport-Level Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 9999
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 28,
    width: '100%',
    maxWidth: 480,
    maxHeight: '90%',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    elevation: 24
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#64748B' },
  closeBtn: { padding: 6, borderRadius: 6, backgroundColor: '#F1F5F9' },
  modalScrollBody: { maxHeight: 360, marginBottom: 16 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' }
});
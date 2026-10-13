import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';

const MockDataContext = createContext();

export function MockDataProvider({ children }) {
  const [equipment, setEquipment] = useState([
    {
      id: 'EQ-101',
      name: 'Standard Wheelchair (Foldable)',
      category: 'Mobility & Support',
      equipmentType: 'Wheelchair',
      stock: 10,
      availableStock: 10,
      rented: 0,
      unavailable: 0,
      availability: 'Available',
      status: 'Active',
      location: 'Main Warehouse',
      city: 'Mysuru'
    },
    {
      id: 'EQ-102',
      name: '5L Oxygen Concentrator',
      category: 'Respiratory Care',
      equipmentType: 'Oxygen Concentrator',
      stock: 5,
      availableStock: 5,
      rented: 0,
      unavailable: 0,
      availability: 'Available',
      status: 'Active',
      location: 'Main Warehouse',
      city: 'Mysuru'
    }
  ]);
  const [requests, setRequests] = useState([
    {
      id: 'REQ-1001',
      equipmentId: 'EQ-123',
      equipmentName: 'Manual Wheelchair',
      category: 'Mobility & Support',
      equipmentType: 'Wheelchair',
      quantity: 1,
      customerId: 'CUST-001',
      customerName: 'John Doe',
      mobileNumber: '9876543210',
      email: 'john@example.com',
      deliveryAddress: '123 Main St',
      city: 'Mysuru',
      pincode: '570001',
      requestedStartDate: '2026-10-05',
      requestedEndDate: '2026-10-12',
      rentalDuration: '7 Days',
      rentalPrice: 300,
      rentalPriceUnit: 'Day',
      securityDeposit: 1000,
      deliveryCharges: 200,
      totalAmount: 3300,
      status: 'New Request',
      createdAt: '2026-10-03',
      activityTimeline: [{ time: '03 Oct 2026, 10:15 AM', text: 'Rental request received' }]
    }
  ]);
  const [rentals, setRentals] = useState([
    {
      rentalId: 'RNT-6723',
      requestId: 'REQ-0099',
      equipmentId: 'EQ-456',
      equipmentName: 'Oxygen Concentrator (5L)',
      category: 'Respiratory Care',
      equipmentType: 'Oxygen Concentrator',
      quantity: 1,
      customerId: 'CUST-088',
      customerName: 'Sarah Smith',
      mobileNumber: '9876543211',
      email: 'sarah@example.com',
      deliveryAddress: '456 MG Road',
      city: 'Mysuru',
      pincode: '570002',
      requestedStartDate: '2026-09-15',
      requestedEndDate: '2026-09-22',
      rentalDuration: '7 Days',
      rentalPrice: 500,
      rentalPriceUnit: 'Day',
      securityDeposit: 2000,
      deliveryCharges: 300,
      totalAmount: 5800,
      status: 'Completed',
      createdAt: '2026-09-14',
      completedAt: '2026-09-22, 02:30 PM',
      returnRemarks: 'Equipment returned in good condition.',
      activityTimeline: [
        { time: '14 Sep 2026, 09:00 AM', text: 'Rental request received' },
        { time: '15 Sep 2026, 10:00 AM', text: 'Rental started' },
        { time: '22 Sep 2026, 02:30 PM', text: 'Equipment marked returned' }
      ]
    }
  ]);
  const [activity, setActivity] = useState([]);
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-12345',
      type: 'rental-accepted',
      category: 'Rental Requests',
      title: 'Rental Request Accepted',
      message: 'Rental request REQ-1001 has been accepted.',
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedType: 'rental-request',
      relatedId: 'REQ-1001',
      equipmentName: 'Manual Wheelchair'
    },
    {
      id: 'NOTIF-12346',
      type: 'equipment-returned',
      category: 'Rental Status',
      title: 'Equipment Returned',
      message: 'Equipment for rental RNT-6723 has been returned.',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      relatedType: 'rental-history',
      relatedId: 'RNT-6723',
      equipmentName: 'Oxygen Concentrator (5L)'
    }
  ]);
  const [commissionConfig, setCommissionConfig] = useState({
    commissionRate: 10,
    commissionType: 'percentage',
    effectiveDate: '2026-01-01'
  });
  const [settlements, setSettlements] = useState([
    {
      settlementId: 'STL-1001',
      vendorId: 'VEND-001',
      rentalIds: ['RNT-6720'],
      totalCommissionAmount: 330,
      paymentStatus: 'Successful',
      settlementStatus: 'Settled',
      paymentMethod: 'Online Payment',
      transactionId: 'TXN-ABC123XYZ',
      paymentInitiatedAt: '2026-09-01T10:00:00Z',
      paidAt: '2026-09-01T10:05:00Z',
      createdAt: '2026-09-01T10:00:00Z',
      rentals: [
        {
          rentalId: 'RNT-6720',
          equipmentName: 'Wheelchair',
          rentalAmount: 3300,
          commissionRate: 10,
          commissionAmount: 330
        }
      ]
    }
  ]);
  const [vendorProfile, setVendorProfile] = useState({
    vendorId: 'VEND-001',
    businessName: 'MediCare Equipments',
    businessType: 'Medical Equipment Supplier',
    businessAddress: '123 Health Street',
    city: 'Mysuru',
    state: 'Karnataka',
    pincode: '570001',
    primaryContactName: 'Vendor Name',
    mobileNumber: '9876543210',
    email: 'vendor@medicare.com',
    verificationStatus: 'Verified', // Verified, Pending, Rejected
    accountStatus: 'Approved',
    createdAt: '2026-01-15T10:00:00Z',
    businessRegistrationDocument: { name: 'GST_Certificate.pdf', status: 'Verified' },
    governmentIdDocument: { name: 'Aadhar_Card.pdf', status: 'Verified' },
    addressProofDocument: { name: 'Electricity_Bill.pdf', status: 'Pending Verification' },
    notificationPreferences: {
      rentalRequests: true,
      rentalStatus: true,
      inventoryAlerts: true,
      accountUpdates: true
    }
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const storedEq = localStorage.getItem('vendor_eq');
      const storedReq = localStorage.getItem('vendor_req');
      const storedRen = localStorage.getItem('vendor_ren');
      const storedAct = localStorage.getItem('vendor_act');
      if (storedEq) setEquipment(JSON.parse(storedEq));
      if (storedReq) {
        const parsedReq = JSON.parse(storedReq);
        if (parsedReq && parsedReq.length > 0 && parsedReq[0].equipmentName) {
           setRequests(parsedReq);
        }
      }
      if (storedRen) {
        const parsedRen = JSON.parse(storedRen);
        if (parsedRen && parsedRen.length > 0) {
           setRentals(parsedRen);
        }
      }
      if (storedAct) setActivity(JSON.parse(storedAct));
      
      const storedNotif = localStorage.getItem('vendor_notif');
      if (storedNotif) {
        const parsedNotif = JSON.parse(storedNotif);
        if (parsedNotif && parsedNotif.length > 0) {
           setNotifications(parsedNotif);
        }
      }

      const storedSettlements = localStorage.getItem('vendor_settlements');
      if (storedSettlements) {
        setSettlements(JSON.parse(storedSettlements));
      }
      
      const storedProfile = localStorage.getItem('vendor_profile');
      if (storedProfile) {
        setVendorProfile(JSON.parse(storedProfile));
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && isLoaded) {
      localStorage.setItem('vendor_eq', JSON.stringify(equipment));
      localStorage.setItem('vendor_req', JSON.stringify(requests));
      localStorage.setItem('vendor_ren', JSON.stringify(rentals));
      localStorage.setItem('vendor_act', JSON.stringify(activity));
      localStorage.setItem('vendor_notif', JSON.stringify(notifications));
      localStorage.setItem('vendor_settlements', JSON.stringify(settlements));
      localStorage.setItem('vendor_profile', JSON.stringify(vendorProfile));
    }
  }, [equipment, requests, rentals, activity, notifications, settlements, vendorProfile, isLoaded]);

  const addEquipment = (newItem) => {
    setEquipment([...equipment, { ...newItem, id: `EQ-${Math.floor(Math.random() * 1000)}`, rented: 0, unavailable: 0 }]);
    logActivity(`Added new equipment: ${newItem.name}`, 'request');
  };

  const updateEquipment = (id, updatedData) => {
    setEquipment(equipment.map(eq => eq.id === id ? { ...eq, ...updatedData } : eq));
    logActivity(`Updated equipment: ${updatedData.name || 'item'}`, 'request');
  };

  const deleteEquipment = (id) => {
    setEquipment(equipment.filter(eq => eq.id !== id));
    logActivity(`Deleted equipment`, 'return');
  };

  const toggleAvailability = (id) => {
    setEquipment(equipment.map(eq => {
      if (eq.id === id) {
        return { ...eq, availability: eq.availability === 'Available' ? 'Unavailable' : 'Available', status: eq.status === 'Active' ? 'Active' : 'Active' };
      }
      return eq;
    }));
  };

  const updateInventory = (id, newTotal, newUnavailable) => {
    setEquipment(equipment.map(eq => {
      if (eq.id === id) {
        const rented = eq.rented || 0;
        let finalAvailable = newTotal - rented - newUnavailable;
        return { ...eq, stock: newTotal, unavailable: newUnavailable, availableStock: finalAvailable };
      }
      return eq;
    }));
    logActivity(`Updated inventory for equipment`, 'request');
    logActivity(`Updated inventory for equipment`, 'request');
  };

  const simulateNewRequest = () => {
    // Finds a random active equipment to request against, or creates a dummy one
    const eq = equipment.length > 0 ? equipment[Math.floor(Math.random() * equipment.length)] : {
      id: 'EQ-000',
      name: 'Sample Oxygen Concentrator',
      category: 'Respiratory Care',
      equipmentType: 'Oxygen Concentrator'
    };

    const newReqId = `REQ-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toLocaleString();

    const newRequest = {
      id: newReqId,
      equipmentId: eq.id,
      equipmentName: eq.name,
      category: eq.category,
      equipmentType: eq.equipmentType,
      quantity: 1,
      customerId: `CUST-${Math.floor(Math.random() * 1000)}`,
      customerName: 'Alice Smith',
      mobileNumber: '9988776655',
      email: 'alice@example.com',
      deliveryAddress: '456 Tech Park',
      city: 'Mysuru',
      pincode: '570017',
      requestedStartDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      requestedEndDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
      rentalDuration: '5 Days',
      rentalPrice: 200,
      rentalPriceUnit: 'Day',
      securityDeposit: 1500,
      deliveryCharges: 100,
      totalAmount: 2600,
      status: 'New Request',
      createdAt: new Date().toISOString(),
      activityTimeline: [
        { time: now, text: 'Customer requested rental.' }
      ]
    };

    setRequests(prev => [newRequest, ...prev]);
    addNotification('new-request', 'Rental Requests', 'New Rental Request', `You received a new request for ${eq.name} from Alice.`, 'new-request', newReqId, { equipmentName: eq.name });
    logActivity(`Simulated new incoming request ${newReqId}`, 'request');
    return newReqId;
  };

  const approveRequest = (reqId) => {
    setRequests(requests.map(req => req.id === reqId ? { ...req, status: 'Approved' } : req));
    const req = requests.find(r => r.id === reqId);
    if (req) {
      setRentals([...rentals, { id: `REN-${Math.floor(Math.random() * 1000)}`, equipmentName: req.equipmentName, patient: req.patient, status: 'Dispatched' }]);
      
      // Decrease stock
      setEquipment(equipment.map(eq => eq.id === req.equipmentId ? { ...eq, stock: Math.max(0, eq.stock - req.quantity) } : eq));
      logActivity(`Approved request ${reqId}`, 'request');
    }
  };

  const confirmRental = (reqId, amount, duration, quantity, notes) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return { success: false, message: 'Request not found' };

    const now = new Date().toLocaleString();
    setRequests(requests.map(r => r.id === reqId ? { 
      ...r, 
      status: 'Rental Confirmed',
      agreedRentalAmount: amount,
      rentalDuration: duration,
      confirmedQuantity: quantity,
      vendorNotes: notes,
      totalAmount: amount,
      activityTimeline: [...(r.activityTimeline || []), { time: now, text: 'Rental Confirmed' }]
    } : r));
    
    logActivity(`Rental request ${reqId} confirmed`, 'request');
    addNotification('rental-confirmed', 'Rental Requests', 'Rental Confirmed', `Rental request ${reqId} has been confirmed.`, 'rental-request', reqId, { equipmentName: req.equipmentName });
    return { success: true };
  };

  const markPaymentReceived = (reqId) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return { success: false, message: 'Request not found' };

    const now = new Date().toLocaleString();
    setRequests(requests.map(r => r.id === reqId ? { 
      ...r, 
      status: 'Payment Received',
      activityTimeline: [...(r.activityTimeline || []), { time: now, text: 'Payment marked as received' }]
    } : r));
    
    logActivity(`Payment received for request ${reqId}`, 'request');
    addNotification('payment-received', 'Rental Requests', 'Payment Received', `Payment for request ${reqId} has been marked received.`, 'rental-request', reqId, { equipmentName: req.equipmentName });
    return { success: true };
  };

  const rejectRequest = (reqId, reason) => {
    const req = requests.find(r => r.id === reqId);
    const now = new Date().toLocaleString();
    setRequests(requests.map(reqItem => reqItem.id === reqId ? { 
      ...reqItem, 
      status: 'Rejected', 
      rejectionReason: reason,
      activityTimeline: [...(reqItem.activityTimeline || []), { time: now, text: `Request rejected: ${reason}` }]
    } : reqItem));
    logActivity(`Rental request ${reqId} was rejected.`, 'return');
    addNotification('rental-rejected', 'Rental Requests', 'Rental Request Rejected', `Rental request ${reqId} has been rejected.`, 'rental-request', reqId, { equipmentName: req?.equipmentName });
  };

  const startPreparing = (reqId) => {
    const req = requests.find(r => r.id === reqId);
    const now = new Date().toLocaleString();
    setRequests(requests.map(reqItem => reqItem.id === reqId ? { 
      ...reqItem, 
      status: 'Preparing',
      activityTimeline: [...(reqItem.activityTimeline || []), { time: now, text: 'Equipment preparation started' }]
    } : reqItem));
    logActivity(`Rental request ${reqId} marked as Preparing.`, 'request');
    addNotification('equipment-preparing', 'Rental Status', 'Equipment Preparation Started', `Preparation has started for ${req?.equipmentName}.`, 'rental-request', reqId, { equipmentName: req?.equipmentName });
  };

  const markReadyForDelivery = (reqId) => {
    const req = requests.find(r => r.id === reqId);
    const now = new Date().toLocaleString();
    setRequests(requests.map(reqItem => reqItem.id === reqId ? { 
      ...reqItem, 
      status: 'Ready for Delivery',
      activityTimeline: [...(reqItem.activityTimeline || []), { time: now, text: 'Equipment marked ready for delivery' }]
    } : reqItem));
    logActivity(`Rental request ${reqId} is ready for delivery.`, 'request');
    addNotification('equipment-ready', 'Rental Status', 'Equipment Ready', `${req?.equipmentName} is ready for delivery.`, 'rental-request', reqId, { equipmentName: req?.equipmentName });
  };
  
  const markAsDelivered = (reqId) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return { success: false, message: 'Request not found' };

    let eq = equipment.find(e => e.id === req.equipmentId) || equipment.find(e => e.name === req.equipmentName);
    if (eq) {
      const available = (eq.stock || 0) - (eq.rented || 0) - (eq.unavailable || 0);
      const reqQty = req.confirmedQuantity || req.quantity;
      if (available < reqQty) {
        return { success: false, message: `Only ${available} units are currently available. This rental cannot be started for ${reqQty} units.` };
      }
      setEquipment(equipment.map(e => e.id === eq.id ? { ...e, rented: (e.rented || 0) + reqQty } : e));
    }

    const now = new Date().toLocaleString();
    const rentalId = `RNT-${Math.floor(Math.random() * 10000)}`;

    const newRental = {
      ...req,
      rentalId: rentalId,
      requestId: req.id,
      status: 'Active',
      quantity: req.confirmedQuantity || req.quantity,
      startDate: now,
      agreedRentalAmount: req.agreedRentalAmount || req.totalAmount,
      activityTimeline: [...(req.activityTimeline || []), { time: now, text: 'Equipment delivered, rental started' }]
    };

    setRentals([...rentals, newRental]);

    setRequests(requests.map(r => r.id === reqId ? { 
      ...r, 
      status: 'Delivered',
      activityTimeline: [...(r.activityTimeline || []), { time: now, text: 'Equipment delivered' }]
    } : r));

    logActivity(`Equipment delivered for request ${reqId}, Rental ${rentalId} active.`, 'request');
    addNotification('equipment-delivered', 'Rental Status', 'Equipment Delivered', `Equipment delivered, rental ${rentalId} is now active.`, 'active-rental', rentalId, { equipmentName: req.equipmentName });
    return { success: true };
  };


  const returnRental = (rentalId) => {
    const rental = rentals.find(r => r.rentalId === rentalId || r.id === rentalId);
    if (!rental) return { success: false, message: 'Rental not found' };

    const now = new Date().toLocaleString();
    setRentals(rentals.map(r => (r.rentalId === rentalId || r.id === rentalId) ? { 
      ...r, 
      status: 'Completed',
      activityTimeline: [...(r.activityTimeline || []), { time: now, text: 'Equipment marked returned' }]
    } : r));
    
    let eqId = rental.equipmentId;
    let eqName = rental.equipmentName;
    setEquipment(equipment.map(eq => (eq.id === eqId || eq.name === eqName) ? { ...eq, rented: Math.max(0, (eq.rented || 0) - rental.quantity) } : eq));

    logActivity(`Equipment for rental ${rentalId} has been marked returned.`, 'return');
    addNotification('equipment-returned', 'Rental Status', 'Equipment Returned', `Equipment for rental ${rentalId} has been returned.`, 'rental-history', rentalId, { equipmentName: eqName });
    addNotification('rental-completed', 'Rental Status', 'Rental Completed', `Rental ${rentalId} has been completed.`, 'rental-history', rentalId, { equipmentName: eqName });
    return { success: true };
  };

  const makeSettlement = (unsettledRentals, totalAmount) => {
    const settlementId = `STL-${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();
    
    const newSettlement = {
      settlementId,
      vendorId: 'VEND-001',
      rentalIds: unsettledRentals.map(r => r.rentalId),
      totalCommissionAmount: totalAmount,
      paymentStatus: 'Successful',
      settlementStatus: 'Settled',
      paymentMethod: 'Online Payment',
      transactionId: `TXN-${Math.floor(Math.random() * 10000000)}`,
      paymentInitiatedAt: now,
      paidAt: now,
      createdAt: now,
      rentals: unsettledRentals.map(r => ({
        rentalId: r.rentalId,
        equipmentName: r.equipmentName,
        rentalAmount: r.totalAmount,
        commissionRate: commissionConfig.commissionRate,
        commissionAmount: Math.round(r.totalAmount * (commissionConfig.commissionRate / 100))
      }))
    };

    setSettlements(prev => [newSettlement, ...prev]);

    // Update rentals to mark as settled
    setRentals(rentals.map(r => {
      if (unsettledRentals.find(ur => ur.rentalId === r.rentalId)) {
        return {
          ...r,
          settlementStatus: 'Settled',
          settlementId: settlementId,
          commissionAmount: Math.round(r.totalAmount * (commissionConfig.commissionRate / 100)),
          commissionRate: commissionConfig.commissionRate
        };
      }
      return r;
    }));

    logActivity(`Settlement ${settlementId} successful`, 'request');
    addNotification('settlement-successful', 'Payments & Settlements', 'Settlement Successful', `Settlement ${settlementId} of ₹${totalAmount} has been successfully completed.`, 'settlement', settlementId);
    
    return { success: true, settlementId };
  };

  const updateProfile = (updatedData) => {
    setVendorProfile(prev => ({ ...prev, ...updatedData }));
    logActivity('Vendor profile updated', 'request');
    return { success: true };
  };

  const changePassword = (currentPassword, newPassword) => {
    // Mock password change
    logActivity('Password changed', 'request');
    return { success: true };
  };

  const logActivity = (title, type) => {
    setActivity([{ id: Math.random(), title, time: 'Just now', type }, ...activity]);
  };

  const addNotification = (type, category, title, message, relatedType, relatedId, extraData = {}) => {
    const newNotif = {
      id: `NOTIF-${Math.floor(Math.random() * 100000)}`,
      type,
      category,
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
      relatedType,
      relatedId,
      ...extraData
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const stats = {
    totalEquipment: equipment.length,
    totalStock: equipment.reduce((acc, eq) => acc + (eq.stock || 0), 0),
    availableNow: equipment.reduce((acc, eq) => acc + ((eq.stock || 0) - (eq.rented || 0) - (eq.unavailable || 0)), 0),
    currentlyRented: equipment.reduce((acc, eq) => acc + (eq.rented || 0), 0),
    unavailableStock: equipment.reduce((acc, eq) => acc + (eq.unavailable || 0), 0),
    pendingRequests: requests.filter(r => r.status === 'New Request').length
  };

  return (
    <MockDataContext.Provider value={{ equipment, requests, rentals, activity, notifications, stats, settlements, commissionConfig, vendorProfile, addEquipment, updateEquipment, deleteEquipment, toggleAvailability, updateInventory, approveRequest, rejectRequest, confirmRental, markPaymentReceived, startPreparing, markReadyForDelivery, markAsDelivered, returnRental, makeSettlement, updateProfile, changePassword, addNotification, markNotificationAsRead, markAllNotificationsAsRead, simulateNewRequest }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockData() {
  return useContext(MockDataContext);
}

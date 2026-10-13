import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, TextInput, Modal } from 'react-native';
import Colors from '../../constants/Colors';
import { useMockData } from '../../context/MockDataContext';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';

let formDraft = {};
function useDraftState(key, initialValue) {
  if (formDraft[key] === undefined) formDraft[key] = initialValue;
  const [val, setVal] = useState(formDraft[key]);
  return [val, (newVal) => { formDraft[key] = newVal; setVal(newVal); }];
}

export default function EquipmentScreen() {
  const { equipment, addEquipment, updateEquipment, deleteEquipment, toggleAvailability, updateInventory } = useMockData();
  const { action, step: urlStep } = useLocalSearchParams();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [step, setStep] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Statuses');
  
  // Step 1: Category
  const [category, setCategory] = useDraftState('category', '');
  
  // Step 2: Type
  const [equipmentType, setEquipmentType] = useDraftState('equipmentType', '');
  
  // Step 3: Basic Details
  const [newName, setNewName] = useDraftState('newName', '');
  const [shortDesc, setShortDesc] = useDraftState('shortDesc', '');
  const [longDesc, setLongDesc] = useDraftState('longDesc', '');
  const [brand, setBrand] = useDraftState('brand', '');
  const [model, setModel] = useDraftState('model', '');
  const [condition, setCondition] = useDraftState('condition', '');

  // Step 4: Images
  const [images, setImages] = useDraftState('images', []);

  // Step 5: Specifications
  const [specs, setSpecs] = useDraftState('specs', {});

  // Step 6: Inventory
  const [stock, setStock] = useDraftState('stock', '');
  const [availability, setAvailability] = useDraftState('availability', 'Available');

  // Step 7: Location
  const [location, setLocation] = useDraftState('location', '');
  const [city, setCity] = useDraftState('city', '');
  const [area, setArea] = useDraftState('area', '');
  const [pincode, setPincode] = useDraftState('pincode', '');
  const [serviceableAreas, setServiceableAreas] = useDraftState('serviceableAreas', []);
  const [currentAreaInput, setCurrentAreaInput] = useDraftState('currentAreaInput', '');

  useEffect(() => {
    if (action === 'add') {
      setIsAdding(true);
      if (!editId) setStep(parseInt(urlStep, 10) || 1);
    } else if (action === 'edit') {
      setIsAdding(true);
      setStep(parseInt(urlStep, 10) || 3);
    } else {
      setIsAdding(false);
      setEditId(null);
      setStep(1);
    }
  }, [action, urlStep]);

  useEffect(() => {
    // Clear draft if starting fresh
    if (action === 'add' && (!urlStep || urlStep === '1') && !editId) {
       formDraft = {};
       setCategory(''); setEquipmentType(''); setNewName(''); setShortDesc(''); setLongDesc(''); setBrand(''); setModel(''); setCondition(''); setImages([]); setSpecs({}); setStock(''); setAvailability('Available'); setLocation(''); setCity(''); setArea(''); setPincode(''); setServiceableAreas([]); setCurrentAreaInput('');
    }
  }, [action, urlStep, editId]);

  // Data definitions
  const categories = ['Mobility & Support', 'Respiratory Care', 'Patient Care Beds', 'Monitoring Devices'];
  
  const equipmentTypesMap = {
    'Mobility & Support': ['Wheelchair', 'Walker', 'Walking Stick', 'Crutches', 'Commode Wheelchair'],
    'Respiratory Care': ['Oxygen Concentrator', 'Oxygen Cylinder', 'CPAP Machine', 'BiPAP Machine', 'Nebulizer'],
    'Patient Care Beds': ['Manual Hospital Bed', 'Semi-Fowler Bed', 'Fowler Bed', 'Electric Hospital Bed', 'ICU Bed'],
    'Monitoring Devices': ['Blood Pressure Monitor', 'Pulse Oximeter', 'Glucometer', 'ECG Monitor', 'Patient Monitor']
  };

  const getDynamicSpecsFields = () => {
    if (equipmentType.includes('Wheelchair')) return ['Wheelchair Type', 'Foldable', 'Weight Capacity', 'Frame Material'];
    if (equipmentType.includes('Oxygen')) return ['Oxygen Flow Capacity', 'Oxygen Concentration', 'Power Requirement'];
    if (equipmentType.includes('Bed')) return ['Bed Type', 'Maximum Weight Capacity', 'Bed Dimensions', 'Manual / Electric'];
    if (equipmentType.includes('Monitor') || equipmentType.includes('Oximeter')) return ['Measurement Type', 'Display Type', 'Power Source'];
    return ['Key Feature 1', 'Key Feature 2'];
  };

  const handleValidationAndNext = () => {
    let isValid = true;
    let errorMsg = '';

    if (step === 1 && !category) { isValid = false; errorMsg = 'Please select a category'; }
    if (step === 2 && !equipmentType) { isValid = false; errorMsg = 'Please select an equipment type'; }
    if (step === 3 && (!newName || !shortDesc || !condition)) { isValid = false; errorMsg = 'Please fill all required basic details'; }
    if (step === 4 && images.length === 0) { isValid = false; errorMsg = 'Please upload at least one image'; }
    if (step === 6 && !stock) { isValid = false; errorMsg = 'Please enter total quantity'; }
    if (step === 7 && (!location || !city)) { isValid = false; errorMsg = 'Please enter location and city'; }

    if (!isValid) {
      if (Platform.OS === 'web') window.alert(errorMsg);
      else Alert.alert('Error', errorMsg);
      return;
    }

    router.push({ pathname: '/equipment', params: { action, step: step + 1 } });
  };

  const handleSaveEquipment = (isDraft = false) => {
    const equipData = {
      name: newName,
      category,
      equipmentType,
      shortDesc,
      stock: parseInt(stock, 10) || 0,
      availability: isDraft ? 'Draft' : availability,
      location,
      city,
      serviceableAreas,
      status: isDraft ? 'Draft' : 'Active'
    };

    if (editId) {
      updateEquipment(editId, equipData);
    } else {
      addEquipment(equipData);
    }
    
    setEditId(null);
    formDraft = {};
    setStep(1); setIsAdding(false); setCategory(''); setEquipmentType(''); setNewName(''); setShortDesc(''); setLongDesc(''); setBrand(''); setModel(''); setCondition(''); setImages([]); setSpecs({}); setStock(''); setAvailability('Available'); setLocation(''); setCity(''); setArea(''); setPincode(''); setServiceableAreas([]); setCurrentAreaInput('');
    
    const msg = isDraft ? 'Equipment saved as draft.' : (editId ? 'Equipment Updated Successfully' : 'Equipment Added Successfully');
    if (Platform.OS === 'web') window.alert(msg);
    else Alert.alert('Success', msg);
    
    router.push('/(dashboard)/equipment');
  };

  const handleEdit = (eq) => {
    setEditId(eq.id);
    const updatedAreas = Array.isArray(eq.serviceableAreas) ? eq.serviceableAreas : (eq.serviceableAreas ? [eq.serviceableAreas] : []);
    
    formDraft = {
      category: eq.category || '',
      equipmentType: eq.equipmentType || '',
      newName: eq.name || '',
      shortDesc: eq.shortDesc || '',
      stock: eq.stock ? eq.stock.toString() : '',
      availability: eq.availability === 'Draft' ? 'Available' : (eq.availability || 'Available'),
      location: eq.location || '',
      city: eq.city || '',
      serviceableAreas: updatedAreas,
      longDesc: eq.longDesc || '',
      brand: eq.brand || '',
      model: eq.model || '',
      condition: eq.condition || '',
      images: eq.images || [],
      specs: eq.specs || {},
      area: '',
      pincode: '',
      currentAreaInput: ''
    };

    setCategory(formDraft.category);
    setEquipmentType(formDraft.equipmentType);
    setNewName(formDraft.newName);
    setShortDesc(formDraft.shortDesc);
    setStock(formDraft.stock);
    setAvailability(formDraft.availability);
    setLocation(formDraft.location);
    setCity(formDraft.city);
    setServiceableAreas(formDraft.serviceableAreas);
    
    router.push({ pathname: '/equipment', params: { action: 'edit', step: 3 } });
  };

  const handleUpdateAvailability = (eq) => {
    if (Platform.OS === 'web') {
      const current = eq.availableStock !== undefined ? eq.availableStock : eq.stock;
      const input = window.prompt(`Enter available quantity (Max: ${eq.stock})`, current);
      if (input !== null) {
        const num = parseInt(input, 10);
        if (!isNaN(num) && num >= 0 && num <= eq.stock) {
          const newUnavailable = eq.stock - (eq.rented || 0) - num;
          updateInventory(eq.id, eq.stock, newUnavailable);
        } else {
          window.alert(`Invalid amount. Must be between 0 and ${eq.stock}`);
        }
      }
    } else {
      Alert.prompt(
        'Update Availability',
        `Enter available quantity (Max: ${eq.stock})`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Save', onPress: (val) => {
             const num = parseInt(val, 10);
             if (!isNaN(num) && num >= 0 && num <= eq.stock) {
               const newUnavailable = eq.stock - (eq.rented || 0) - num;
               updateInventory(eq.id, eq.stock, newUnavailable);
             } else Alert.alert('Error', `Invalid amount. Must be between 0 and ${eq.stock}`);
          }}
        ],
        'plain-text',
        (eq.availableStock !== undefined ? eq.availableStock : eq.stock).toString(),
        'numeric'
      );
    }
  };

  const renderProgressIndicator = () => {
    const steps = ['Category', 'Type', 'Details', 'Images', 'Specs', 'Inventory', 'Location', 'Review'];
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Step {step} of 8: {steps[step - 1]}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(step / 8) * 100}%` }]} />
        </View>
      </View>
    );
  };

  if (isAdding) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{editId ? 'Edit Equipment' : 'Add Equipment'}</Text>
          <Pressable style={styles.cancelButton} onPress={() => { router.push('/equipment'); }}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>

        {renderProgressIndicator()}

        <View style={styles.formCard}>
          {step === 1 && (
            <View>
              <Text style={styles.stepTitle}>STEP 1 - SELECT CATEGORY</Text>
              <View style={styles.categoryGrid}>
                {categories.map(cat => (
                  <Pressable key={cat} style={[styles.categoryBox, category === cat && styles.categoryBoxSelected]} onPress={() => setCategory(cat)}>
                    <Ionicons name="medkit-outline" size={24} color={category === cat ? Colors.primary : Colors.textLight} />
                    <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>{cat}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={styles.stepTitle}>STEP 2 - SELECT EQUIPMENT TYPE</Text>
              <View style={styles.categoryGrid}>
                {(equipmentTypesMap[category] || []).map(type => (
                  <Pressable key={type} style={[styles.categoryBox, equipmentType === type && styles.categoryBoxSelected]} onPress={() => { setEquipmentType(type); setNewName(type); }}>
                    <Ionicons name="cube-outline" size={24} color={equipmentType === type ? Colors.primary : Colors.textLight} />
                    <Text style={[styles.categoryText, equipmentType === type && styles.categoryTextSelected]}>{type}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.stepTitle}>STEP 3 - BASIC EQUIPMENT DETAILS</Text>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Equipment Name *</Text><TextInput style={styles.input} value={newName} onChangeText={setNewName} /></View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>Category</Text><TextInput style={[styles.input, styles.inputDisabled]} value={category} editable={false} /></View>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>Equipment Type</Text><TextInput style={[styles.input, styles.inputDisabled]} value={equipmentType} editable={false} /></View>
              </View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Short Description *</Text><TextInput style={styles.input} value={shortDesc} onChangeText={setShortDesc} /></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Detailed Description</Text><TextInput style={[styles.input, { height: 80 }]} multiline value={longDesc} onChangeText={setLongDesc} /></View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>Brand / Manufacturer</Text><TextInput style={styles.input} value={brand} onChangeText={setBrand} /></View>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>Model</Text><TextInput style={styles.input} value={model} onChangeText={setModel} /></View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Equipment Condition *</Text>
                <View style={styles.categoryGrid}>
                  {['New', 'Good', 'Used', 'Refurbished'].map(cond => (
                    <Pressable key={cond} style={[styles.categoryBox, { padding: 12, width: '23%' }, condition === cond && styles.categoryBoxSelected]} onPress={() => setCondition(cond)}>
                      <Text style={[styles.categoryText, { marginTop: 0 }, condition === cond && styles.categoryTextSelected]}>{cond}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {step === 4 && (
            <View>
              <Text style={styles.stepTitle}>STEP 4 - EQUIPMENT IMAGES</Text>
              <Pressable style={styles.imageUploadBox} onPress={() => setImages(['dummy_image_1.jpg'])}>
                <Ionicons name="cloud-upload-outline" size={36} color={Colors.textLight} />
                <Text style={{ color: Colors.text, marginTop: 8, fontWeight: '600' }}>Click or Drag to Upload Images</Text>
                <Text style={{ color: Colors.textLight, marginTop: 4, fontSize: 12 }}>Supported formats: JPG, PNG. Max 5MB.</Text>
              </Pressable>
              {images.length > 0 && (
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                  {images.map((img, idx) => (
                    <View key={idx} style={styles.uploadedImagePreview}>
                      <Ionicons name="image" size={32} color={Colors.primary} />
                      <Text style={{ fontSize: 10, marginTop: 4 }}>{img}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {step === 5 && (
            <View>
              <Text style={styles.stepTitle}>STEP 5 - EQUIPMENT SPECIFICATIONS</Text>
              {getDynamicSpecsFields().map(field => (
                <View key={field} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{field}</Text>
                  <TextInput style={styles.input} placeholder={`Enter ${field.toLowerCase()}`} value={specs[field] || ''} onChangeText={val => setSpecs({...specs, [field]: val})} />
                </View>
              ))}
            </View>
          )}

          {step === 6 && (
            <View>
              <Text style={styles.stepTitle}>STEP 6 - INVENTORY & AVAILABILITY</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>Total Quantity *</Text><TextInput style={styles.input} keyboardType="numeric" value={stock} onChangeText={setStock} /></View>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>Available Quantity</Text><TextInput style={[styles.input, styles.inputDisabled]} value={stock} editable={false} /></View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Availability Status</Text>
                <View style={styles.categoryGrid}>
                  {['Available', 'Unavailable'].map(status => (
                     <Pressable key={status} style={[styles.categoryBox, { padding: 12, width: '48%' }, availability === status && styles.categoryBoxSelected]} onPress={() => setAvailability(status)}>
                       <Text style={[styles.categoryText, { marginTop: 0 }, availability === status && styles.categoryTextSelected]}>{status}</Text>
                     </Pressable>
                  ))}
                </View>
              </View>
            </View>
          )}

          {step === 7 && (
            <View>
              <Text style={styles.stepTitle}>STEP 7 - LOCATION & SERVICE AREA</Text>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Equipment Location *</Text><TextInput style={styles.input} value={location} onChangeText={setLocation} /></View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>City *</Text><TextInput style={styles.input} value={city} onChangeText={setCity} /></View>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>Area</Text><TextInput style={styles.input} value={area} onChangeText={setArea} /></View>
              </View>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>Pincode</Text><TextInput style={styles.input} value={pincode} onChangeText={setPincode} /></View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                   <Text style={styles.inputLabel}>Serviceable Areas</Text>
                   <View style={{flexDirection: 'row', gap: 8, marginBottom: 8}}>
                     <TextInput 
                       style={[styles.input, {flex: 1, marginBottom: 0}]} 
                       placeholder="Enter area and tap Add..."
                       value={currentAreaInput} 
                       onChangeText={setCurrentAreaInput} 
                       onSubmitEditing={() => {
                         if (currentAreaInput.trim() && !serviceableAreas.includes(currentAreaInput.trim())) {
                           setServiceableAreas([...serviceableAreas, currentAreaInput.trim()]);
                           setCurrentAreaInput('');
                         }
                       }}
                     />
                     <Pressable 
                       style={{backgroundColor: Colors.primary, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 8}}
                       onPress={() => {
                         if (currentAreaInput.trim() && !serviceableAreas.includes(currentAreaInput.trim())) {
                           setServiceableAreas([...serviceableAreas, currentAreaInput.trim()]);
                           setCurrentAreaInput('');
                         }
                       }}
                     >
                       <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 13}}>Add</Text>
                     </Pressable>
                   </View>
                   <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6}}>
                     {serviceableAreas.map((area, idx) => (
                       <View key={idx} style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0'}}>
                         <Text style={{fontSize: 12, color: '#1E293B', marginRight: 4}}>{area}</Text>
                         <Pressable onPress={() => setServiceableAreas(serviceableAreas.filter(a => a !== area))}>
                           <Ionicons name="close-circle" size={14} color="#64748B" />
                         </Pressable>
                       </View>
                     ))}
                   </View>
                </View>
              </View>
            </View>
          )}

          {step === 8 && (
            <View>
              <Text style={styles.stepTitle}>STEP 8 - REVIEW & SUBMIT</Text>
              
              <View style={styles.reviewSection}>
                <View style={styles.reviewHeader}><Text style={styles.reviewTitle}>Basic Information</Text><Pressable onPress={() => router.push({ pathname: '/equipment', params: { action, step: 3 } })}><Text style={styles.editLink}>Edit</Text></Pressable></View>
                <Text style={styles.reviewText}><Text style={styles.reviewLabel}>Name:</Text> {newName}</Text>
                <Text style={styles.reviewText}><Text style={styles.reviewLabel}>Category:</Text> {category} &gt; {equipmentType}</Text>
                <Text style={styles.reviewText}><Text style={styles.reviewLabel}>Condition:</Text> {condition}</Text>
              </View>

              <View style={styles.reviewSection}>
                <View style={styles.reviewHeader}><Text style={styles.reviewTitle}>Inventory & Location</Text><Pressable onPress={() => router.push({ pathname: '/equipment', params: { action, step: 6 } })}><Text style={styles.editLink}>Edit</Text></Pressable></View>
                <Text style={styles.reviewText}><Text style={styles.reviewLabel}>Quantity:</Text> {stock} ({availability})</Text>
                <Text style={styles.reviewText}><Text style={styles.reviewLabel}>Location:</Text> {location}, {city}</Text>
              </View>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 16, marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
            {step > 1 && (
              <Pressable style={[styles.cancelButton, { flex: 1, alignItems: 'center' }]} onPress={() => router.back()}>
                <Text style={styles.cancelButtonText}>Back</Text>
              </Pressable>
            )}
            
            {step < 8 ? (
              <Pressable style={[styles.primaryButton, { flex: 2, alignItems: 'center' }]} onPress={handleValidationAndNext}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </Pressable>
            ) : (
              <>
                <Pressable style={[styles.cancelButton, { flex: 1, alignItems: 'center', borderColor: Colors.warning }]} onPress={() => handleSaveEquipment(true)}>
                  <Text style={[styles.cancelButtonText, { color: Colors.warning }]}>Save as Draft</Text>
                </Pressable>
                <Pressable style={[styles.primaryButton, { flex: 2, alignItems: 'center' }]} onPress={() => handleSaveEquipment(false)}>
                  <Text style={styles.primaryButtonText}>{editId ? 'Update Equipment' : 'Add Equipment'}</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.unifiedCard}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Equipment</Text>
            <Text style={styles.subtitle}>Manage your equipment and stock availability.</Text>
          </View>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/equipment?action=add')}>
            <Text style={styles.primaryButtonText}>+ Add Equipment</Text>
          </Pressable>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Total Equipment</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#0F4C7515' }]}><Ionicons name="cube-outline" size={16} color="#0F4C75" /></View>
            </View>
            <Text style={[styles.statValue, { color: '#0F4C75' }]}>{equipment.length}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Available</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#4AD6A115' }]}><Ionicons name="checkmark-circle-outline" size={16} color="#4AD6A1" /></View>
            </View>
            <Text style={[styles.statValue, { color: '#4AD6A1' }]}>{equipment.reduce((acc, eq) => acc + (eq.availableStock !== undefined ? eq.availableStock : eq.stock), 0)}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Rented</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#EF444415' }]}><Ionicons name="cart-outline" size={16} color="#EF4444" /></View>
            </View>
            <Text style={[styles.statValue, { color: '#EF4444' }]}>0</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>Unavailable</Text>
              <View style={[styles.statIconBox, { backgroundColor: '#F59E0B15' }]}><Ionicons name="warning-outline" size={16} color="#F59E0B" /></View>
            </View>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>0</Text>
          </View>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#94A3B8" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search equipment..." 
              placeholderTextColor="#94A3B8" 
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.dropdowns}>
            {Platform.OS === 'web' ? (
              <>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', borderColor: '#E2E8F0', outlineStyle: 'none', color: '#64748B', backgroundColor: '#F8FAFC', fontSize: '13px', cursor: 'pointer' }}
                >
                  <option value="All Categories">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '8px', borderColor: '#E2E8F0', outlineStyle: 'none', color: '#64748B', backgroundColor: '#F8FAFC', fontSize: '13px', cursor: 'pointer' }}
                >
                  <option value="All Statuses">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Unavailable">Unavailable</option>
                  <option value="Draft">Draft</option>
                </select>
              </>
            ) : (
              <>
                <Pressable style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{filterCategory}</Text>
                  <Ionicons name="chevron-down" size={14} color="#64748B" />
                </Pressable>
                <Pressable style={styles.dropdown}>
                  <Text style={styles.dropdownText}>{filterStatus}</Text>
                  <Ionicons name="chevron-down" size={14} color="#64748B" />
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Table Content inside unified card */}
        {equipment.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons name="cube-outline" size={48} color={Colors.primary} style={{ opacity: 0.5, marginBottom: 12 }} />
            <Text style={{fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 8}}>No Equipment Found</Text>
            <Text style={{color: Colors.textLight, marginBottom: 20}}>Add equipment to manage your inventory and receive rental requests.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/equipment?action=add')}>
              <Text style={styles.primaryButtonText}>+ Add Equipment</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 0.8 }]}>IMAGE</Text>
              <Text style={[styles.th, { flex: 2 }]}>EQUIPMENT NAME</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>CATEGORY</Text>
              <Text style={[styles.th, { flex: 1.5 }]}>TYPE</Text>
              <Text style={[styles.th, { flex: 1 }]}>BRAND</Text>
              <Text style={[styles.th, { flex: 1 }]}>QUANTITY</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
              <Text style={[styles.th, { flex: 1.2, textAlign: 'center' }]}>ACTIONS</Text>
            </View>
            {equipment.filter(eq => {
              if (searchQuery && !eq.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
              if (filterCategory !== 'All Categories' && eq.category !== filterCategory) return false;
              if (filterStatus !== 'All Statuses') {
                 const currentAvail = eq.availableStock !== undefined ? eq.availableStock : eq.stock;
                 const isAvail = currentAvail > 0 && eq.availability === 'Available';
                 const statusStr = eq.status === 'Draft' ? 'Draft' : (isAvail ? 'Available' : 'Unavailable');
                 if (statusStr !== filterStatus) return false;
              }
              return true;
            }).map((eq, index, arr) => {
              const currentAvailable = eq.availableStock !== undefined ? eq.availableStock : eq.stock;
              const isAvailable = currentAvailable > 0 && eq.availability === 'Available';
              return (
                <View key={eq.id} style={[styles.tableRow, index === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={{ flex: 0.8 }}>
                    <View style={styles.tableImage}>
                      <Ionicons name="medkit" size={20} color="#0F4C75" />
                    </View>
                  </View>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.tableName}>{eq.name}</Text>
                  </View>
                  <Text style={[styles.td, { flex: 1.5 }]} numberOfLines={1}>{eq.category}</Text>
                  <Text style={[styles.td, { flex: 1.5 }]} numberOfLines={1}>{eq.equipmentType || '-'}</Text>
                  <Text style={[styles.td, { flex: 1 }]} numberOfLines={1}>-</Text>
                  <Text style={[styles.td, { flex: 1 }]}>{eq.stock}</Text>
                  <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={[styles.statusBadge, isAvailable ? styles.badgeAvailable : styles.badgeOut]}>
                      <Text style={[styles.statusBadgeText, isAvailable ? styles.badgeTextAvailable : styles.badgeTextOut]}>
                        {eq.status === 'Draft' ? 'Draft' : (isAvailable ? 'Available' : 'Unavailable')}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flex: 1.2, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
                    <Pressable style={styles.actionIconBtn} onPress={() => handleEdit(eq)} title="Edit">
                      <Ionicons name="pencil" size={16} color="#0F4C75" />
                    </Pressable>
                    <Pressable style={[styles.actionIconBtn, { backgroundColor: '#4AD6A115' }]} onPress={() => handleUpdateAvailability(eq)} title="Update Stock">
                      <Ionicons name="sync" size={16} color="#059669" />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  
  progressContainer: { marginBottom: 24, maxWidth: 700 },
  progressText: { fontSize: 13, fontWeight: '600', color: Colors.textLight, marginBottom: 8 },
  progressBarBg: { height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  
  primaryButton: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, justifyContent: 'center' },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  
  cancelButton: { backgroundColor: '#F1F5F9', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center' },
  cancelButtonText: { color: Colors.text, fontWeight: 'bold', fontSize: 14, textAlign: 'center' },
  
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#F1F5F9', maxWidth: 560, alignSelf: 'center', width: '100%', marginBottom: 40, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' },
  stepTitle: { fontSize: 13, fontWeight: '800', color: Colors.primary, marginBottom: 20, letterSpacing: 0.5, textTransform: 'uppercase' },
  
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  categoryBox: { width: '48%', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' },
  categoryBoxSelected: { borderColor: Colors.primary, backgroundColor: '#EFF6FF', borderWidth: 1.5 },
  categoryText: { marginTop: 10, fontSize: 13, fontWeight: '600', color: '#475569', textAlign: 'center' },
  categoryTextSelected: { color: Colors.primary, fontWeight: '700' },

  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1E293B', backgroundColor: '#F8FAFC', outlineStyle: 'none' },
  inputDisabled: { backgroundColor: '#E2E8F0', color: Colors.textLight },
  
  imageUploadBox: { height: 160, borderWidth: 2, borderStyle: 'dashed', borderColor: '#CBD5E1', borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC', marginBottom: 24 },
  uploadedImagePreview: { width: 80, height: 80, borderRadius: 8, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CBD5E1' },

  reviewSection: { marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  reviewTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  editLink: { color: Colors.primary, fontWeight: '600', fontSize: 13 },
  reviewText: { fontSize: 14, color: '#1E293B', marginBottom: 6 },
  reviewLabel: { fontWeight: '600', color: Colors.textLight },

  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statsGrid: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  statCard: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    padding: 14, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginTop: 2 },
  statIconBox: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  
  filterBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 12, height: 38, width: 280, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: '#1E293B', ...(Platform.OS === 'web' && { outlineStyle: 'none' }) },
  dropdowns: { flexDirection: 'row', gap: 10 },
  dropdown: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 14, height: 38, borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
  dropdownText: { fontSize: 13, color: '#64748B', fontWeight: '500' },

  emptyStateContainer: { padding: 40, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 },

  table: { width: '100%', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#F8FAFC', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', alignItems: 'center' },
  th: { fontSize: 11, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  tableImage: { width: 36, height: 36, backgroundColor: '#E0F2FE', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  tableName: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  td: { fontSize: 12, color: '#64748B', fontWeight: '500' },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontWeight: 'bold' },
  badgeAvailable: { backgroundColor: '#D1FAE5' },
  badgeTextAvailable: { color: '#059669' },
  badgeOut: { backgroundColor: '#FEF3C7' },
  badgeTextOut: { color: '#D97706' },

  actionIconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F9FF', justifyContent: 'center', alignItems: 'center' },

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
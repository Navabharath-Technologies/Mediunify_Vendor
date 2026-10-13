import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, TextInput, ActivityIndicator } from 'react-native';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMockData } from '../../context/MockDataContext';
import * as XLSX from 'xlsx';

const MEDIUNIFY_FIELDS = [
  { id: 'name', label: 'Equipment Name', required: true, matchWords: ['product', 'item', 'equipment', 'name'] },
  { id: 'category', label: 'Category', required: true, matchWords: ['category', 'type', 'group'] },
  { id: 'equipmentType', label: 'Equipment Type', required: true, matchWords: ['type', 'kind', 'class'] },
  { id: 'stock', label: 'Total Quantity', required: true, matchWords: ['stock', 'quantity', 'total', 'qty'] },
  { id: 'location', label: 'Location', required: true, matchWords: ['city', 'location', 'area', 'region'] },
  { id: 'description', label: 'Description', required: false, matchWords: ['description', 'details', 'about'] },
  { id: 'brand', label: 'Brand', required: false, matchWords: ['brand', 'make'] },
  { id: 'model', label: 'Model', required: false, matchWords: ['model'] },
  { id: 'condition', label: 'Condition', required: false, matchWords: ['condition', 'state'] },
  { id: 'deliveryAvailable', label: 'Delivery Available', required: false, matchWords: ['delivery'] },
  { id: 'pickupAvailable', label: 'Pickup Available', required: false, matchWords: ['pickup', 'pick'] },
  { id: 'serviceableAreas', label: 'Serviceable Areas', required: false, matchWords: ['serviceable', 'areas'] },
  { id: 'rentalPrice', label: 'Rental Price', required: false, matchWords: ['price', 'rate', 'cost', 'amount'] },
  { id: 'rentalPriceUnit', label: 'Rental Price Unit', required: false, matchWords: ['unit', 'per', 'duration unit'] },
  { id: 'minDuration', label: 'Minimum Rental Duration', required: false, matchWords: ['min', 'minimum'] },
  { id: 'maxDuration', label: 'Maximum Rental Duration', required: false, matchWords: ['max', 'maximum'] },
  { id: 'securityDeposit', label: 'Security Deposit', required: false, matchWords: ['deposit', 'security'] },
];

let importDraft = {
  vendorColumns: [],
  vendorRows: [],
  mapping: {},
  defaultValues: {},
  validationResults: { valid: [], invalid: [] }
};

export default function ImportInventoryScreen() {
  const { equipment, addEquipment, updateEquipment } = useMockData();
  const { step: urlStep } = useLocalSearchParams();
  
  const [step, setStep] = useState(1); // 1: Source, 2: Mapping, 3: Preview, 4: Success
  
  React.useEffect(() => {
    setStep(parseInt(urlStep, 10) || 1);
  }, [urlStep]);
  
  const [sourceType, setSourceType] = useState(null); // 'file'
  
  // Data States
  const [vendorColumns, _setVendorColumns] = useState(importDraft.vendorColumns);
  const setVendorColumns = (val) => { importDraft.vendorColumns = val; _setVendorColumns(val); };

  const [vendorRows, _setVendorRows] = useState(importDraft.vendorRows);
  const setVendorRows = (val) => { importDraft.vendorRows = val; _setVendorRows(val); };

  const [mapping, _setMapping] = useState(importDraft.mapping);
  const setMapping = (val) => { 
    const newVal = typeof val === 'function' ? val(importDraft.mapping) : val;
    importDraft.mapping = newVal; 
    _setMapping(newVal); 
  };

  const [defaultValues, _setDefaultValues] = useState(importDraft.defaultValues);
  const setDefaultValues = (val) => { 
    const newVal = typeof val === 'function' ? val(importDraft.defaultValues) : val;
    importDraft.defaultValues = newVal; 
    _setDefaultValues(newVal); 
  };

  const [validationResults, _setValidationResults] = useState(importDraft.validationResults);
  const setValidationResults = (val) => { importDraft.validationResults = val; _setValidationResults(val); };

  const [isProcessing, setIsProcessing] = useState(false);

  // File Upload Handlers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target.result;
        processSpreadsheet(data);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a .csv, .xlsx, or .xls file.');
    }
  };

  const processSpreadsheet = (data) => {
    try {
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      const nonEmptyData = jsonData.filter(row => row.some(cell => cell !== ''));
      if (nonEmptyData.length < 2) {
        alert('File does not contain enough data.');
        return;
      }

      const headers = nonEmptyData[0].map(h => String(h).trim());
      const rows = nonEmptyData.slice(1).map(row => 
        headers.map((_, i) => String(row[i] || '').trim())
      );

      setVendorColumns(headers);
      setVendorRows(rows);
      autoMapColumns(headers);
      router.push({ pathname: '/import', params: { step: 2 } });
    } catch (error) {
      console.error(error);
      alert('Error parsing the file. Please ensure it is a valid spreadsheet.');
    }
  };

  const autoMapColumns = (headers) => {
    const initialMapping = {};
    headers.forEach((header, index) => {
      const headerLower = header.toLowerCase();
      let matchedField = null;

      for (const field of MEDIUNIFY_FIELDS) {
        if (field.matchWords.some(word => headerLower.includes(word))) {
          if (!Object.values(initialMapping).includes(field.id)) { // Prevent duplicate mapping
            matchedField = field.id;
            break;
          }
        }
      }
      
      if (matchedField) {
        initialMapping[header] = matchedField;
      }
    });
    setMapping(initialMapping);
  };

  const handleMappingChange = (vendorCol, mediunifyFieldId) => {
    setMapping(prev => {
      const newMap = { ...prev };
      // If the field is already mapped to another column, remove it from that column
      Object.keys(newMap).forEach(key => {
        if (newMap[key] === mediunifyFieldId && key !== vendorCol) {
          delete newMap[key];
        }
      });
      if (mediunifyFieldId) {
        newMap[vendorCol] = mediunifyFieldId;
      } else {
        delete newMap[vendorCol];
      }
      return newMap;
    });
  };

  const validateData = () => {
    // Check required fields
    const mappedFields = Object.values(mapping);
    const missingRequired = MEDIUNIFY_FIELDS.filter(f => f.required && !mappedFields.includes(f.id) && !defaultValues[f.id]);
    
    if (missingRequired.length > 0) {
      alert(`The following required fields are not mapped and have no default value: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    const valid = [];
    const invalid = [];

    vendorRows.forEach((row, rowIndex) => {
      const record = {};
      const errors = [];

      vendorColumns.forEach((col, colIndex) => {
        const fieldId = mapping[col];
        if (fieldId) {
          record[fieldId] = row[colIndex];
        }
      });
      
      // Apply defaults for unmapped fields
      MEDIUNIFY_FIELDS.forEach(f => {
         if (!mappedFields.includes(f.id) && defaultValues[f.id]) {
            record[f.id] = defaultValues[f.id];
         }
      });

      // Validations
      if (!record.name) errors.push('Name is missing');
      if (!record.category) errors.push('Category is missing');
      if (!record.equipmentType) errors.push('Type is missing');
      
      if (record.rentalPrice) {
        const price = parseFloat(record.rentalPrice);
        if (isNaN(price) || price < 0) errors.push('Rental Price must be a positive number');
        else record.rentalPrice = price;
      }
      
      const stock = parseInt(record.stock, 10);
      if (isNaN(stock) || stock < 0) errors.push('Quantity must be a positive number');
      
      if (!record.location) errors.push('Location is missing');

      record.stock = stock;

      if (errors.length > 0) {
        invalid.push({ row: rowIndex + 2, data: record, errors });
      } else {
        const existingEq = equipment.find(e => e.name.toLowerCase() === record.name.toLowerCase() && e.location.toLowerCase() === record.location.toLowerCase());
        if (existingEq) {
            record.isDuplicate = true;
            record.existingId = existingEq.id;
        }
        valid.push(record);
      }
    });

    setValidationResults({ valid, invalid });
    router.push({ pathname: '/import', params: { step: 3 } });
  };

  const executeImport = () => {
    validationResults.valid.forEach(record => {
      if (record.isDuplicate) {
          // Simply update stock if it's a duplicate (or handle as update)
          const existing = equipment.find(e => e.id === record.existingId);
          if (existing) {
             updateEquipment(existing.id, { stock: existing.stock + record.stock });
          }
      } else {
          addEquipment({
            ...record,
            status: 'Active',
            availability: 'Available'
          });
      }
    });
    // Clear draft on success
    importDraft = { vendorColumns: [], vendorRows: [], mapping: {}, defaultValues: {}, validationResults: { valid: [], invalid: [] } };
    router.push({ pathname: '/import', params: { step: 4 } });
  };

  const renderSourceSelection = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Upload Inventory File</Text>
      <Text style={styles.cardSubtitle}>Upload your existing equipment inventory file to get started.</Text>

      <Pressable style={[styles.sourceBox, { width: '100%', maxWidth: '100%', marginBottom: 24, backgroundColor: '#F8FAFC' }]} onPress={() => { setSourceType('file'); document.getElementById('inventoryFileInput').click(); }}>
        {isProcessing ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 16 }} />
        ) : (
          <View style={styles.sourceBoxInner}>
            <View style={styles.iconCircle}>
              <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={[styles.sourceBoxTitle, { fontSize: 16 }]}>Click to Upload or Drag and Drop</Text>
            <Text style={[styles.sourceBoxDesc, { fontSize: 13, marginTop: 4 }]}>Supported formats: .xlsx, .xls, .csv</Text>
          </View>
        )}
        {Platform.OS === 'web' && (
           <input type="file" id="inventoryFileInput" accept=".csv, .xlsx, .xls" style={{ display: 'none' }} onChange={handleFileUpload} />
        )}
      </Pressable>

      <View style={styles.templateSection}>
        <Text style={styles.templateText}>Need a sample format?</Text>
        <Pressable onPress={() => alert('Downloading template...')}>
          <Text style={styles.templateLink}>Download sample template</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderMapping = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Map Your Columns</Text>
        <Pressable style={styles.secondaryButton} onPress={() => router.push({ pathname: '/import', params: { step: 1 } })}>
          <Text style={styles.secondaryButtonText}>Back</Text>
        </Pressable>
      </View>
      <Text style={styles.cardSubtitle}>Match your spreadsheet columns to MediUnify fields.</Text>

      <View style={styles.mappingTable}>
        <View style={styles.mappingHeaderRow}>
          <Text style={styles.mappingHeaderCell}>Vendor Column</Text>
          <Text style={styles.mappingHeaderCell}>MediUnify Field</Text>
        </View>
        
        {vendorColumns.map((col, idx) => (
          <View key={idx} style={styles.mappingRow}>
            <Text style={styles.mappingCellLabel}>{col}</Text>
            <View style={styles.mappingCellInput}>
              {Platform.OS === 'web' ? (
                <select 
                  style={styles.nativeSelect} 
                  value={mapping[col] || ''} 
                  onChange={(e) => handleMappingChange(col, e.target.value)}
                >
                  <option value="">-- Ignore --</option>
                  {MEDIUNIFY_FIELDS.map(f => (
                    <option key={f.id} value={f.id}>{f.label} {f.required ? '*' : ''}</option>
                  ))}
                </select>
              ) : (
                <Text style={{color: Colors.textLight}}>Use Web for dropdowns</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.cardTitle, {marginTop: 32, marginBottom: 8}]}>Missing Columns / Default Values</Text>
      <Text style={styles.cardSubtitle}>If your spreadsheet doesn't have a column for a specific field, you can set a manual value for all imported rows.</Text>
      
      <View style={styles.mappingTable}>
        {MEDIUNIFY_FIELDS.map(f => {
           if (!Object.values(mapping).includes(f.id)) {
              return (
                 <View key={`def-${f.id}`} style={styles.mappingRow}>
                   <Text style={styles.mappingCellLabel}>{f.label} {f.required ? '*' : ''}</Text>
                   <View style={styles.mappingCellInput}>
                     <TextInput 
                        style={[styles.input, {marginBottom: 0, padding: 8, height: 36}]} 
                        placeholder={`Enter default ${f.label}`}
                        value={defaultValues[f.id] || ''}
                        onChangeText={(text) => setDefaultValues(prev => ({...prev, [f.id]: text}))}
                     />
                   </View>
                 </View>
              );
           }
           return null;
        })}
      </View>

      <Pressable style={styles.primaryButton} onPress={validateData}>
        <Text style={styles.primaryButtonText}>Validate & Continue</Text>
      </Pressable>
    </View>
  );

  const renderPreview = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Import Preview</Text>
        <Pressable style={styles.secondaryButton} onPress={() => router.push({ pathname: '/import', params: { step: 2 } })}>
          <Text style={styles.secondaryButtonText}>Back to Mapping</Text>
        </Pressable>
      </View>
      <Text style={styles.cardSubtitle}>{validationResults.valid.length + validationResults.invalid.length} equipment records found</Text>

      {validationResults.valid.some(r => r.isDuplicate) && (
        <View style={[styles.errorBox, {backgroundColor: '#FFFBEB', borderColor: '#FEF3C7'}]}>
          <Text style={[styles.errorBoxTitle, {color: '#92400E'}]}>Possible duplicate equipment detected</Text>
          <Text style={[styles.errorItem, {color: '#92400E'}]}>Some items already exist in your inventory based on name and location. Importing them will add the new quantity to the existing stock.</Text>
        </View>
      )}

      <View style={styles.summaryBox}>
        <Text style={[styles.summaryText, {color: Colors.success}]}>Valid Records: {validationResults.valid.length}</Text>
        <Text style={[styles.summaryText, {color: Colors.danger}]}>Records With Errors: {validationResults.invalid.length}</Text>
      </View>

      {validationResults.invalid.length > 0 && (
        <View style={styles.errorBox}>
          <Text style={styles.errorBoxTitle}>{validationResults.invalid.length} rows need attention</Text>
          {validationResults.invalid.slice(0, 5).map((inv, idx) => (
            <Text key={idx} style={styles.errorItem}>• Row {inv.row}: {inv.errors.join(', ')}</Text>
          ))}
          {validationResults.invalid.length > 5 && <Text style={styles.errorItem}>...and more.</Text>}
          <Text style={styles.errorAdvice}>Please fix these in your source file and re-upload, or proceed to import only the valid rows.</Text>
        </View>
      )}

      {validationResults.valid.length > 0 && (
        <View style={styles.previewTableContainer}>
          <View style={styles.previewTableHeader}>
            <Text style={[styles.previewCell, {flex: 2}]}>Name</Text>
            <Text style={styles.previewCell}>Category</Text>
            <Text style={styles.previewCell}>Price</Text>
            <Text style={styles.previewCell}>Quantity</Text>
          </View>
          {validationResults.valid.slice(0, 5).map((row, idx) => (
            <View key={idx} style={styles.previewTableRow}>
              <Text style={[styles.previewCell, {flex: 2}]}>{row.name}</Text>
              <Text style={styles.previewCell}>{row.category}</Text>
              <Text style={styles.previewCell}>₹{row.rentalPrice}</Text>
              <Text style={styles.previewCell}>{row.stock}</Text>
            </View>
          ))}
          {validationResults.valid.length > 5 && <Text style={{padding: 10, color: Colors.textLight}}>...and {validationResults.valid.length - 5} more.</Text>}
        </View>
      )}

      {validationResults.valid.length > 0 && (
        <Pressable style={styles.primaryButton} onPress={executeImport}>
          <Text style={styles.primaryButtonText}>Import {validationResults.valid.length} Equipment</Text>
        </Pressable>
      )}
    </View>
  );

  const renderSuccess = () => (
    <View style={[styles.card, {alignItems: 'center', paddingVertical: 60}]}>
      <Ionicons name="checkmark-circle" size={80} color={Colors.success} style={{marginBottom: 20}} />
      <Text style={styles.cardTitle}>Inventory Imported Successfully</Text>
      <Text style={[styles.cardSubtitle, {textAlign: 'center', marginBottom: 40}]}>
        {validationResults.valid.length} equipment items have been added to your inventory.
      </Text>

      <View style={{flexDirection: 'row', gap: 16}}>
        <Pressable style={styles.secondaryButton} onPress={() => router.push('/(dashboard)/inventory')}>
          <Text style={styles.secondaryButtonText}>View Inventory</Text>
        </Pressable>
        <Pressable style={styles.primaryButton} onPress={() => {
          setVendorColumns([]);
          setVendorRows([]);
          setValidationResults({valid: [], invalid: []});
          router.push({ pathname: '/import', params: { step: 1 } });
        }}>
          <Text style={styles.primaryButtonText}>Import More</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Import Inventory</Text>
        <Text style={styles.subtitle}>Add multiple items to your inventory in bulk.</Text>
      </View>

      <View style={styles.stepper}>
        <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}><Text style={styles.stepText}>1</Text></View>
        <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}><Text style={styles.stepText}>2</Text></View>
        <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]}><Text style={styles.stepText}>3</Text></View>
        <View style={[styles.stepLine, step >= 4 && styles.stepLineActive]} />
        <View style={[styles.stepDot, step >= 4 && styles.stepDotActive]}><Text style={styles.stepText}>4</Text></View>
      </View>

      {step === 1 && renderSourceSelection()}
      {step === 2 && renderMapping()}
      {step === 3 && renderPreview()}
      {step === 4 && renderSuccess()}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingRight: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  subtitle: { fontSize: 14, color: Colors.textLight },
  
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 32, maxWidth: 400, alignSelf: 'center', width: '100%' },
  stepDot: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  stepDotActive: { backgroundColor: Colors.primary },
  stepText: { color: '#fff', fontWeight: 'bold' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E2E8F0', marginHorizontal: 8 },
  stepLineActive: { backgroundColor: Colors.primary },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: '#E2E8F0', maxWidth: 560, alignSelf: 'center', width: '100%', marginBottom: 40, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  cardSubtitle: { fontSize: 13, color: Colors.textLight, marginBottom: 20 },

  sourceGrid: { flexDirection: 'row', gap: 24, marginBottom: 32, flexWrap: 'wrap' },
  sourceBox: { flex: 1, minWidth: 250, borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, padding: 24, alignItems: 'center', borderStyle: 'dashed' },
  sourceBoxInner: { alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  sourceBoxTitle: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  sourceBoxDesc: { fontSize: 12, color: '#64748B' },

  templateSection: { alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 24 },
  templateText: { fontSize: 14, color: Colors.textLight, marginBottom: 4 },
  templateLink: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  primaryButton: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, alignItems: 'center', alignSelf: 'flex-start' },
  primaryButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  
  secondaryButton: { backgroundColor: '#F1F5F9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  secondaryButtonText: { color: Colors.text, fontWeight: 'bold', fontSize: 14 },

  mappingTable: { marginBottom: 32, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden' },
  mappingHeaderRow: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  mappingHeaderCell: { flex: 1, fontSize: 13, fontWeight: '600', color: '#64748B' },
  mappingRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  mappingCellLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#1E293B' },
  mappingCellInput: { flex: 1 },
  nativeSelect: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#CBD5E1', fontSize: 14, width: '100%', backgroundColor: '#fff' },

  summaryBox: { flexDirection: 'row', gap: 24, marginBottom: 24, padding: 16, backgroundColor: '#F8FAFC', borderRadius: 8 },
  summaryText: { fontSize: 15, fontWeight: '600' },

  errorBox: { backgroundColor: '#FEF2F2', padding: 16, borderRadius: 8, marginBottom: 24, borderWidth: 1, borderColor: '#FECACA' },
  errorBoxTitle: { fontSize: 15, fontWeight: '600', color: '#B91C1C', marginBottom: 8 },
  errorItem: { fontSize: 13, color: '#991B1B', marginBottom: 4, marginLeft: 8 },
  errorAdvice: { fontSize: 13, color: '#B91C1C', marginTop: 12, fontStyle: 'italic' },

  previewTableContainer: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, overflow: 'hidden', marginBottom: 24 },
  previewTableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  previewTableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  previewCell: { flex: 1, fontSize: 13, color: '#1E293B' },
  
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, padding: 12, fontSize: 14, color: '#1E293B', backgroundColor: '#fff' }
});

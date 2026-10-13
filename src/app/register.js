import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Platform, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

const Checkbox = ({ label, checked, onChange }) => (
  <Pressable style={styles.checkboxContainer} onPress={() => onChange(!checked)}>
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && <Ionicons name="checkmark" size={12} color="#fff" />}
    </View>
    <Text style={[styles.checkboxLabel, checked && { color: '#111827' }]}>{label}</Text>
  </Pressable>
);

const FileUpload = ({ label }) => {
  const [fileName, setFileName] = useState(null);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.canceled === false && result.assets && result.assets.length > 0) {
        setFileName(result.assets[0].name);
      }
    } catch (error) {
      console.log('Error picking document:', error);
    }
  };

  return (
    <View style={styles.fileUploadContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Pressable onPress={handlePickDocument} style={({ pressed }) => [styles.fileUploadBtn, pressed && { opacity: 0.7 }]}>
        <Ionicons name={fileName ? "document-text-outline" : "cloud-upload-outline"} size={16} color={Colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.fileUploadText} numberOfLines={1} ellipsizeMode="middle">{fileName || 'Select File'}</Text>
      </Pressable>
    </View>
  );
};

const Section = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const Input = ({ label, multiline, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, isFocused && styles.inputLabelFocused]}>{label}</Text>
      <View style={[
        styles.inputWrapper, 
        multiline && styles.inputWrapperMultiline,
        isFocused && styles.inputWrapperFocused
      ]}>
        <TextInput 
          style={[styles.input, multiline && styles.inputMultiline]} 
          placeholderTextColor="#9CA3AF"
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props} 
        />
      </View>
    </View>
  );
};

export default function RegisterScreen() {
  const [terms, setTerms] = useState(false);
  const [accurate, setAccurate] = useState(false);

  return (
    <View style={styles.pageContainer}>
      <View style={styles.backgroundOverlay} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.card}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color="#4B5563" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.headerContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Vendor Registration</Text>
            <Text style={styles.subtitle}>Please provide your details below.</Text>
          </View>

          <Section title="1. Business Information">
            <Input label="Vendor / Business Name*" placeholder="Enter business name" />
            <Input label="Business Type*" placeholder="e.g. Manufacturer, Distributor" />
            <Input label="Business Address*" placeholder="Full address" multiline />
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Input label="City*" placeholder="City" />
              </View>
              <View style={styles.halfWidth}>
                <Input label="State*" placeholder="State" />
              </View>
            </View>
            
            <Input label="Pincode*" placeholder="Pincode" keyboardType="numeric" />
          </Section>

          <Section title="2. Primary Contact Information">
            <Input label="Contact Person Name*" placeholder="Full name" />
            <Input label="Mobile Number*" placeholder="10-digit number" keyboardType="phone-pad" />
            <Input label="Email Address*" placeholder="vendor@example.com" keyboardType="email-address" autoCapitalize="none" />
          </Section>

          <Section title="3. Verification">
            <View style={styles.documentsGrid}>
              <FileUpload label="Business Registration / License*" />
              <FileUpload label="Government ID Proof*" />
              <FileUpload label="Address Proof*" />
            </View>
          </Section>

          <Section title="4. Account Creation">
            <Input label="Password*" placeholder="Create password" secureTextEntry />
            <Input label="Confirm Password*" placeholder="Confirm password" secureTextEntry />
          </Section>

          <Section title="5. Consent">
            <Checkbox 
              label="Agree to Terms & Conditions*" 
              checked={terms} 
              onChange={setTerms} 
            />
            <Checkbox 
              label="Confirm that the provided information is accurate*" 
              checked={accurate} 
              onChange={setAccurate} 
            />
          </Section>

          <Pressable 
            style={({ pressed }) => [
              styles.button, 
              (!terms || !accurate) && styles.buttonDisabled, 
              pressed && (!terms || !accurate ? {} : styles.buttonPressed)
            ]} 
            onPress={() => {
              if(terms && accurate) {
                if (Platform.OS === 'web') {
                  window.alert('Registration Submitted! Pending Admin Verification.');
                } else {
                  Alert.alert('Success', 'Registration Submitted! Pending Admin Verification.');
                }
                router.push('/login');
              }
            }}
            disabled={!terms || !accurate}
          >
            <Text style={[styles.buttonText, (!terms || !accurate) && styles.buttonTextDisabled]}>
              Create Vendor Account
            </Text>
          </Pressable>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <Pressable onPress={() => router.push('/login')}>
              <Text style={styles.link}>Sign In</Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: '#F3F6F9',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.7,
    backgroundImage: 'radial-gradient(circle at 10% 0%, #E0F2FE 0%, transparent 60%), radial-gradient(circle at 90% 100%, #E8F5E9 0%, transparent 60%)'
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16
  },
  card: { 
    width: '100%', 
    maxWidth: 480, 
    paddingHorizontal: 24,
    paddingVertical: 28,
    backgroundColor: '#ffffff', 
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'flex-start'
  },
  backText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500'
  },
  headerContainer: { 
    marginBottom: 32, 
    alignItems: 'center',
  },
  logo: { 
    width: 160, 
    height: 48, 
    marginBottom: 12
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1E293B', 
    marginBottom: 4, 
    fontFamily: 'system-ui, -apple-system, sans-serif' 
  },
  subtitle: { 
    fontSize: 12, 
    color: '#64748B', 
    fontFamily: 'system-ui, -apple-system, sans-serif', 
  },
  
  section: {
    marginBottom: 28,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 2, // allows for subtle border accents
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(0, 194, 203, 0.2)'
  },
  sectionContent: {
    // container for inputs
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },

  inputGroup: { marginBottom: 16 },
  inputLabel: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: '#1E293B', 
    marginBottom: 4, 
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  inputLabelFocused: {
    color: Colors.primary
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
  },
  inputWrapperMultiline: {
    alignItems: 'flex-start'
  },
  input: { 
    flex: 1, 
    paddingVertical: 8, 
    paddingHorizontal: 10, 
    fontSize: 12, 
    color: '#1E293B', 
    outlineStyle: 'none', 
    fontFamily: 'system-ui, -apple-system, sans-serif' 
  },
  inputMultiline: {
    height: 70,
    textAlignVertical: 'top'
  },

  documentsGrid: {
    gap: 12,
  },
  fileUploadContainer: {
    marginBottom: 8,
  },
  fileUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 194, 203, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 6,
    backgroundColor: 'rgba(0, 194, 203, 0.05)',
  },
  fileUploadText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 12
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary
  },
  checkboxLabel: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  
  button: { 
    backgroundColor: Colors.primary, 
    padding: 10, 
    borderRadius: 6, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 8
  },
  buttonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  buttonPressed: { 
    opacity: 0.9, 
  },
  buttonText: { 
    color: '#ffffff', 
    fontSize: 13, 
    fontWeight: '700',
  },
  buttonTextDisabled: {
    color: '#94A3B8'
  },
  
  loginContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 16 
  },
  loginText: { 
    color: '#64748B', 
    fontSize: 12 
  },
  link: { 
    color: Colors.primary, 
    fontWeight: '700', 
    fontSize: 12 
  }
});
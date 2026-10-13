import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Colors from '../constants/Colors';

export default function LoginScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container} style={styles.scrollView}>
      {/* Subtle background pattern/gradient */}
      <View style={styles.backgroundOverlay} />

      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to access your vendor dashboard.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="vendor@example.com"
              placeholderTextColor={'#A0AABF'}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={'#A0AABF'}
              secureTextEntry
            />
          </View>
        </View>

        <View style={styles.forgotPasswordContainer}>
          <Pressable>
            <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.push('/(dashboard)')}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </Pressable>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>New to MediUnify? </Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text style={styles.link}>Sign up as Vendor</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F3F6F9',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    paddingVertical: 16
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.6,
    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0, 194, 203, 0.1) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(123, 201, 111, 0.1) 0%, transparent 40%)'
  },
  card: {
    width: '90%',
    maxWidth: 360,
    paddingHorizontal: 28,
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 10px 25px rgba(11, 58, 100, 0.08), 0 1px 3px rgba(0,0,0,0.05)',
    zIndex: 10,
    marginVertical: 24
  },
  logoContainer: {
    marginBottom: 32,
    alignItems: 'center'
  },
  logo: {
    width: 240,
    height: 80,
  },
  headerContainer: { marginBottom: 28, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 8, fontFamily: 'system-ui, -apple-system, sans-serif' },
  subtitle: { fontSize: 14, color: '#6B7280', fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: 'center' },

  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, fontFamily: 'system-ui, -apple-system, sans-serif' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease'
  },
  inputIcon: { paddingHorizontal: 12 },
  input: { flex: 1, paddingVertical: 10, paddingRight: 12, fontSize: 13, color: '#1E293B', outlineStyle: 'none', fontFamily: 'system-ui, -apple-system, sans-serif' },

  forgotPasswordContainer: { alignItems: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: Colors.primary, fontSize: 12, fontWeight: '600' },

  button: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(30, 58, 138, 0.15)'
  },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  registerText: { color: '#64748B', fontSize: 13 },
  link: { color: Colors.primary, fontWeight: 'bold', fontSize: 13 }
});
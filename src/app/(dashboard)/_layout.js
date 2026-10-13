import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform, ScrollView } from 'react-native';
import { Slot, router, usePathname } from 'expo-router';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useMockData } from '../../context/MockDataContext';

export default function DashboardLayout() {
  const pathname = usePathname();
  const { notifications = [], simulateNewRequest, vendorProfile } = useMockData();
  const hasUnread = notifications.some(n => !n.isRead);
  
  const navSections = [
    {
      items: [
        { label: 'Dashboard', path: '/', icon: 'grid-outline' },
      ]
    },
    {
      title: 'Equipment',
      items: [
        { label: 'My Equipment', path: '/equipment', icon: 'cube-outline' },
        { label: 'Inventory', path: '/inventory', icon: 'layers-outline' },
      ]
    },
    {
      title: 'Rental Management',
      items: [
        { label: 'Rental Requests', path: '/requests', icon: 'document-text-outline' },
        { label: 'Active Rentals', path: '/rentals', icon: 'car-outline' },
        { label: 'Rental History', path: '/history', icon: 'time-outline' },
      ]
    },

    {
      items: [
        { label: 'Notifications', path: '/notifications', icon: 'notifications-outline' },
        { label: 'Profile', path: '/profile', icon: 'person-outline' },
        { label: 'Settings', path: '/settings', icon: 'settings-outline' },
      ]
    }
  ];

  const [showSearchModal, setShowSearchModal] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const contentScrollRef = React.useRef(null);

  React.useEffect(() => {
    setShowProfileMenu(false);
    if (Platform.OS === 'web') {
      const el = document.getElementById('dashboard-content-scroll');
      if (el) el.scrollTop = 0;
      if (contentScrollRef.current && contentScrollRef.current.scrollTop !== undefined) {
        contentScrollRef.current.scrollTop = 0;
      }
    }
  }, [pathname]);

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <ScrollView style={styles.navContainer} showsVerticalScrollIndicator={false}>
          {navSections.map((section, sIdx) => (
            <View key={sIdx} style={styles.navSection}>
              {section.title && <Text style={styles.sectionHeader}>{section.title}</Text>}
              {section.items.map((item, idx) => {
                const isActive = pathname === item.path || pathname === `/(dashboard)${item.path}` || (pathname === '/' && item.path === '/');
                return (
                  <Pressable 
                    key={idx} 
                    style={[styles.navItem, isActive && styles.navItemActive]} 
                    onPress={() => router.push(item.path === '/' ? '/(dashboard)' : `/(dashboard)${item.path}`)}
                  >
                    <Ionicons 
                      name={item.icon} 
                      size={20} 
                      color={isActive ? Colors.primary : Colors.textLight} 
                      style={styles.navIcon}
                    />
                    <Text style={[styles.navText, isActive && styles.navTextActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <Pressable style={styles.logoutButton} onPress={() => router.replace('/login')}>
          <Ionicons name="log-out-outline" size={20} color={Colors.danger} style={styles.navIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        {/* Beautiful Background Overlay */}
        <View style={styles.backgroundOverlay} />

        {/* Top Header */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.headerGreeting}>Hello, Vendor!</Text>
            <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <Pressable 
              style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginRight: 12 }} 
              onPress={() => {
                const newId = simulateNewRequest();
                if (Platform.OS === 'web') window.alert(`Received new simulated request: ${newId}`);
              }}>
              <Text style={{ color: '#1E3A8A', fontWeight: 'bold', fontSize: 13 }}>+ Simulate New Order</Text>
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => setShowSearchModal(true)}>
              <Ionicons name="search-outline" size={22} color={Colors.text} />
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={() => router.push('/notifications')}>
              {hasUnread && <View style={styles.notificationBadge} />}
              <Ionicons name="notifications-outline" size={22} color={Colors.text} />
            </Pressable>
            <View style={styles.avatarWrapper}>
              <Pressable 
                style={styles.avatar} 
                onPress={() => setShowProfileMenu(prev => !prev)}
                accessibilityRole="button"
                accessibilityLabel="Open user menu"
              >
                <Text style={styles.avatarText}>
                  {vendorProfile?.businessName ? vendorProfile.businessName.charAt(0).toUpperCase() : 'V'}
                </Text>
              </Pressable>

              {showProfileMenu && (
                <>
                  <Pressable 
                    style={styles.dropdownBackdrop} 
                    onPress={() => setShowProfileMenu(false)} 
                  />
                  <View style={styles.profileDropdown}>
                    <View style={styles.dropdownUserInfo}>
                      <View style={styles.dropdownAvatarLarge}>
                        <Text style={styles.dropdownAvatarLargeText}>
                          {vendorProfile?.businessName ? vendorProfile.businessName.charAt(0).toUpperCase() : 'V'}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.dropdownUserName} numberOfLines={1}>
                          {vendorProfile?.businessName || 'Medicare Equipments'}
                        </Text>
                        <Text style={styles.dropdownUserEmail} numberOfLines={1}>
                          {vendorProfile?.email || 'vendor@medicare.com'}
                        </Text>
                        <View style={styles.dropdownVerifiedPill}>
                          <Ionicons name="shield-checkmark" size={11} color="#059669" />
                          <Text style={styles.dropdownVerifiedText}>Verified Vendor</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.dropdownDivider} />

                    <Pressable 
                      style={styles.dropdownMenuItem}
                      onPress={() => {
                        setShowProfileMenu(false);
                        router.push('/profile');
                      }}
                    >
                      <Ionicons name="person-outline" size={16} color="#0F4C75" style={styles.dropdownMenuIcon} />
                      <Text style={styles.dropdownMenuText}>My Profile</Text>
                      <Ionicons name="chevron-forward" size={14} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                    </Pressable>

                    <Pressable 
                      style={styles.dropdownMenuItem}
                      onPress={() => {
                        setShowProfileMenu(false);
                        router.push('/settings');
                      }}
                    >
                      <Ionicons name="settings-outline" size={16} color="#0F4C75" style={styles.dropdownMenuIcon} />
                      <Text style={styles.dropdownMenuText}>Settings & Preferences</Text>
                      <Ionicons name="chevron-forward" size={14} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                    </Pressable>

                    <View style={styles.dropdownDivider} />

                    <Pressable 
                      style={[styles.dropdownMenuItem, styles.dropdownMenuItemDanger]}
                      onPress={() => {
                        setShowProfileMenu(false);
                        router.replace('/login');
                      }}
                    >
                      <Ionicons name="log-out-outline" size={16} color={Colors.danger} style={styles.dropdownMenuIcon} />
                      <Text style={[styles.dropdownMenuText, { color: Colors.danger, fontWeight: '600' }]}>Logout</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Route Content via Slot */}
        <View nativeID="dashboard-content-scroll" ref={contentScrollRef} style={styles.contentScroll}>
          <Slot />
        </View>
      </View>

      {/* Global Search Modal */}
      {showSearchModal && (
        <View style={styles.searchModalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowSearchModal(false)} />
          <View style={styles.searchModalContent}>
            <View style={styles.searchModalHeader}>
              <Ionicons name="search" size={22} color={Colors.textLight} />
              <input
                type="text"
                autoFocus
                placeholder="Search rentals, equipment, or requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchModalInput}
              />
              <Pressable onPress={() => setShowSearchModal(false)} style={styles.closeSearchBtn}>
                <Text style={styles.closeSearchText}>ESC</Text>
              </Pressable>
            </View>
            <View style={styles.searchModalBody}>
              {searchQuery.length > 0 ? (
                <View style={styles.searchEmptyState}>
                  <Ionicons name="search-outline" size={32} color="#CBD5E1" />
                  <Text style={styles.searchEmptyText}>No results found for "{searchQuery}"</Text>
                </View>
              ) : (
                <View style={styles.searchSuggestions}>
                  <Text style={styles.searchSuggestionsTitle}>Quick Links</Text>
                  <Pressable style={styles.searchSuggestionItem} onPress={() => { setShowSearchModal(false); router.push('/requests'); }}>
                    <Ionicons name="document-text-outline" size={18} color={Colors.textLight} />
                    <Text style={styles.searchSuggestionText}>View New Requests</Text>
                  </Pressable>
                  <Pressable style={styles.searchSuggestionItem} onPress={() => { setShowSearchModal(false); router.push('/equipment'); }}>
                    <Ionicons name="add-circle-outline" size={18} color={Colors.textLight} />
                    <Text style={styles.searchSuggestionText}>Add New Equipment</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: 'transparent' },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0F9FF',
    backgroundImage: 'linear-gradient(to right bottom, #E0F2FE 0%, #F0FDF4 100%)',
    zIndex: 0
  },
  sidebar: { 
    width: 250, 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 16,
    justifyContent: 'space-between',
    boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
    height: '100%'
  },
  logoContainer: { paddingHorizontal: 20, marginBottom: 16 },
  logo: { width: 130, height: 36 },
  navContainer: { flex: 1, paddingHorizontal: 12 },
  navSection: { marginBottom: 6 },
  sectionHeader: { fontSize: 10, fontWeight: '700', color: '#94A3B8', paddingHorizontal: 12, marginBottom: 4, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  navItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 8,
    marginBottom: 2 
  },
  navItemActive: { backgroundColor: '#4AD6A115' },
  navIcon: { marginRight: 10 },
  navText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  navTextActive: { color: '#0F4C75', fontWeight: '800' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 8
  },
  logoutText: { color: Colors.danger, fontSize: 13, fontWeight: '600' },
  
  mainContent: { flex: 1, overflow: 'hidden' },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 20,
    backgroundColor: 'transparent',
    zIndex: 10
  },
  headerGreeting: { fontSize: 20, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  headerDate: { fontSize: 13, color: '#64748B' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBtn: { padding: 10, backgroundColor: '#FFFFFF', borderRadius: 24, position: 'relative', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  notificationBadge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger, zIndex: 1, borderWidth: 1.5, borderColor: '#fff' },
  avatarWrapper: {
    position: 'relative',
    zIndex: 50,
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#0369A1', 
    justifyContent: 'center', 
    alignItems: 'center', 
    boxShadow: '0 4px 10px rgba(3, 105, 161, 0.3)',
    ...(Platform.OS === 'web' && { cursor: 'pointer', userSelect: 'none' })
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  dropdownBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 90,
  },
  profileDropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 250,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 100,
  },
  dropdownUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 4,
  },
  dropdownAvatarLarge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0369A1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownAvatarLargeText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dropdownUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  dropdownUserEmail: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  dropdownVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dropdownVerifiedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 6,
  },
  dropdownMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  dropdownMenuItemDanger: {
    marginTop: 2,
  },
  dropdownMenuIcon: {
    marginRight: 10,
  },
  dropdownMenuText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  contentScroll: { flex: 1, paddingHorizontal: 32, paddingBottom: 32, overflowY: 'auto', zIndex: 1 },
  
  searchModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    zIndex: 100,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80
  },
  searchModalContent: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  searchModalInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0F172A',
    borderWidth: 0,
    outlineStyle: 'none',
    backgroundColor: 'transparent'
  },
  closeSearchBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 6
  },
  closeSearchText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B'
  },
  searchModalBody: {
    padding: 16,
    minHeight: 200
  },
  searchEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  searchEmptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B'
  },
  searchSuggestions: {
    padding: 8
  },
  searchSuggestionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  searchSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4
  },
  searchSuggestionText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#334155',
    fontWeight: '500'
  }
});
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  StyleSheet, 
  Modal, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

const SettingsScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState({ 
    name: '', 
    email: '', 
    image: '' 
  });
  const [darkMode, setDarkMode] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [appVersion] = useState('v2.1.0');
  const [isOnline, setIsOnline] = useState(true);

  // Check network status on mount
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      
      if (!state.isConnected) {
        Alert.alert(
          'Offline Mode',
          'You are currently offline. Some features may be limited.',
          [{ text: 'OK' }]
        );
      }
    });
    
    return () => unsubscribeNetInfo();
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Set initial profile data from auth
        setProfileData({
          name: currentUser.displayName || 'No Name',
          email: currentUser.email || '',
          image: currentUser.photoURL || '',
        });
        
        // Only try to fetch from Firestore if online
        if (isOnline) {
          try {
            const docRef = doc(db, 'users', currentUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              setProfileData({
                ...profileData,
                ...docSnap.data()
              });
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
            if (error instanceof Error && error.message.includes('offline')) {
              Alert.alert(
                'Offline Mode',
                'Cannot fetch profile data while offline. Using cached information.',
                [{ text: 'OK' }]
              );
            }
          }
        }
        
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
    
    return unsubscribeAuth;
  }, [isOnline]);

  const handleSave = async () => {
    if (user) {
      setLoading(true);
      try {
        if (!isOnline) {
          throw new Error('You are offline. Cannot save changes.');
        }
        
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          name: profileData.name,
          email: profileData.email,
          image: profileData.image,
        });
        setModalVisible(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } catch (error: any) {
        console.error('Error updating profile:', error);
        Alert.alert(
          'Error', 
          error.message || 'Failed to update profile. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Network Status Indicator */}
      <View style={[
        styles.networkStatus, 
        isOnline ? styles.onlineStatus : styles.offlineStatus
      ]}>
        <MaterialCommunityIcons 
          name={isOnline ? "wifi" : "wifi-off"} 
          size={18} 
          color="white" 
        />
        <Text style={styles.networkText}>
          {isOnline ? "Online" : "Offline"}
        </Text>
      </View>
      
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="cog" size={32} color="#3498db" />
        <Text style={[styles.heading, darkMode && styles.darkText]}>Settings</Text>
        <Text style={[styles.subtitle, darkMode && styles.darkText]}>Manage your account and preferences</Text>
      </View>

      {/* Profile Card */}
      <View style={[styles.card, darkMode && styles.darkCard]}>
        <View style={styles.profileHeader}>
          {profileData.image ? (
            <Image source={{ uri: profileData.image }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <MaterialCommunityIcons name="account" size={40} color="#7f8c8d" />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, darkMode && styles.darkText]}>{profileData.name}</Text>
            <Text style={[styles.profileEmail, darkMode && styles.darkText]}>{profileData.email}</Text>
            {!isOnline && (
              <Text style={styles.offlineNote}>Offline mode - data may be outdated</Text>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={[styles.editButton, darkMode && styles.darkEditButton]}
          onPress={() => setModalVisible(true)}
          disabled={!isOnline}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#3498db" />
          <Text style={styles.editButtonText}>
            {isOnline ? "Edit Profile" : "Offline - Edit Disabled"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Card */}
      <View style={[styles.card, darkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <MaterialCommunityIcons name="theme-light-dark" size={24} color="#3498db" />
            <Text style={[styles.preferenceLabel, darkMode && styles.darkText]}>Dark Mode</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            thumbColor={darkMode ? "#3498db" : "#f5f5f5"}
            trackColor={{ false: "#bdc3c7", true: "#3498db33" }}
          />
        </View>
        
        <View style={styles.preferenceItem}>
          <View style={styles.preferenceInfo}>
            <MaterialCommunityIcons name="bell" size={24} color="#3498db" />
            <Text style={[styles.preferenceLabel, darkMode && styles.darkText]}>Notifications</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            thumbColor={notifications ? "#3498db" : "#f5f5f5"}
            trackColor={{ false: "#bdc3c7", true: "#3498db33" }}
          />
        </View>
      </View>

      {/* Support Card */}
      <View style={[styles.card, darkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, darkMode && styles.darkText]}>Support</Text>
        
        <TouchableOpacity style={styles.supportItem} disabled={!isOnline}>
          <View style={styles.supportInfo}>
            <MaterialCommunityIcons name="book" size={24} color="#3498db" />
            <Text style={[styles.supportLabel, darkMode && styles.darkText]}>User Manual</Text>
          </View>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={isOnline ? "#7f8c8d" : "#bdc3c7"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.supportItem} disabled={!isOnline}>
          <View style={styles.supportInfo}>
            <MaterialCommunityIcons name="help-circle" size={24} color="#3498db" />
            <Text style={[styles.supportLabel, darkMode && styles.darkText]}>FAQs</Text>
          </View>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={isOnline ? "#7f8c8d" : "#bdc3c7"} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.supportItem} disabled={!isOnline}>
          <View style={styles.supportInfo}>
            <MaterialCommunityIcons name="email" size={24} color="#3498db" />
            <Text style={[styles.supportLabel, darkMode && styles.darkText]}>Contact Support</Text>
          </View>
          <MaterialCommunityIcons 
            name="chevron-right" 
            size={24} 
            color={isOnline ? "#7f8c8d" : "#bdc3c7"} 
          />
        </TouchableOpacity>
      </View>

      {/* About Card */}
      <View style={[styles.card, darkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, darkMode && styles.darkText]}>About</Text>
        
        <View style={styles.aboutItem}>
          <Text style={[styles.aboutLabel, darkMode && styles.darkText]}>App Version</Text>
          <Text style={[styles.aboutValue, darkMode && styles.darkText]}>{appVersion}</Text>
        </View>
        
        <View style={styles.aboutItem}>
          <Text style={[styles.aboutLabel, darkMode && styles.darkText]}>Terms of Service</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#7f8c8d" />
        </View>
        
        <View style={styles.aboutItem}>
          <Text style={[styles.aboutLabel, darkMode && styles.darkText]}>Privacy Policy</Text>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#7f8c8d" />
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <MaterialCommunityIcons name="logout" size={24} color="#e74c3c" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={[styles.modalContainer, darkMode && styles.darkModalContainer]}>
          <View style={[styles.modalContent, darkMode && styles.darkModalContent]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, darkMode && styles.darkText]}>Full Name</Text>
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                value={profileData.name}
                onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                placeholder="Enter your name"
                placeholderTextColor={darkMode ? "#7f8c8d" : "#bdc3c7"}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, darkMode && styles.darkText]}>Email Address</Text>
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                value={profileData.email}
                onChangeText={(text) => setProfileData({ ...profileData, email: text })}
                placeholder="Enter your email"
                placeholderTextColor={darkMode ? "#7f8c8d" : "#bdc3c7"}
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, darkMode && styles.darkText]}>Profile Photo URL</Text>
              <TextInput
                style={[styles.input, darkMode && styles.darkInput]}
                value={profileData.image}
                onChangeText={(text) => setProfileData({ ...profileData, image: text })}
                placeholder="Paste image URL"
                placeholderTextColor={darkMode ? "#7f8c8d" : "#bdc3c7"}
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.saveButton,
                !isOnline && styles.disabledButton
              ]}
              onPress={handleSave}
              disabled={loading || !isOnline}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isOnline ? "Save Changes" : "Offline - Save Disabled"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 20,
    marginBottom: 10,
    alignSelf: 'center',
  },
  onlineStatus: {
    backgroundColor: '#2ecc71',
  },
  offlineStatus: {
    backgroundColor: '#e74c3c',
  },
  networkText: {
    color: 'white',
    fontWeight: '500',
    marginLeft: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  profilePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  offlineNote: {
    fontSize: 12,
    color: '#e74c3c',
    fontStyle: 'italic',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#e8f4fc',
    marginTop: 10,
  },
  darkEditButton: {
    backgroundColor: '#2c3e50',
  },
  editButtonText: {
    color: '#3498db',
    fontWeight: '600',
    marginLeft: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  preferenceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 15,
  },
  supportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  supportInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  supportLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 15,
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  aboutLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  aboutValue: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutText: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  darkModalContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
  },
  darkModalContent: {
    backgroundColor: '#1e1e1e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  darkInput: {
    backgroundColor: '#2c3e50',
    borderColor: '#34495e',
    color: '#fff',
  },
  saveButton: {
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default SettingsScreen;
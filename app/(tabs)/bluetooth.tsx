import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Device from 'expo-device';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import RNBluetoothClassic, { BluetoothDevice } from 'react-native-bluetooth-classic';

export default function Bluetooth() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isBtEnabled, setIsBtEnabled] = useState(false);

  // Check Bluetooth status
  const checkBluetooth = async () => {
    try {
      const enabled = await RNBluetoothClassic.isBluetoothEnabled();
      setIsBtEnabled(enabled);
      return enabled;
    } catch (error) {
      console.error('Bluetooth check failed', error);
      return false;
    }
  };

  // Request Bluetooth permissions
 const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    // Android permissions
    const permissions = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ];
    
    if (Device.osVersion && parseInt(Device.osVersion, 10) < 12) {
      permissions.splice(1, 2); // Remove BLUETOOTH_SCAN/CONNECT for older Android
    }
    
    const granted = await PermissionsAndroid.requestMultiple(permissions);
    return Object.values(granted).every(
      status => status === PermissionsAndroid.RESULTS.GRANTED
    );
  } else {
    // iOS permissions
    const { status } = await Permissions.askAsync(Permissions.BLUETOOTH);
    return status === 'granted';
  }
};

  // Discover available devices
  const discoverDevices = async () => {
    try {
      setScanning(true);
      setDevices([]);
      
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert('Permissions required', 'Bluetooth and location permissions are needed to find devices');
        return;
      }

      const enabled = await checkBluetooth();
      if (!enabled) {
        Alert.alert('Bluetooth disabled', 'Please enable Bluetooth to discover devices');
        return;
      }

      const discovered = await RNBluetoothClassic.startDiscovery();
      setDevices(discovered);
    } catch (error) {
      console.error('Discovery error', error);
      Alert.alert('Error', 'Failed to discover devices: ' + error.message);
    } finally {
      setScanning(false);
    }
  };

  // Connect to device
  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      setLoading(true);
      const isConnected = await device.connect();
      
      if (isConnected) {
        setConnectedDevice(device);
      } else {
        Alert.alert('Connection failed', 'Could not connect to the device');
      }
    } catch (error) {
      console.error('Connection error', error);
      Alert.alert('Error', 'Connection failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect device
  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        setLoading(true);
        await connectedDevice.disconnect();
        setConnectedDevice(null);
      } catch (error) {
        console.error('Disconnection error', error);
        Alert.alert('Error', 'Disconnection failed: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Initial check
  useEffect(() => {
    checkBluetooth();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="bluetooth" size={32} color="#3498db" />
        <Text style={styles.title}>Bluetooth Connection</Text>
        <Text style={styles.subtitle}>Connect to your E-Cleaning device</Text>
      </View>

      {/* Connection Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <MaterialCommunityIcons 
            name={connectedDevice ? "bluetooth-connected" : "bluetooth-off"} 
            size={28} 
            color={connectedDevice ? "#2ecc71" : "#e74c3c"} 
          />
          <Text style={styles.statusTitle}>
            {connectedDevice ? "Connected" : "Not Connected"}
          </Text>
        </View>
        
        {connectedDevice ? (
          <View style={styles.connectionDetails}>
            <Text style={styles.connectedDeviceName}>{connectedDevice.name}</Text>
            <Text style={styles.connectedDeviceAddress}>{connectedDevice.address}</Text>
            
            <TouchableOpacity 
              style={[styles.button, styles.disconnectButton]}
              onPress={disconnectDevice}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons name="link-off" size={20} color="white" />
                  <Text style={styles.buttonText}>Disconnect</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.connectionHint}>
            Select a device below to establish connection
          </Text>
        )}
      </View>

      {/* Device Discovery Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Devices</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={discoverDevices}
            disabled={scanning}
          >
            {scanning ? (
              <ActivityIndicator color="#3498db" />
            ) : (
              <MaterialCommunityIcons name="refresh" size={24} color="#3498db" />
            )}
          </TouchableOpacity>
        </View>
        
        {devices.length === 0 ? (
          <View style={styles.noDevicesContainer}>
            <MaterialCommunityIcons 
              name={isBtEnabled ? "bluetooth-search" : "bluetooth-off"} 
              size={48} 
              color="#bdc3c7" 
            />
            <Text style={styles.noDevicesText}>
              {scanning ? "Scanning..." : "No devices found"}
            </Text>
            <Text style={styles.noDevicesHint}>
              {!isBtEnabled 
                ? "Bluetooth is disabled. Please enable Bluetooth to discover devices" 
                : "Make sure your device is powered on and in pairing mode"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={devices}
            scrollEnabled={true}
            keyExtractor={(item) => item.address}
            contentContainerStyle={styles.deviceList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.deviceButton}
                onPress={() => connectToDevice(item)}
                disabled={!!connectedDevice || loading}
              >
                <View style={styles.deviceInfo}>
                  <MaterialCommunityIcons 
                    name="bluetooth" 
                    size={24} 
                    color="#3498db" 
                  />
                  <View style={styles.deviceTextContainer}>
                    <Text style={styles.deviceName}>
                      {item.name || "Unknown Device"}
                    </Text>
                    <Text style={styles.deviceAddress}>{item.address}</Text>
                  </View>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Connection Help Section */}
      <View style={styles.helpCard}>
        <View style={styles.helpHeader}>
          <MaterialCommunityIcons name="help-circle" size={24} color="#3498db" />
          <Text style={styles.helpTitle}>Connection Help</Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.helpText}>Ensure Bluetooth is enabled on your phone</Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.helpText}>Make sure your E-Cleaning device is powered on</Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.helpText}>Device should be in pairing mode (blinking blue light)</Text>
        </View>
        <View style={styles.helpItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.helpText}>Keep your phone within 3 meters of the device</Text>
        </View>
      </View>
    </View>
  );
}

// Styles remain the same as in your original code
const styles = StyleSheet.create({
   container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#2c3e50',
  },
  connectionDetails: {
    alignItems: 'center',
  },
  connectedDeviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 5,
  },
  connectedDeviceAddress: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  connectionHint: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginTop: 10,
  },
  disconnectButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  refreshButton: {
    padding: 8,
  },
  deviceList: {
    paddingBottom: 5,
  },
  deviceButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  deviceButtonConnected: {
    borderWidth: 2,
    borderColor: '#2ecc71',
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  connectedDeviceText: {
    color: '#2ecc71',
    fontWeight: 'bold',
  },
  deviceAddress: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 3,
  },
  noDevicesContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noDevicesText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2c3e50',
    marginTop: 15,
  },
  noDevicesHint: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  helpCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#2c3e50',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3498db',
    marginTop: 8,
    marginRight: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#2c3e50',
    flex: 1,
  },
});
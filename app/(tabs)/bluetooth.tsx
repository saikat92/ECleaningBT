import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function Bluetooth() {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchDevices = async () => {
    try {
      setScanning(true);
      const available = await RNBluetoothClassic.getBondedDevices();
      setDevices(available);
    } catch (e) {
      console.error('Error listing devices', e);
    } finally {
      setScanning(false);
    }
  };

  const connectToDevice = async (device: BluetoothDevice) => {
    try {
      setLoading(true);
      const connected = await device.connect();
      if (connected) {
        setConnectedDevice(device);
      }
    } catch (e) {
      console.error('Connection failed', e);
      alert(`Connection failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        setLoading(true);
        await connectedDevice.disconnect();
        setConnectedDevice(null);
      } catch (e) {
        console.error('Disconnection failed', e);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
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

      {/* Device List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Devices</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchDevices}
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
            <MaterialCommunityIcons name="bluetooth-search" size={48} color="#bdc3c7" />
            <Text style={styles.noDevicesText}>No devices found</Text>
            <Text style={styles.noDevicesHint}>Make sure your device is powered on and in pairing mode</Text>
          </View>
        ) : (
          <FlatList
            data={devices}
            scrollEnabled={false}
            keyExtractor={(item) => item.address}
            contentContainerStyle={styles.deviceList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.deviceButton,
                  connectedDevice?.address === item.address && styles.deviceButtonConnected
                ]}
                onPress={() => connectToDevice(item)}
                disabled={!!connectedDevice || loading}
              >
                <View style={styles.deviceInfo}>
                  <MaterialCommunityIcons 
                    name="bluetooth" 
                    size={24} 
                    color={connectedDevice?.address === item.address ? "#2ecc71" : "#3498db"} 
                  />
                  <View style={styles.deviceTextContainer}>
                    <Text 
                      style={[
                        styles.deviceName,
                        connectedDevice?.address === item.address && styles.connectedDeviceText
                      ]}
                    >
                      {item.name || "Unknown Device"}
                    </Text>
                    <Text style={styles.deviceAddress}>{item.address}</Text>
                  </View>
                </View>
                
                {connectedDevice?.address === item.address ? (
                  <MaterialCommunityIcons name="check-circle" size={24} color="#2ecc71" />
                ) : (
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#7f8c8d" />
                )}
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Connection Help */}
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
    </ScrollView>
  );
}

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
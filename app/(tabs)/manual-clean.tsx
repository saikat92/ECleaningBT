import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ManualClean = () => {
  const [motorSpeed, setMotorSpeed] = useState('1200');
  const [motorRunning, setMotorRunning] = useState(false);
  const [uvOn, setUvOn] = useState(false);
  const [motorTime, setMotorTime] = useState(0);
  const [uvTime, setUvTime] = useState(0);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showConfirmStop, setShowConfirmStop] = useState(false);
  const [rpmInputFocused, setRpmInputFocused] = useState(false);

  useEffect(() => {
    let motorTimer: NodeJS.Timeout;
    if (motorRunning) {
      motorTimer = setInterval(() => {
        setMotorTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(motorTimer);
  }, [motorRunning]);

  useEffect(() => {
    let uvTimer: NodeJS.Timeout;
    if (uvOn) {
      uvTimer = setInterval(() => {
        setUvTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(uvTimer);
  }, [uvOn]);

  const handleEmergencyStop = () => {
    setMotorRunning(false);
    setUvOn(false);
    setShowEmergencyModal(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const toggleMotor = () => {
    if (motorRunning) {
      setShowConfirmStop(true);
    } else {
      // Validate RPM input before starting
      if (!motorSpeed || isNaN(parseInt(motorSpeed))) {
        alert('Please enter a valid RPM value');
        return;
      }
      
      const rpm = parseInt(motorSpeed);
      if (rpm < 10 || rpm > 1800) {
        alert('RPM must be between 10 and 1800');
        return;
      }
      
      setMotorRunning(true);
    }
  };

  const toggleUV = () => {
    setUvOn(!uvOn);
  };

  const handleRpmChange = (text: string) => {
    // Only allow numbers
    if (/^\d*$/.test(text)) {
      setMotorSpeed(text);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="hand-pointing-right" size={32} color="#3498db" />
        <Text style={styles.title}>Manual Cleaning</Text>
        <Text style={styles.subtitle}>Full control over cleaning parameters</Text>
      </View>

      {/* Motor Control Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="engine" size={24} color="#3498db" />
          <Text style={styles.cardTitle}>Motor Control</Text>
        </View>
        
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Motor Speed (RPM)</Text>
          <Text style={styles.rpmValue}>{motorSpeed} RPM</Text>
        </View>
        
        {/* RPM Input Field */}
        <View style={[styles.inputContainer, rpmInputFocused && styles.inputFocused]}>
          <TextInput
            style={styles.input}
            value={motorSpeed}
            onChangeText={handleRpmChange}
            keyboardType="number-pad"
            placeholder="10 - 1800"
            onFocus={() => setRpmInputFocused(true)}
            onBlur={() => setRpmInputFocused(false)}
            editable={!motorRunning}
          />
          <Text style={styles.rpmUnit}>RPM</Text>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              motorRunning ? styles.toggleButtonOn : styles.toggleButtonOff,
              motorRunning && { backgroundColor: '#2ecc71' }
            ]}
            onPress={toggleMotor}
            disabled={showEmergencyModal}
          >
            <MaterialCommunityIcons 
              name={motorRunning ? "motion-sensor" : "motion-off"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.toggleButtonText}>
              {motorRunning ? "RUNNING" : "START MOTOR"}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.timerContainer}>
            <MaterialCommunityIcons name="timer" size={20} color="#7f8c8d" />
            <Text style={styles.timerText}>{formatTime(motorTime)}</Text>
          </View>
        </View>
      </View>

      {/* UV Lamp Control Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="lightbulb-on" size={24} color="#3498db" />
          <Text style={styles.cardTitle}>UV Lamp Control</Text>
        </View>
        
        <View style={styles.uvStatus}>
          <MaterialCommunityIcons 
            name={uvOn ? "lightbulb-on" : "lightbulb-off"} 
            size={40} 
            color={uvOn ? "#f1c40f" : "#bdc3c7"} 
          />
          <Text style={[styles.uvStatusText, uvOn && { color: "#f1c40f" }]}>
            {uvOn ? "UV LAMP ACTIVE" : "UV LAMP INACTIVE"}
          </Text>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              uvOn ? styles.toggleButtonOn : styles.toggleButtonOff,
              uvOn && { backgroundColor: '#f1c40f' }
            ]}
            onPress={toggleUV}
            disabled={showEmergencyModal}
          >
            <MaterialCommunityIcons 
              name={uvOn ? "power-plug" : "power-plug-off"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.toggleButtonText}>
              {uvOn ? "TURN OFF" : "TURN ON"}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.timerContainer}>
            <MaterialCommunityIcons name="timer" size={20} color="#7f8c8d" />
            <Text style={styles.timerText}>{formatTime(uvTime)}</Text>
          </View>
        </View>
      </View>

      {/* Emergency Stop Section */}
      <View style={styles.emergencySection}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => setShowEmergencyModal(true)}
        >
          <MaterialCommunityIcons name="alert-octagon" size={32} color="white" />
          <Text style={styles.emergencyText}>EMERGENCY STOP</Text>
        </TouchableOpacity>
        <Text style={styles.emergencyHint}>Press only in critical situations</Text>
      </View>

      {/* Status Indicators */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <MaterialCommunityIcons 
              name="engine" 
              size={24} 
              color={motorRunning ? "#2ecc71" : "#e74c3c"} 
            />
            <Text style={styles.statusLabel}>Motor</Text>
            <Text style={styles.statusValue}>
              {motorRunning ? "Running" : "Stopped"}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <MaterialCommunityIcons 
              name="lightbulb-on" 
              size={24} 
              color={uvOn ? "#f1c40f" : "#7f8c8d"} 
            />
            <Text style={styles.statusLabel}>UV Lamp</Text>
            <Text style={styles.statusValue}>
              {uvOn ? "Active" : "Inactive"}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <MaterialCommunityIcons 
              name="shield-check" 
              size={24} 
              color="#2ecc71" 
            />
            <Text style={styles.statusLabel}>System</Text>
            <Text style={styles.statusValue}>
              {showEmergencyModal ? "Emergency" : "Normal"}
            </Text>
          </View>
        </View>
      </View>

      {/* Emergency Stop Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showEmergencyModal}
        onRequestClose={() => setShowEmergencyModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="alert-octagon" size={60} color="#e74c3c" />
            <Text style={styles.modalTitle}>EMERGENCY STOP</Text>
            <Text style={styles.modalText}>
              This will immediately stop all operations. Are you sure you want to proceed?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowEmergencyModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.emergencyModalButton]}
                onPress={handleEmergencyStop}
              >
                <Text style={styles.modalButtonText}>Confirm Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Confirm Motor Stop Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmStop}
        onRequestClose={() => setShowConfirmStop(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="engine-off" size={60} color="#3498db" />
            <Text style={styles.modalTitle}>Stop Motor?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to stop the motor?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmStop(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  setMotorRunning(false);
                  setShowConfirmStop(false);
                }}
              >
                <Text style={styles.modalButtonText}>Stop Motor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
    textAlign: 'center',
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#2c3e50',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  controlLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  rpmValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3498db',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  inputFocused: {
    borderColor: '#3498db',
    backgroundColor: '#e8f4fc',
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#2c3e50',
  },
  rpmUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f8c8d',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    flex: 1,
    marginRight: 15,
    justifyContent: 'center',
  },
  toggleButtonOff: {
    backgroundColor: '#3498db',
  },
  toggleButtonOn: {
    backgroundColor: '#e74c3c',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginLeft: 8,
  },
  uvStatus: {
    alignItems: 'center',
    marginVertical: 15,
  },
  uvStatusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#7f8c8d',
  },
  emergencySection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  emergencyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
  emergencyHint: {
    marginTop: 10,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  statusCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginTop: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#2c3e50',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    padding: 15,
    borderRadius: 12,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f1f2f6',
  },
  confirmButton: {
    backgroundColor: '#3498db',
  },
  emergencyModalButton: {
    backgroundColor: '#e74c3c',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManualClean;
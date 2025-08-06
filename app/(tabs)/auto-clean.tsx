import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Modal,
  ActivityIndicator
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";

// Vegetable cleaning times (seconds)
const veggieData: { [key: string]: number } = {
  Tomato: 30,
  Potato: 90,
  Spinach: 75,
  Carrot: 80,
  Cabbage: 70,
  Broccoli: 85,
  Lettuce: 65,
  Cucumber: 50,
};

const conveyorLength = 1.82; // meters

const AutoCleanScreen = () => {
  const [selectedVeggie, setSelectedVeggie] = useState("Tomato");
  const [timeRequired, setTimeRequired] = useState(30); // seconds
  const [motorRPM, setMotorRPM] = useState(0);
  const [running, setRunning] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const calculateRPM = (timeSec: number) => {
    // Calculate RPM from time & belt length → RPM = (60 * beltLength) / (timeRequired)
    const mps = conveyorLength / timeSec;
    const rpm = (mps * 60) / (2 * Math.PI * 0.05); // assuming pulley radius ≈ 5 cm
    return Math.round(rpm);
  };

  useEffect(() => {
    const time = veggieData[selectedVeggie];
    setTimeRequired(time);
    setCountdown(time);
    setMotorRPM(calculateRPM(time));
  }, [selectedVeggie]);

  const startCleaning = () => {
    setRunning(true);
    setShowConfirmation(false);
    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setRunning(false);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setIntervalId(id);
  };

  const stopCleaning = () => {
    if (intervalId) clearInterval(intervalId);
    setRunning(false);
    setCountdown(timeRequired);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons name="robot-industrial" size={32} color="#3498db" />
        <Text style={styles.title}>Auto-Clean Operation</Text>
        <Text style={styles.subtitle}>Automated cleaning for various vegetables</Text>
      </View>

      {/* Vegetable Selection Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="food-apple" size={24} color="#3498db" />
          <Text style={styles.cardTitle}>Select Vegetable</Text>
        </View>
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedVeggie}
            onValueChange={(itemValue) => setSelectedVeggie(itemValue)}
            style={styles.picker}
            dropdownIconColor="#3498db"
          >
            {Object.keys(veggieData).map((veg) => (
              <Picker.Item label={veg} value={veg} key={veg} />
            ))}
          </Picker>
        </View>
        
        <View style={styles.veggieInfo}>
          <MaterialCommunityIcons name="clock" size={20} color="#7f8c8d" />
          <Text style={styles.infoText}>Cleaning time: {formatTime(timeRequired)}</Text>
        </View>
      </View>

      {/* Settings Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="tune" size={24} color="#3498db" />
          <Text style={styles.cardTitle}>Operation Settings</Text>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Conveyor Belt Length</Text>
          <Text style={styles.settingValue}>{conveyorLength} meters</Text>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Motor Speed</Text>
          <Text style={[styles.settingValue, styles.rpmValue]}>{motorRPM} RPM</Text>
        </View>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>UV Sterilization</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </View>
      </View>

      {/* Timer Card */}
      <View style={[styles.card, styles.timerCard]}>
        <Text style={styles.timerLabel}>TIME REMAINING</Text>
        <Text style={styles.timerText}>{formatTime(countdown)}</Text>
        
        <View style={styles.statusRow}>
          <View style={styles.statusIndicator}>
            <MaterialCommunityIcons 
              name={running ? "motion-sensor" : "motion-off"} 
              size={20} 
              color={running ? "#2ecc71" : "#e74c3c"} 
            />
            <Text style={styles.statusText}>{running ? "Running" : "Stopped"}</Text>
          </View>
          
          <View style={styles.statusIndicator}>
            <MaterialCommunityIcons 
              name="lightbulb-on" 
              size={20} 
              color={running ? "#f1c40f" : "#7f8c8d"} 
            />
            <Text style={styles.statusText}>{running ? "UV On" : "UV Off"}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!running ? (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={() => setShowConfirmation(true)}
          >
            <MaterialCommunityIcons name="play" size={24} color="white" />
            <Text style={styles.buttonText}>START CLEANING</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={stopCleaning}
          >
            <MaterialCommunityIcons name="stop" size={24} color="white" />
            <Text style={styles.buttonText}>STOP PROCESS</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmation}
        onRequestClose={() => setShowConfirmation(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="robot-confused" size={48} color="#3498db" />
            <Text style={styles.modalTitle}>Confirm Auto-Clean</Text>
            <Text style={styles.modalText}>
              Start cleaning process for {selectedVeggie}? This will take {formatTime(timeRequired)}.
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmation(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={startCleaning}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccess}
        onRequestClose={() => setShowSuccess(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="check-circle" size={60} color="#2ecc71" />
            <Text style={styles.modalTitle}>Cleaning Complete!</Text>
            <Text style={styles.modalText}>
              {selectedVeggie} has been cleaned successfully.
            </Text>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.successButton]}
              onPress={() => setShowSuccess(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default AutoCleanScreen;

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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  picker: {
    backgroundColor: '#f8f9fa',
    height: 50,
  },
  veggieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#2c3e50',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
  },
  settingLabel: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  rpmValue: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  timerCard: {
    alignItems: 'center',
    backgroundColor: '#2c3e50',
  },
  timerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#bdc3c7',
    textAlign: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    marginLeft: 8,
    color: 'white',
  },
  buttonContainer: {
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#2ecc71',
  },
  stopButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
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
  successButton: {
    backgroundColor: '#2ecc71',
    width: '100%',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
import { useAuth } from '../../contexts/authContext';
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ImageBackground
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MaterialCommunityIcons } from "@expo/vector-icons";

const HomeDashboard = () => {
  const { user } = useAuth();
  const screenWidth = Dimensions.get('window').width;
  
  // Mock data
  const mockOperations = [
    { id: '1', title: 'Auto-clean completed', time: '2025-04-13 10:45' },
    { id: '2', title: 'Manual clean started', time: '2025-04-12 14:20' },
    { id: '3', title: 'System restarted', time: '2025-04-12 09:00' },
    { id: '4', title: 'UV sterilization finished', time: '2025-04-11 18:30' },
  ];

  const chartData = {
    labels: ['10s', '20s', '30s', '40s', '50s', '60s'],
    datasets: [{ data: [1200, 1250, 1230, 1270, 1260, 1240] }],
  };

  const getStatusIndicator = (status: string) => {
    let color = "gray";
    let icon = "circle";

    switch (status) {
      case "Ready":
        color = "#2ecc71";
        icon = "check-circle";
        break;
      case "Busy":
        color = "#f39c12";
        icon = "progress-clock";
        break;
      case "Disconnected":
        color = "#e74c3c";
        icon = "close-circle";
        break;
    }

    return <MaterialCommunityIcons name={icon} size={24} color={color} />;
  };

  // Status data
  const bluetooth = {
    version: "v1.0.2",
    connected: true,
  };

  const motor = {
    distance: "120 cm",
    rpm: "50",
    status: "Ready",
  };

  const uvLamp = {
    status: "Ready",
  };

  const waterSystem = {
    level: "85%",
    status: "Disconnected",
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.username}>{user?.email?.split('@')[0]}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <MaterialCommunityIcons name="account-circle" size={32} color="#3498db" />
        </TouchableOpacity>
      </View>

        {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>

          
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, {backgroundColor: 'rgba(46, 204, 113, 0.2)'}]}>
              <MaterialCommunityIcons name="power" size={28} color="#2ecc71" />
            </View>
            <Text style={styles.actionText}>Power On</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, {backgroundColor: 'rgba(231, 76, 60, 0.2)'}]}>
              <MaterialCommunityIcons name="power-off" size={28} color="#e74c3c" />
            </View>
            <Text style={styles.actionText}>Power Off</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, {backgroundColor: 'rgba(52, 152, 219, 0.2)'}]}>
              <MaterialCommunityIcons name="restart" size={28} color="#3498db" />
            </View>
            <Text style={styles.actionText}>Restart</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, {backgroundColor: 'rgba(52, 152, 219, 0.2)'}]}>
              <MaterialCommunityIcons name="play" size={28} color="#3498db" />
            </View>
            <Text style={styles.actionText}>Start Clean</Text>
          </TouchableOpacity>


        </View>
      </View>

      {/* Status Overview */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Device Status</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View Details</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <MaterialCommunityIcons name="bluetooth" size={28} color="#3498db" />
            </View>
            <Text style={styles.statusTitle}>Bluetooth</Text>
            <Text style={[styles.statusValue, styles.connected]}>Connected</Text>
            <Text style={styles.statusSubtext}>v1.0.2</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <MaterialCommunityIcons name="engine" size={28} color="#3498db" />
            </View>
            <Text style={styles.statusTitle}>Motor</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusValue}>50 RPM</Text>
              {getStatusIndicator(motor.status)}
            </View>
            <Text style={styles.statusSubtext}>120 cm</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <MaterialCommunityIcons name="lightbulb-on" size={28} color="#3498db" />
            </View>
            <Text style={styles.statusTitle}>UV Lamp</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusValue}>Ready</Text>
              {getStatusIndicator(uvLamp.status)}
            </View>
            <Text style={styles.statusSubtext}>Sterilization</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <MaterialCommunityIcons name="water" size={28} color="#3498db" />
            </View>
            <Text style={styles.statusTitle}>Water System</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusValue}>85%</Text>
              {getStatusIndicator(waterSystem.status)}
            </View>
            <Text style={styles.statusSubtext}>Level</Text>
          </View>
        </View>
      </View>

      {/* Performance Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Full Report</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth - 40}
            height={220}
            yAxisSuffix=" RPM"
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#f8f9fa',
              backgroundGradientTo: '#f8f9fa',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 8 },
              propsForDots: { r: '5', strokeWidth: '2', stroke: '#2E86DE' },
              propsForBackgroundLines: {
                strokeDasharray: ""
              }
            }}
            bezier
            style={{ borderRadius: 12, paddingRight: 10 }}
          />
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, {backgroundColor: '#3498db'}]} />
              <Text style={styles.legendText}>Motor RPM</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recent Operations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Operations</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>See All</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={mockOperations}
          scrollEnabled={false}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.operationItem}>
              <View style={styles.operationIcon}>
                <MaterialCommunityIcons 
                  name={item.title.includes('Auto') ? 'robot' : 
                        item.title.includes('Manual') ? 'hand-back-right' :
                        item.title.includes('System') ? 'restart' : 'lightbulb-on'} 
                  size={24} 
                  color="#3498db" 
                />
              </View>
              <View style={styles.operationDetails}>
                <Text style={styles.opTitle}>{item.title}</Text>
                <Text style={styles.opTime}>{item.time}</Text>
              </View>
              <TouchableOpacity style={styles.operationAction}>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

    
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#006b71',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  profileButton: {
    backgroundColor: '#e8f4fc',
    borderRadius: 20,
    padding: 8,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
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
  viewAll: {
    color: '#3498db',
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
  },
  statusIcon: {
    backgroundColor: '#e8f4fc',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  connected: {
    color: '#2ecc71',
  },
  statusSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chartContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  chartLegend: {
    flexDirection: 'row',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  operationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  operationIcon: {
    backgroundColor: '#e8f4fc',
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  operationDetails: {
    flex: 1,
  },
  opTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  opTime: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 3,
  },
  operationAction: {
    padding: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  actionButton: {
    alignItems: 'center',
    width: '25%',
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    textAlign: 'center',
  },
});

export default HomeDashboard;
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2E86DE', headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} /> }} />
      <Tabs.Screen name="bluetooth" options={{ title: 'Bluetooth', tabBarIcon: ({ color, size }) => <FontAwesome name="bluetooth" size={size} color={color} /> }} />
      <Tabs.Screen name="auto-clean" options={{ title: 'Auto-Clean', tabBarIcon: ({ color, size }) => <FontAwesome name="cogs" size={size} color={color} /> }} />
      <Tabs.Screen name="manual-clean" options={{ title: 'Manual-Clean', tabBarIcon: ({ color, size }) => <FontAwesome name="hand-paper-o" size={size} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <FontAwesome name="gear" size={size} color={color} /> }} />
    </Tabs>
  );
}

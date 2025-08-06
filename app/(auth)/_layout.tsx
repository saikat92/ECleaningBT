import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="forgot_pass" options={{ title: 'Forgot Password' }} />
      <Stack.Screen name="register" options={{ title: 'Register' }} />
    </Stack>
  );
}
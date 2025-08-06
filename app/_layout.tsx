import { Slot } from 'expo-router';
import { AuthProvider } from '../contexts/authContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
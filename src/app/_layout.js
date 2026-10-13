import { Stack } from 'expo-router';
import { MockDataProvider } from '../context/MockDataContext';

export default function RootLayout() {
  return (
    <MockDataProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(dashboard)" options={{ contentStyle: { backgroundColor: 'transparent' } }} />
      </Stack>
    </MockDataProvider>
  );
}
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
      {/* We can keep index as a 'Landing' page later if needed */}
      <Stack.Screen name="index" options={{ href: null }} />
    </Stack>
  );
}
// app/_layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import "@/lib/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants, { ExecutionEnvironment } from 'expo-constants'; // Added for environment check
import * as Notifications from 'expo-notifications';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react"; // Added useEffect
import { LogBox, View } from "react-native";
import "../global.css";

SplashScreen.preventAutoHideAsync();

// Suppress the specific Reanimated and Expo Go warnings
LogBox.ignoreLogs([
  "Expo Go",
  "The 'expo-notifications' libraries are not fully supported in Expo Go",
  "[Reanimated] Reading from `value` during component render",
  "[Reanimated] Writing to `value` during component render",
  "[Reanimated]",
]);

const queryClient = new QueryClient();

export default function RootLayout() {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  useEffect(() => {
    // Yusuf, we only set up the handler if we are NOT in Expo Go
    // This prevents the SDK 53 crash on Android
    if (!isExpoGo) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        }),
      });
    } else {
      console.log("🔔 Notifications: Running in Expo Go. Notification setup skipped to prevent crash.");
    }
  }, [isExpoGo]);

  return (
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' }, animation: 'fade_from_bottom' }}>
              <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="seller/dashboard" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
            </Stack>
          </View>
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}
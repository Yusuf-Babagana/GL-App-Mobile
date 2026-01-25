import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import "@/lib/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from 'expo-notifications';
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import "../global.css";

const queryClient = new QueryClient();

// Safety check for Notifications
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
} catch (e) {
  console.log("Notification handler setup failed:", e);
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <QueryClientProvider client={queryClient}>
          {/* Deep midnight wrapper prevents white "flashes" during transitions
              and matches your dark header theme.
          */}
          <View style={{ flex: 1, backgroundColor: '#020617' }}>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                // A subtle slate-50 background for all app screens
                contentStyle: { backgroundColor: '#f8fafc' },
                // Professional native-feel animation
                animation: 'fade_from_bottom',
              }}
            >
              {/* Main App Navigation */}
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

              {/* Seller Management Overlays */}
              <Stack.Screen
                name="seller/dashboard"
                options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
              />
              <Stack.Screen
                name="seller/edit-product/[id]"
                options={{ presentation: 'modal' }}
              />
            </Stack>
          </View>
        </QueryClientProvider>
      </CartProvider>
    </AuthProvider>
  );
}
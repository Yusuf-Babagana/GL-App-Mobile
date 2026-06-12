// app/_layout.tsx
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WalletProvider } from "@/context/WalletContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import "@/lib/i18n";
import { loadSavedLanguage, default as i18n } from "@/lib/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { LogBox, View } from "react-native";
import { I18nextProvider } from 'react-i18next';
import "../global.css";

if (typeof ErrorUtils !== 'undefined') {
  const originalHandler = ErrorUtils.getGlobalHandler && ErrorUtils.getGlobalHandler();
  ErrorUtils.setGlobalHandler((error: any, isFatal: boolean) => {
    console.debug('[Crash]', isFatal ? 'FATAL' : 'CAUGHT', error?.message || error);
    if (originalHandler) originalHandler(error, isFatal);
  });
}

SplashScreen.preventAutoHideAsync();

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
    loadSavedLanguage().then((saved) => {
      if (saved && saved !== 'en') {
        i18n.changeLanguage(saved);
      }
      SplashScreen.hideAsync();
    });
  }, []);

  useEffect(() => {
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
    }
  }, [isExpoGo]);

  return (
    <AuthProvider>
      <WalletProvider>
        <OnboardingProvider>
          <CartProvider>
            <QueryClientProvider client={queryClient}>
              <I18nextProvider i18n={i18n}>
                <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
                  <StatusBar style="dark" />
                  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#F8FAFC' }, animation: 'fade_from_bottom' }} />
                </View>
              </I18nextProvider>
            </QueryClientProvider>
          </CartProvider>
        </OnboardingProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

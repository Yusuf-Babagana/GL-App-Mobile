// app/admin/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';

export default function AdminLayout() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkAdminGate = async () => {
      try {
        const userRaw = await SecureStore.getItemAsync('user_profile');
        if (!userRaw) {
          router.replace('/(auth)/login');
          return;
        }

        const user = JSON.parse(userRaw);
        const role = user.active_role || (user.is_admin ? 'admin' : 'buyer');
        
        // Strict role enforcement
        if (user.is_admin === true || role === 'admin') {
          setIsVerified(true);
        } else {
          console.warn("⚠️ Security Alert: Non-admin attempted access to admin routes.");
          router.replace('/(tabs)'); // Kick out to storefront
        }
      } catch (error) {
        router.replace('/(auth)/login');
      }
    };

    checkAdminGate();
  }, []);

  if (!isVerified) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

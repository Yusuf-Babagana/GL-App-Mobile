import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, usePathname } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const STATUS_API = 'https://glappbackend.pythonanywhere.com/api/market/shop/my-status/';

const FORM_ROUTES = new Set([
  '/merchant/personal-info',
  '/merchant/shop-info',
  '/merchant/review-submit',
]);

async function resolveMerchantToken(): Promise<string | null> {
  const key = await SecureStore.getItemAsync('accessToken');
  if (key) return key;
  const fallback = await SecureStore.getItemAsync('user_token');
  if (fallback) return fallback;
  return await SecureStore.getItemAsync('auth_token');
}

export default function MerchantFolderLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const evaluated = useRef(false);

  useEffect(() => {
    if (evaluated.current) return;
    evaluateGateBarrier();
  }, [pathname]);

  const evaluateGateBarrier = async () => {
    try {
      const token = await resolveMerchantToken();
      const res = await axios.get(STATUS_API, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });
      const status = res.data.status;

      if (status === 'pending' || status === 'approved') {
        if (FORM_ROUTES.has(pathname)) {
          router.replace('/merchant');
          return;
        }
      } else if (status === 'none') {
        if (pathname === '/merchant' || pathname === '/merchant/') {
          router.replace('/merchant/personal-info');
          return;
        }
      }
    } catch {
      // Network or auth error — don't assume no shop exists (would show form to existing owners).
      // Let the consumer screen decide what to render.
    } finally {
      evaluated.current = true;
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return <Slot />;
}

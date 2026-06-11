// app/index.tsx
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { getToken } from '@/src/services/apiClient';
import { fetchStoreStatus } from '@/src/services/marketService';

export default function AppEntryIndex() {
  const router = useRouter();

  useEffect(() => {
    const initializeSessionState = async () => {
      try {
        const token = await getToken();

        if (!token) {
          router.replace('/(auth)/login');
          return;
        }

        const data = await fetchStoreStatus();

        if (data.is_admin === true) {
          router.replace('/admin/dashboard');
        } else if (data.exists && data.is_active) {
          router.replace('/merchant');
        } else {
          router.replace('/(tabs)');
        }
      } catch (err) {
        router.replace('/(auth)/login');
      }
    };

    initializeSessionState();
  }, []);

  return null;
}

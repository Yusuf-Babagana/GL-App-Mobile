import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/lib/api';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  fullName?: string;
  role: 'buyer' | 'seller' | 'rider' | 'admin';
  kyc_status: 'unverified' | 'pending' | 'verified';
  phone_number?: string;
  imageUrl?: string;
  active_role?: string;
  is_admin?: boolean;
}

interface AuthState {
  isSignedIn: boolean;
  isLoading: boolean;
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setLoading: (isLoading: boolean) => void;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isSignedIn: false,
      isLoading: true,
      token: null,
      user: null,

      setSession: (token, user) =>
        set({ isSignedIn: true, token, user, isLoading: false }),

      setUser: (user) => set({ user }),

      setLoading: (isLoading) => set({ isLoading }),

      login: async (email, password) => {
        const response = await api.post('/users/login/', { email, password });
        const data = response.data;
        const token = data.token || data.access || data.key || data.accessToken;
        const user = data.user;

        if (!token) throw new Error('No token returned from backend.');

        set({ isSignedIn: true, token, user, isLoading: false });
        return user;
      },

      logout: () => {
        set({ isSignedIn: false, token: null, user: null, isLoading: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isSignedIn: state.isSignedIn,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate auth store', error);
        }
        useAuthStore.setState({ isLoading: false });
      },
    }
  )
);

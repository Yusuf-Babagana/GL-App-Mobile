import api, { setUnauthorizedHandler, updateProfile } from "@/lib/api";
import { registerForPushNotificationsAsync } from "@/lib/pushNotifications";
import { getToken, setToken as setApiToken } from "@/src/services/apiClient";
import { fetchProfile as fetchProfileApi } from "@/src/services/userService";
import { debug } from "@/src/services/debug";
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from 'expo-splash-screen';
import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export interface User {
    id: number;
    email: string;
    username: string;
    full_name?: string;
    fullName?: string;
    role: 'buyer' | 'seller' | 'rider' | 'admin';
    active_role?: 'buyer' | 'seller' | 'rider' | 'admin';
    is_admin?: boolean;
    kyc_status: 'unverified' | 'pending' | 'verified' | 'rejected';
    rejection_reason?: string | null;
    is_deactivation_pending?: boolean;
    deletion_requested_at?: string | null;
    phone_number?: string;
    phoneNumber?: string;
    first_name?: string;
    last_name?: string;
    imageUrl?: string;
}

interface AuthContextType {
    isSignedIn: boolean;
    isLoading: boolean;
    userRole: string | null;
    user: User | null;
    login: (email: string, password: string) => Promise<User>;
    setSession: (token: any, userProfile: any) => Promise<void>;
    logout: () => Promise<void>;
    fetchProfile: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    const getRedirectPath = (role: string | null) => {
        switch (role) {
            case 'seller': return "/merchant";
            case 'job_seeker': return "/(jobs)/dashboard";
            default: return "/(tabs)";
        }
    };

    // ... (fetchProfile and useEffects remain unchanged)

    const setSession = async (token: any, userProfile: any) => {
        try {
            if (!token) {
                return;
            }

            // ✅ FIX 1: Enforce explicit string casting for the JWT token
            const tokenString = String(token);
            await SecureStore.setItemAsync('accessToken', tokenString);
            await SecureStore.setItemAsync('auth_token', tokenString);

            // ✅ FIX 2: Check if userProfile is an object, and serialize it cleanly
            if (userProfile) {
                const serializedUser = typeof userProfile === 'string' 
                    ? userProfile 
                    : JSON.stringify(userProfile);
                
                await SecureStore.setItemAsync('user_profile', serializedUser);
                
                const parsedUser = typeof userProfile === 'string'
                    ? JSON.parse(userProfile)
                    : userProfile;
                
                setUser(parsedUser);
                setUserRole(parsedUser.active_role || parsedUser.role || (parsedUser.is_admin ? 'admin' : 'buyer'));
            }
            
            setIsSignedIn(true);
        } catch (error: any) {
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/users/login/', { email, password });
            const data = response.data;

            // Look for the token string across standard variations (token, access, key, etc.)
            const token = data.token || data.access || data.key || data.accessToken;
            const refresh = data.refresh || data.refreshToken;
            const user = data.user;

            if (!token) {
                // Log the exact keys we received so you can see it in your terminal
                throw new Error("No token returned from backend server.");
            }

            // ✅ FIX 1: Ensure token is a pure string and save it to both accessToken (used by client interceptor) and auth_token (user key variation)
            await SecureStore.setItemAsync('accessToken', String(token));
            await SecureStore.setItemAsync('auth_token', String(token));
            await setApiToken(String(token));
            
            if (refresh) {
                await SecureStore.setItemAsync('refreshToken', String(refresh));
            }

            // ✅ FIX 2: Convert user object to string before saving to secure storage
            if (user) {
                await SecureStore.setItemAsync('user_profile', JSON.stringify(user));
                setUser(user);
                setUserRole(user.active_role || user.role || (user.is_admin ? 'admin' : 'buyer'));
            }

            setIsSignedIn(true);
            return user;

        } catch (error: any) {
            if (error.message && error.message.includes('SecureStore')) {
                throw new Error("Local cache storage error. Value must be a serialized string.");
            }
            
            throw error;
        }
    };

    const fetchProfile = async () => {
        try {
            const data = await fetchProfileApi();
            const role = data.active_role || data.role;
            setUserRole(role);
            setUser(data);
            return role;
        } catch (e: any) {
            if (e.message === 'Session expired') await logout();
            return null;
        }
    };

    useEffect(() => {
        const initApp = async () => {
            try {
                // Check Auth
                const token = await getToken();
                const oldToken = await SecureStore.getItemAsync("accessToken");
                debug._raw('[initApp] auth_token:', token ? 'present' : 'absent');
                debug._raw('[initApp] accessToken:', oldToken ? 'present' : 'absent');
                if (token) {
                    setIsSignedIn(true);
                    await fetchProfile();

                    // Push Notification Registration Logic (Safe for Expo Go)
                    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
                    if (!isExpoGo) {
                        const pushToken = await registerForPushNotificationsAsync();
                        if (pushToken) {
                            try {
                                await updateProfile({ push_token: pushToken });
                            } catch (err) {
                                debug._raw('[initApp] failed to save push token:', err);
                            }
                        }
                    }
                }
            } catch (e) {

            } finally {
                setIsLoading(false);
                try {
                    await SplashScreen.hideAsync();
                } catch (err) { }
            }
        };
        initApp();
    }, []);

    // 2. Navigation Guard: Handles Redirects based on state changes
    useEffect(() => {
        if (isLoading) return;

        const rootSegment = segments[0];
        const fullPath = segments.join('/');
        const kycStatus = user?.kyc_status;

        // Wrap the guard execution in a safe macro-task delay to prevent navigation context crashes
        const timer = setTimeout(() => {
            // 1. AUTHENTICATION & KYC GATE
            if (isSignedIn) {
                if (rootSegment === '(auth)') {
                    const role = user?.active_role || user?.role || (user?.is_admin ? 'admin' : 'buyer');
                    if (user?.is_admin || role === 'admin') {
                        router.replace("/admin/dashboard");
                    } else {
                        router.replace("/(tabs)");
                    }
                    return;
                }

                const isOnKycPage = fullPath.includes('kyc');
                if (kycStatus === 'verified' && isOnKycPage) {
                    router.replace("/(tabs)");
                    return;
                }
            } else {
                // 3. GUEST PROTECTION
                // Must match the actual top-level app/ route folders — this
                // used to list 'seller' (no such folder; the real one is
                // 'merchant') and omitted 'finance' and 'orders' entirely,
                // so guests could navigate straight into those screens.
                const protectedRoutes = ['merchant', 'wallet', 'finance', 'kyc', 'admin', 'orders'];
                if (protectedRoutes.includes(rootSegment)) {
                    router.replace("/(auth)/login");
                } else if (rootSegment === '(tabs)' && segments[1] === 'cart') {
                    router.replace("/(auth)/login");
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [isSignedIn, user?.kyc_status, segments, isLoading]);



    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync("accessToken");
            await SecureStore.deleteItemAsync("auth_token");
            await SecureStore.deleteItemAsync("refreshToken");
            await SecureStore.deleteItemAsync("user_profile");
        } catch (error) {
        } finally {
            setIsSignedIn(false);
            setUserRole(null);
            setUser(null);
        }
    };

    useEffect(() => {
        setUnauthorizedHandler(logout);
        return () => setUnauthorizedHandler(null);
    }, [logout]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#10B981" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{ isSignedIn, isLoading, userRole, user, login, setSession, logout, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
import api from "@/lib/api";
import { User } from "@/types";
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from 'expo-splash-screen';
import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

interface AuthContextType {
    isSignedIn: boolean;
    isLoading: boolean;
    userRole: string | null;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    setSession: (token: string, refresh: string) => Promise<void>;
    logout: () => Promise<void>;
    completeOnboarding: () => Promise<void>;
    fetchProfile: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
    const router = useRouter();
    const segments = useSegments();

    const getRedirectPath = (role: string | null) => {
        switch (role) {
            case 'seller': return "/seller/dashboard";
            case 'delivery_partner': return "/rider/dashboard"; // Driver -> Rider Dashboard
            case 'rider': return "/rider/dashboard";
            case 'job_seeker': return "/(jobs)/dashboard";
            default: return "/(tabs)";
        }
    };

    // ... (fetchProfile and useEffects remain unchanged)

    const setSession = async (token: string, refresh: string) => {
        await SecureStore.setItemAsync("accessToken", token);
        await SecureStore.setItemAsync("refreshToken", refresh);
        setIsSignedIn(true);
        const role = await fetchProfile();
        const target = getRedirectPath(role);
        router.replace(target as any);
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/users/login/', { email, password });
            const { access, refresh, user } = response.data;

            // 1. Save Token
            await SecureStore.setItemAsync('accessToken', access);
            if (refresh) await SecureStore.setItemAsync('refreshToken', refresh);

            setIsSignedIn(true);

            // 2. Update State & Role
            let activeRole = user?.active_role;
            if (user) {
                setUser(user);
                setUserRole(activeRole);
            } else {
                // Fallback: If login doesn't return user object, fetch it
                activeRole = await fetchProfile();
            }

            // 3. ROLE-BASED ROUTING
            if (activeRole === 'rider' || activeRole === 'delivery_partner') {
                router.replace('/rider/dashboard');
            } else if (activeRole === 'seller') {
                router.replace('/seller/dashboard');
            } else if (activeRole === 'job_seeker') {
                router.replace('/(jobs)/dashboard');
            } else {
                router.replace('/(tabs)');
            }
        } catch (error: any) {
            console.error("Login Error:", error);
            const msg = error.response?.data?.detail || "Please check your credentials";
            throw new Error(msg);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile/');
            const role = res.data.active_role;
            setUserRole(role);
            setUser(res.data);
            return role;
        } catch (e: any) {
            if (e.response?.status === 401) await logout();
            return null;
        }
    };

    useEffect(() => {
        const initApp = async () => {
            try {
                // Check Onboarding
                // FIX: Temporarily clearing this to force onboarding to show as requested
                await SecureStore.deleteItemAsync("hasSeenOnboarding");

                const onboardingVal = await SecureStore.getItemAsync("hasSeenOnboarding");
                setHasOnboarded(onboardingVal === "true");

                // Check Auth
                const token = await SecureStore.getItemAsync("accessToken");
                if (token) {
                    setIsSignedIn(true);
                    await fetchProfile();

                    // NEW: Push Notification Registration Logic (Safe for Expo Go)
                    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
                    if (!isExpoGo) {
                        // Call your registration function here only if in a Dev Build
                        // await registerForPushNotificationsAsync();
                    }
                }
            } catch (e) {
                console.log("Initialization failed", e);
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
        if (isLoading || hasOnboarded === null) return;

        const inAuthGroup = segments[0] === "(auth)";
        const rootSegment = segments[0];

        // A. Handle Onboarding Redirect (First Priority)
        if (!hasOnboarded && rootSegment !== "onboarding") {
            router.replace("/onboarding");
            return;
        }

        // B. Handle Protected Routes
        const protectedRoutes = ["seller", "rider", "wallet", "admin", "(delivery)", "(jobs)"];
        const isProtected = protectedRoutes.includes(rootSegment);

        if (!isSignedIn && isProtected) {
            router.replace("/(auth)/login");
        }
        else if (isSignedIn && inAuthGroup) {
            const target = userRole ? getRedirectPath(userRole) : "/(tabs)";
            router.replace(target as any);
        }
    }, [isSignedIn, segments, isLoading, userRole, hasOnboarded]);



    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync("accessToken");
            await SecureStore.deleteItemAsync("refreshToken");
        } catch (error) {
            console.error("Logout Cleanup Error:", error);
        } finally {
            setIsSignedIn(false);
            setUserRole(null);
            setUser(null);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#10B981" />
            </View>
        );
    }

    const completeOnboarding = async () => {
        await SecureStore.setItemAsync("hasSeenOnboarding", "true");
        setHasOnboarded(true);
        // User requested Guest Mode: Go to discovery/tabs first.
        router.replace("/(tabs)");
    };

    return (
        <AuthContext.Provider value={{ isSignedIn, isLoading, userRole, user, login, setSession, logout, completeOnboarding, fetchProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
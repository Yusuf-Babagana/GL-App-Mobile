import api from "@/lib/api";
import { useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

interface AuthContextType {
    isSignedIn: boolean;
    isLoading: boolean;
    userRole: string | null;
    login: (token: string, refresh: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile/');
            setUserRole(res.data.active_role);
        } catch (e: any) {
            if (e.response?.status === 401) {
                console.log("Session expired.");
                await logout();
            }
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await SecureStore.getItemAsync("accessToken");
                if (token) {
                    setIsSignedIn(true);
                    await fetchProfile();
                }
            } catch (e) {
                console.log("Auth check failed", e);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    useEffect(() => {
        if (isLoading) return;
        const inAuthGroup = segments[0] === "(auth)";

        if (isSignedIn && inAuthGroup) {
            router.replace("/(tabs)");
        } else if (!isSignedIn && !inAuthGroup) {
            router.replace("/(auth)/login");
        }
    }, [isSignedIn, segments, isLoading]);

    const login = async (token: string, refresh: string) => {
        await SecureStore.setItemAsync("accessToken", token);
        await SecureStore.setItemAsync("refreshToken", refresh);

        // IMPORTANT: We ONLY set state here. 
        // The useEffect above detects the change and handles navigation safely.
        setIsSignedIn(true);
        await fetchProfile();
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        setIsSignedIn(false);
        setUserRole(null);
        router.replace("/(auth)/login");
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{ isSignedIn, isLoading, userRole, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { getToken, setToken } from "@/src/services/apiClient";
import { debug } from "@/src/services/debug";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

const API_HOST = 'https://glappbackend.pythonanywhere.com/api';

export default function LoginScreen() {
    const { setSession } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert("Error", "Please fill in all fields");
        setIsLoading(true);
        try {
            const res = await fetch(`${API_HOST}/users/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Invalid credentials.');

            const jwt = data.token || data.access || data.key || data.accessToken;
            if (!jwt) {
                debug.auth.loginResponse(Object.keys(data).join(','), false);
                throw new Error('No token returned from server.');
            }
            debug.auth.loginResponse(Object.keys(data).join(','), true);
            debug._raw('[login] token type:', typeof jwt, 'len:', String(jwt).length);

            await setToken(jwt);
            debug.auth.tokenStored('auth_token', true);

            const stored = await getToken();
            debug._raw('[login] verify getToken():', stored ? stored.slice(0, 10) + '…' : 'NULL');

            await setSession(jwt, data.user);
        } catch (error: any) {
            Alert.alert("Authentication Failed", error.message || "Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper className="px-6 justify-center bg-white">
            <View className="items-center mb-10">
                <View className="bg-primary/10 w-20 h-20 rounded-3xl items-center justify-center mb-6" style={{ shadowColor: '#329629', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 }}>
                    <Ionicons name="globe-outline" size={40} color="#329629" />
                </View>
                <Text className="text-3xl font-black text-gray-900 mb-1 tracking-tight">Welcome Back</Text>
                <Text className="text-gray-400 font-medium text-base">Sign in to your account</Text>
            </View>

            <View className="mb-4">
                <Input
                    label="Email Address"
                    placeholder="name@example.com"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                <Input
                    label="Password"
                    placeholder="Enter your password"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    containerStyle="mb-2"
                />
                <TouchableOpacity className="self-end mb-6">
                    <Text className="text-primary font-bold text-sm">Forgot Password?</Text>
                </TouchableOpacity>

                <Button
                    title="Sign In"
                    onPress={handleLogin}
                    loading={isLoading}
                    size="lg"
                />
            </View>

            <View className="flex-row justify-center mt-4">
                <Text className="text-gray-400 font-medium">Don't have an account? </Text>
                <Link href="/(auth)/register" asChild>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Text className="text-primary font-bold">Sign Up</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </ScreenWrapper>
    );
}

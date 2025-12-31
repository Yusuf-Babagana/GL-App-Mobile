import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert("Error", "Please fill in all fields");

        setIsLoading(true);
        try {
            const data = await authService.login({ email, password });
            await login(data.access, data.refresh);
        } catch (error: any) {
            console.log(error);
            Alert.alert("Error", "Login failed. Check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <View className="items-center mb-10">
                <View className="bg-green-100 p-4 rounded-full mb-4">
                    <Ionicons name="globe-outline" size={48} color="#1DB954" />
                </View>
                <Text className="text-3xl font-bold text-gray-900">Welcome Back</Text>
                <Text className="text-gray-500 mt-2">Sign in to Globalink</Text>
            </View>

            <View className="gap-4">
                <TextInput
                    placeholder="Email Address"
                    className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    placeholder="Password"
                    className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoading}
                    className="bg-[#1DB954] py-4 rounded-full items-center mt-4"
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Sign In</Text>
                    )}
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-8">
                <Text className="text-gray-500">Don't have an account? </Text>
                <Link href="/(auth)/register" asChild>
                    <TouchableOpacity>
                        <Text className="text-[#1DB954] font-bold">Sign Up</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </View>
    );
}
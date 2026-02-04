import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert("Error", "Please fill in all fields");

        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error: any) {
            console.log(error);
            Alert.alert("Error", "Login failed. Check your credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper className="px-6 justify-center">
            <View className="items-center mb-10">
                <View className="bg-primary/10 p-4 rounded-[24px] mb-6">
                    <Ionicons name="globe-outline" size={48} color="#329629" />
                </View>
                <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</Text>
                <Text className="text-gray-500 text-base">Sign in to continue</Text>
            </View>

            <View>
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
                    containerStyle="mb-6"
                />

                <Button
                    title="Sign In"
                    onPress={handleLogin}
                    loading={isLoading}
                    size="lg"
                    className="mb-4"
                />
            </View>

            <View className="flex-row justify-center mt-6">
                <Text className="text-gray-500">Don't have an account? </Text>
                <Link href="/(auth)/register" asChild>
                    <TouchableOpacity>
                        <Text className="text-primary font-bold">Sign Up</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </ScreenWrapper>
    );
}
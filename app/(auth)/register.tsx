import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { setToken } from "@/src/services/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/services/auth";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function RegisterScreen() {
    const { setSession } = useAuth();
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        password: "",
        confirm_password: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!form.full_name || !form.email || !form.password) {
            return Alert.alert("Missing Fields", "Please fill in all required fields.");
        }
        if (form.password !== form.confirm_password) {
            return Alert.alert("Password Mismatch", "Passwords do not match.");
        }

        setIsLoading(true);
        try {
            await authService.register({
                username: form.email.trim().toLowerCase().split('@')[0],
                full_name: form.full_name.trim(),
                email: form.email.trim().toLowerCase(),
                phone_number: form.phone_number.trim(),
                password: form.password,
                password2: form.confirm_password,
            });

            const loginData = await authService.login({
                email: form.email.trim().toLowerCase(),
                password: form.password
            });

            const tokenToSave = loginData.access || loginData.token || loginData.key || loginData.accessToken;
            if (!tokenToSave) throw new Error('No token returned from server.');
            const userProfileToSave = loginData.user;
            await setToken(tokenToSave);
            await setSession(tokenToSave, userProfileToSave);

            Alert.alert("Success 🎉", "Account setup complete! Welcome to the marketplace.");

        } catch (error: any) {
            let errorMessage = "Please verify your information and try again.";
            if (error.response?.data) {
                const data = error.response.data;
                if (typeof data === 'string') {
                    errorMessage = data;
                } else if (typeof data === 'object') {
                    const keys = Object.keys(data);
                    if (keys.length > 0) {
                        const firstErr = data[keys[0]];
                        errorMessage = Array.isArray(firstErr) ? firstErr[0] : String(firstErr);
                    }
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            Alert.alert("Registration Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper bg="bg-white">
            <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
                <View className="mb-8 items-center">
                    <View className="bg-primary/10 w-20 h-20 rounded-3xl items-center justify-center mb-6" style={{ shadowColor: '#329629', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 }}>
                        <Ionicons name="person-add" size={36} color="#329629" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 mb-1 text-center tracking-tight">Create Account</Text>
                    <Text className="text-gray-400 font-medium text-base text-center">Join the community today</Text>
                </View>

                <View>
                    <Input
                        label="Full Name"
                        placeholder="Your full name"
                        value={form.full_name}
                        onChangeText={(t) => setForm({ ...form, full_name: t })}
                    />
                    <Input
                        label="Email Address"
                        placeholder="name@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={form.email}
                        onChangeText={(t) => setForm({ ...form, email: t })}
                    />
                    <Input
                        label="Phone Number"
                        placeholder="080 000 0000"
                        keyboardType="phone-pad"
                        value={form.phone_number}
                        onChangeText={(t) => setForm({ ...form, phone_number: t })}
                    />
                    <Input
                        label="Password"
                        placeholder="Create a strong password"
                        secureTextEntry
                        value={form.password}
                        onChangeText={(t) => setForm({ ...form, password: t })}
                    />
                    <Input
                        label="Confirm Password"
                        placeholder="Re-enter your password"
                        secureTextEntry
                        value={form.confirm_password}
                        onChangeText={(t) => setForm({ ...form, confirm_password: t })}
                        containerStyle="mb-6"
                    />

                    <Button
                        title="Create Account"
                        onPress={handleRegister}
                        loading={isLoading}
                        size="lg"
                    />
                </View>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-400 font-medium">Already have an account? </Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity activeOpacity={0.7}><Text className="text-primary font-bold">Sign In</Text></TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
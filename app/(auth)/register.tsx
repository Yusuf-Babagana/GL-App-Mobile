import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

const ROLES = [
    { id: 'buyer', label: 'Buyer', desc: 'Shop for items' },
    { id: 'seller', label: 'Seller', desc: 'Sell products' },
    { id: 'job_seeker', label: 'Job Seeker', desc: 'Find work' },
    { id: 'delivery_partner', label: 'Driver', desc: 'Deliver orders' },
];

export default function RegisterScreen() {
    const { setSession } = useAuth();
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        password: "",
        role: "buyer" // Default role
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!form.full_name || !form.email || !form.password) {
            return Alert.alert("Missing Fields", "Please fill in all required fields.");
        }

        setIsLoading(true);
        try {
            // 1. Register
            console.log("Registering as:", form.role);
            await authService.register(form);

            // 2. Auto-Login immediately
            console.log("Auto-logging in...");
            const loginData = await authService.login({
                email: form.email,
                password: form.password
            });

            // 3. Save Session (AuthContext handles the redirect based on role)
            await setSession(loginData.access, loginData.refresh);

        } catch (error: any) {
            console.error("Registration/Login Error:", error);
            const msg = error.response?.data
                ? JSON.stringify(error.response.data)
                : "Registration failed. Please check your connection.";
            Alert.alert("Error", msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
                <Text className="text-3xl font-bold text-gray-900 mb-2">Join Globalink</Text>
                <Text className="text-gray-500 mb-8 text-base">Select your primary goal to get started</Text>

                {/* Role Selection Grid */}
                <View className="flex-row flex-wrap gap-3 mb-8">
                    {ROLES.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            onPress={() => setForm({ ...form, role: role.id })}
                            className={`w-[48%] p-4 rounded-xl border-2 ${form.role === role.id
                                ? "bg-primary/5 border-primary"
                                : "bg-gray-50 border-gray-100"
                                }`}
                        >
                            <Text className={`font-bold text-lg mb-1 ${form.role === role.id ? "text-primary" : "text-gray-900"}`}>
                                {role.label}
                            </Text>
                            <Text className="text-xs text-gray-500">{role.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Input Fields */}
                <View>
                    <Input
                        label="Full Name"
                        placeholder="e.g. John Doe"
                        value={form.full_name}
                        onChangeText={(t) => setForm({ ...form, full_name: t })}
                    />

                    <Input
                        label="Email Address"
                        placeholder="john@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={form.email}
                        onChangeText={(t) => setForm({ ...form, email: t })}
                    />

                    <Input
                        label="Phone Number"
                        placeholder="+234..."
                        keyboardType="phone-pad"
                        value={form.phone_number}
                        onChangeText={(t) => setForm({ ...form, phone_number: t })}
                    />

                    <Input
                        label="Password"
                        placeholder="Min 6 characters"
                        secureTextEntry
                        value={form.password}
                        onChangeText={(t) => setForm({ ...form, password: t })}
                        containerStyle="mb-6"
                    />

                    <Button
                        title="Create Account"
                        onPress={handleRegister}
                        loading={isLoading}
                        size="lg"
                        className="mb-4"
                    />
                </View>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-500">Already have an account? </Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity><Text className="text-primary font-bold">Sign In</Text></TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
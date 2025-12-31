import { useAuth } from "@/context/AuthContext"; // Import Auth Context
import { authService } from "@/services/auth";
import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const ROLES = [
    { id: 'buyer', label: 'Buyer', desc: 'Shop for items' },
    { id: 'seller', label: 'Seller', desc: 'Sell products' },
    { id: 'job_seeker', label: 'Job Seeker', desc: 'Find work' },
    { id: 'delivery_partner', label: 'Driver', desc: 'Deliver orders' },
];

export default function RegisterScreen() {
    const { login } = useAuth(); // Get login function
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        password: "",
        role: "buyer" // Default
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

            // 3. Save Session (This triggers redirect in AuthContext)
            await login(loginData.access, loginData.refresh);

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
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>
                <Text className="text-3xl font-bold text-gray-900 mb-2">Join Globalink</Text>
                <Text className="text-gray-500 mb-6">Select your primary goal</Text>

                {/* Role Selection Grid */}
                <View className="flex-row flex-wrap gap-3 mb-6">
                    {ROLES.map((role) => (
                        <TouchableOpacity
                            key={role.id}
                            onPress={() => setForm({ ...form, role: role.id })}
                            className={`w-[48%] p-3 rounded-xl border ${form.role === role.id
                                    ? "bg-green-50 border-[#1DB954]"
                                    : "bg-white border-gray-200"
                                }`}
                        >
                            <Text className={`font-bold ${form.role === role.id ? "text-[#1DB954]" : "text-gray-900"}`}>
                                {role.label}
                            </Text>
                            <Text className="text-xs text-gray-500">{role.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Input Fields */}
                <View className="gap-4">
                    <View>
                        <Text className="text-gray-700 mb-1 ml-1 font-medium">Full Name</Text>
                        <TextInput
                            placeholder="e.g. John Doe"
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-base"
                            value={form.full_name}
                            onChangeText={(t) => setForm({ ...form, full_name: t })}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 mb-1 ml-1 font-medium">Email Address</Text>
                        <TextInput
                            placeholder="e.g. john@example.com"
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-base"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={form.email}
                            onChangeText={(t) => setForm({ ...form, email: t })}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 mb-1 ml-1 font-medium">Phone Number</Text>
                        <TextInput
                            placeholder="e.g. +234..."
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-base"
                            keyboardType="phone-pad"
                            value={form.phone_number}
                            onChangeText={(t) => setForm({ ...form, phone_number: t })}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 mb-1 ml-1 font-medium">Password</Text>
                        <TextInput
                            placeholder="Min 6 characters"
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-base"
                            secureTextEntry
                            value={form.password}
                            onChangeText={(t) => setForm({ ...form, password: t })}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleRegister}
                        disabled={isLoading}
                        className="bg-[#1DB954] py-4 rounded-full items-center mt-4"
                    >
                        {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Create Account</Text>}
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-center mt-8">
                    <Text className="text-gray-500">Already have an account? </Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity><Text className="text-[#1DB954] font-bold">Sign In</Text></TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </View>
    );
}
import { Button } from "@/components/ui/Button";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function EditProfileScreen() {
    const router = useRouter();
    const { user, fetchProfile } = useAuth();

    const [fullName, setFullName] = useState(user?.fullName || "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
    const [email, setEmail] = useState(user?.email || "");

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        if (!fullName.trim()) newErrors.fullName = "Full name is required";

        // Basic Email Regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!emailRegex.test(email)) {
            newErrors.email = "Invalid email format";
        }

        // Phone Validation (basic length check for now, specific to Kano logistics usually 11 digits)
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (phoneNumber.length < 10) {
            newErrors.phoneNumber = "Phone number is too short";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        try {
            setIsLoading(true);

            // 1. Send Update to Backend
            await updateProfile({
                full_name: fullName,
                email: email, // Note: Changing email might require re-verification depending on backend logic
                phone_number: phoneNumber
            });

            // 2. Refresh Context
            await fetchProfile();

            Alert.alert("Success", "Profile updated successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (e: any) {
            console.log("Profile Update Error:", e);
            Alert.alert("Update Failed", e.response?.data?.detail || "Could not update profile. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper bg="bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                    {/* Header */}
                    <View className="px-6 pt-6 pb-4 flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1 rounded-full bg-gray-50">
                            <Ionicons name="arrow-back" size={24} color="#1E293B" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-gray-900">Edit Profile</Text>
                    </View>

                    <View className="px-6 mt-4">
                        {/* Avatar Placeholder */}
                        <View className="items-center mb-8">
                            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-3 overflow-hidden border-4 border-white shadow-sm">
                                {user?.imageUrl ? (
                                    /* If you have an image component, use it here. For now, text fallback */
                                    <Text className="text-4xl">📷</Text>
                                ) : (
                                    <Text className="text-4xl font-bold text-gray-400">
                                        {fullName.charAt(0).toUpperCase()}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity className="bg-primary/10 px-4 py-2 rounded-full">
                                <Text className="text-primary font-bold text-xs">Change Photo</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form Fields */}
                        <View className="space-y-4">

                            {/* Full Name */}
                            <View>
                                <Text className="text-gray-500 font-medium text-sm mb-1 ml-1">Full Name</Text>
                                <TextInput
                                    className={`bg-gray-50 border ${errors.fullName ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 py-3.5 text-gray-900 font-medium`}
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="Enter your full name"
                                />
                                {errors.fullName && <Text className="text-red-500 text-xs ml-1 mt-1">{errors.fullName}</Text>}
                            </View>

                            {/* Email */}
                            <View>
                                <Text className="text-gray-500 font-medium text-sm mb-1 ml-1">Email Address</Text>
                                <TextInput
                                    className={`bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 py-3.5 text-gray-900 font-medium`}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholder="your.email@example.com"
                                />
                                {errors.email && <Text className="text-red-500 text-xs ml-1 mt-1">{errors.email}</Text>}
                            </View>

                            {/* Phone Number */}
                            <View>
                                <Text className="text-gray-500 font-medium text-sm mb-1 ml-1">Phone Number</Text>
                                <TextInput
                                    className={`bg-gray-50 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-200'} rounded-2xl px-4 py-3.5 text-gray-900 font-medium`}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    keyboardType="phone-pad"
                                    placeholder="+234..."
                                />
                                {errors.phoneNumber && <Text className="text-red-500 text-xs ml-1 mt-1">{errors.phoneNumber}</Text>}
                            </View>

                        </View>

                        {/* Save Button */}
                        <View className="mt-10">
                            <Button
                                title="Save Changes"
                                onPress={handleSave}
                                loading={isLoading}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

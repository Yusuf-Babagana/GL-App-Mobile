import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";

export default function PrivacySecurityScreen() {
    const router = useRouter();

    // Mock states for toggles
    const [is2FAEnabled, setIs2FAEnabled] = useState(false);
    const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
    const [isDataSharingEnabled, setIsDataSharingEnabled] = useState(false);

    const checkPasswordChange = () => {
        Alert.alert("Change Password", "Functionality to change password will be implemented here.");
    };

    const deleteAccount = () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => console.log("Delete Account Pressed") }
            ]
        );
    };

    const SettingItem = ({ title, subtitle, value, onValueChange, type = "toggle", onPress, icon, color = "#64748B" }: any) => (
        <View className="flex-row items-center bg-white p-4 rounded-xl border border-gray-100 mb-3">
            <View style={{ backgroundColor: color + '15' }} className="w-10 h-10 rounded-full items-center justify-center mr-4">
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View className="flex-1 mr-4">
                <Text className="text-gray-900 font-semibold text-base">{title}</Text>
                {subtitle && <Text className="text-gray-500 text-xs mt-0.5">{subtitle}</Text>}
            </View>
            {type === "toggle" ? (
                <Switch
                    trackColor={{ false: "#E2E8F0", true: "#329629" }}
                    thumbColor={value ? "#ffffff" : "#f4f3f4"}
                    ios_backgroundColor="#E2E8F0"
                    onValueChange={onValueChange}
                    value={value}
                />
            ) : (
                <TouchableOpacity onPress={onPress}>
                    <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <ScreenWrapper bg="bg-gray-50">
            <View className="bg-white border-b border-gray-100 px-6 pt-12 pb-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full active:bg-gray-50">
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">Privacy & Security</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>

                {/* Security Section */}
                <Text className="text-gray-900 font-bold text-lg mb-4">Security</Text>

                <SettingItem
                    icon="key-outline"
                    title="Change Password"
                    subtitle="Update your login password"
                    type="link"
                    onPress={checkPasswordChange}
                    color="#F59E0B"
                />

                <SettingItem
                    icon="shield-checkmark-outline"
                    title="Two-Factor Authentication"
                    subtitle="Secure your account with 2FA"
                    value={is2FAEnabled}
                    onValueChange={setIs2FAEnabled}
                    color="#3B82F6"
                />

                <SettingItem
                    icon="finger-print-outline"
                    title="Biometric Login"
                    subtitle="Use FaceID/TouchID to login"
                    value={isBiometricEnabled}
                    onValueChange={setIsBiometricEnabled}
                    color="#8B5CF6"
                />

                {/* Privacy Section */}
                <Text className="text-gray-900 font-bold text-lg mb-4 mt-8">Privacy & Data</Text>

                <SettingItem
                    icon="share-social-outline"
                    title="Data Sharing"
                    subtitle="Allow data usage for personalization"
                    value={isDataSharingEnabled}
                    onValueChange={setIsDataSharingEnabled}
                    color="#10B981"
                />

                <SettingItem
                    icon="document-text-outline"
                    title="Privacy Policy"
                    type="link"
                    onPress={() => Alert.alert("Privacy Policy", "Link to privacy policy will open here.")}
                    color="#64748B"
                />

                <SettingItem
                    icon="newspaper-outline"
                    title="Terms of Service"
                    type="link"
                    onPress={() => Alert.alert("Terms", "Link to terms will open here.")}
                    color="#64748B"
                />

                {/* Danger Zone */}
                <Text className="text-red-600 font-bold text-lg mb-4 mt-8">Danger Zone</Text>
                <TouchableOpacity
                    onPress={deleteAccount}
                    className="flex-row items-center bg-red-50 p-4 rounded-xl border border-red-100"
                >
                    <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-red-700 font-bold text-base">Delete Account</Text>
                        <Text className="text-red-500 text-xs mt-0.5">Permanently delete your data</Text>
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </ScreenWrapper>
    );
}

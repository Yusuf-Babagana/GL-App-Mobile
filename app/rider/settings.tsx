import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function RiderSettings() {
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="pt-16 px-6 pb-6 bg-white border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mb-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-3xl font-black">Settings</Text>
            </View>

            <View className="p-6">
                {/* Account Section */}
                <Text className="text-gray-400 font-bold mb-4 uppercase text-xs">Account Info</Text>
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                    <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-50">
                        <View className="flex-row items-center">
                            <Ionicons name="person-circle-outline" size={24} color="#10b981" />
                            <Text className="ml-3 font-bold">Edit Profile</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push("/kyc/upload")}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="shield-checkmark-outline" size={24} color="#10b981" />
                            <Text className="ml-3 font-bold">Verification (KYC)</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="gray" />
                    </TouchableOpacity>
                </View>

                {/* Support Section */}
                <Text className="text-gray-400 font-bold mt-8 mb-4 uppercase text-xs">Help & Support</Text>
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
                    <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-50">
                        <View className="flex-row items-center">
                            <Ionicons name="help-buoy-outline" size={24} color="#10b981" />
                            <Text className="ml-3 font-bold">Rider Guide</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="gray" />
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center justify-between py-3">
                        <View className="flex-row items-center">
                            <Ionicons name="call-outline" size={24} color="#10b981" />
                            <Text className="ml-3 font-bold">Contact Support</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="gray" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}
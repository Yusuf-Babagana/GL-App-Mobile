import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function JobSeekerDashboard() {
    const { logout } = useAuth();

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
                <View>
                    <Text className="text-gray-500 text-xs uppercase font-bold">Job Seeker</Text>
                    <Text className="text-2xl font-bold text-gray-900">Find Work</Text>
                </View>
                <TouchableOpacity onPress={logout} className="bg-gray-100 p-2 rounded-full">
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                    <Ionicons name="search" size={20} color="#9CA3AF" />
                    <Text className="text-gray-400 ml-2">Search for jobs, skills...</Text>
                </View>

                {/* Stats */}
                <View className="flex-row gap-4 mb-8">
                    <View className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <Text className="text-blue-600 font-bold text-2xl">0</Text>
                        <Text className="text-blue-500 text-xs uppercase mt-1">Applied</Text>
                    </View>
                    <View className="flex-1 bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <Text className="text-purple-600 font-bold text-2xl">0</Text>
                        <Text className="text-purple-500 text-xs uppercase mt-1">Interviews</Text>
                    </View>
                </View>

                {/* Recent Jobs Placeholder */}
                <Text className="text-lg font-bold text-gray-900 mb-4">Recommended for you</Text>

                <View className="items-center justify-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                    <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
                    <Text className="text-gray-500 mt-2">No jobs found yet</Text>
                    <TouchableOpacity className="mt-4 bg-[#1DB954] px-6 py-2 rounded-full">
                        <Text className="text-white font-bold">Refresh Feed</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
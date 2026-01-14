import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DeliveryDashboard() {
    const { logout } = useAuth();
    const [isOnline, setIsOnline] = useState(false);

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
                <View>
                    <Text className="text-gray-500 text-xs uppercase font-bold">Delivery Partner</Text>
                    <Text className="text-2xl font-bold text-gray-900">Driver Hub</Text>
                </View>
                <TouchableOpacity onPress={logout} className="bg-gray-100 p-2 rounded-full">
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* Status Toggle */}
                <View className={`p-6 rounded-2xl mb-6 flex-row justify-between items-center ${isOnline ? 'bg-[#1DB954]' : 'bg-gray-800'}`}>
                    <View>
                        <Text className="text-white font-bold text-lg">{isOnline ? "You are Online" : "You are Offline"}</Text>
                        <Text className="text-white/80 text-sm">{isOnline ? "Waiting for orders..." : "Go online to start"}</Text>
                    </View>
                    <Switch
                        value={isOnline}
                        onValueChange={setIsOnline}
                        trackColor={{ false: "#767577", true: "#4ade80" }}
                        thumbColor={"#f4f3f4"}
                    />
                </View>

                {/* Stats */}
                <View className="flex-row gap-4 mb-8">
                    <View className="flex-1 bg-green-50 p-4 rounded-xl border border-green-100">
                        <Text className="text-green-600 font-bold text-2xl">₦0.00</Text>
                        <Text className="text-green-500 text-xs uppercase mt-1">Earnings</Text>
                    </View>
                    <View className="flex-1 bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <Text className="text-orange-600 font-bold text-2xl">0</Text>
                        <Text className="text-orange-500 text-xs uppercase mt-1">Trips</Text>
                    </View>
                </View>

                {/* Active Orders */}
                <Text className="text-lg font-bold text-gray-900 mb-4">Active Orders</Text>
                <View className="items-center justify-center py-12 bg-gray-50 rounded-2xl">
                    <Ionicons name="map-outline" size={48} color="#D1D5DB" />
                    <Text className="text-gray-500 mt-2">No active orders</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient"; // Ensure installed: npx expo install expo-linear-gradient
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setIsLoading(true);
            const data = await marketAPI.getAdminStats();
            setStats(data);
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => { fetchStats(); }, [])
    );

    if (isLoading) {
        return <View className="flex-1 bg-gray-900 justify-center items-center"><ActivityIndicator color="#F59E0B" /></View>;
    }

    return (
        <View className="flex-1 bg-gray-900">
            <StatusBar barStyle="light-content" backgroundColor="#111827" />

            {/* Header */}
            <View className="px-6 pt-12 pb-6 flex-row justify-between items-center">
                <View>
                    <Text className="text-amber-500 font-bold text-xs uppercase tracking-widest mb-1">Super Admin</Text>
                    <Text className="text-white font-bold text-3xl">Control Center</Text>
                </View>
                <TouchableOpacity onPress={() => router.replace("/(tabs)/profile")} className="bg-gray-800 p-2 rounded-full">
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-6"
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchStats} tintColor="#F59E0B" />}
            >

                {/* ESCROW VAULT CARD */}
                <LinearGradient
                    colors={['#B45309', '#F59E0B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-6 rounded-3xl mb-6 shadow-lg shadow-amber-900/50"
                >
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="lock-closed" size={20} color="white" style={{ opacity: 0.8 }} />
                        <Text className="text-white/80 font-bold ml-2 text-xs uppercase">Funds in Escrow</Text>
                    </View>
                    <Text className="text-white font-bold text-4xl mb-1">₦{Number(stats?.finance?.escrow_locked || 0).toLocaleString()}</Text>
                    <Text className="text-white/60 text-xs">Safe & Locked until delivery</Text>
                </LinearGradient>

                {/* METRICS GRID */}
                <View className="flex-row flex-wrap gap-4 mb-6">
                    {/* Total Users */}
                    <View className="w-[47%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
                        <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mb-2">
                            <Ionicons name="people" size={20} color="#60A5FA" />
                        </View>
                        <Text className="text-white font-bold text-2xl">{stats?.users?.total || 0}</Text>
                        <Text className="text-gray-400 text-xs">Total Users</Text>
                    </View>

                    {/* Total Sellers */}
                    <View className="w-[47%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
                        <View className="w-10 h-10 bg-green-500/20 rounded-full items-center justify-center mb-2">
                            <Ionicons name="storefront" size={20} color="#4ADE80" />
                        </View>
                        <Text className="text-white font-bold text-2xl">{stats?.users?.sellers || 0}</Text>
                        <Text className="text-gray-400 text-xs">Active Stores</Text>
                    </View>

                    {/* Total Orders */}
                    <View className="w-[47%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
                        <View className="w-10 h-10 bg-purple-500/20 rounded-full items-center justify-center mb-2">
                            <Ionicons name="cart" size={20} color="#C084FC" />
                        </View>
                        <Text className="text-white font-bold text-2xl">{stats?.orders?.total || 0}</Text>
                        <Text className="text-gray-400 text-xs">All Orders</Text>
                    </View>

                    {/* GMV */}
                    <View className="w-[47%] bg-gray-800 p-4 rounded-2xl border border-gray-700">
                        <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mb-2">
                            <Ionicons name="cash" size={20} color="#FBBF24" />
                        </View>
                        <Text className="text-white font-bold text-lg">₦{Number(stats?.finance?.gmv || 0).toLocaleString()}</Text>
                        <Text className="text-gray-400 text-xs">Total Sales Volume</Text>
                    </View>
                </View>

                {/* ACTIONS SECTION */}
                <Text className="text-gray-400 font-bold mb-3 uppercase text-xs">Administrative Actions</Text>

                {/* NEW: Review KYC Requests Button */}
                <TouchableOpacity
                    onPress={() => router.push("/admin/kyc-requests")}
                    className="bg-blue-600 p-4 rounded-xl flex-row justify-between items-center mb-4 shadow-lg shadow-blue-900/20"
                >
                    <View className="flex-row items-center">
                        <Ionicons name="id-card" size={22} color="white" style={{ marginRight: 12 }} />
                        <View>
                            <Text className="text-white font-bold text-base">Review KYC Requests</Text>
                            <Text className="text-blue-200 text-xs">Verify user identities</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>

                {/* SYSTEM STATUS */}
                <Text className="text-gray-400 font-bold mb-3 uppercase text-xs mt-4">System Health</Text>
                <View className="bg-gray-800 p-4 rounded-2xl border border-gray-700 mb-10">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-gray-300">Pending Deliveries</Text>
                        <Text className="text-white font-bold">{stats?.orders?.pending || 0}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <Text className="text-gray-300">Completed Orders</Text>
                        <Text className="text-green-400 font-bold">{stats?.orders?.completed || 0}</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function OrderListScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const data = await marketAPI.getMyOrders();
            setOrders(data.results || data);
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => { fetchOrders(); }, [])
    );

    const renderOrder = ({ item }: { item: any }) => (
        <View className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-start mb-3">
                <View>
                    <Text className="font-bold text-gray-900 text-lg">Order #{item.id}</Text>
                    <Text className="text-gray-500 text-xs mt-1">{new Date(item.created_at).toDateString()}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${item.delivery_status === 'delivered' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Text className={`text-[10px] font-bold uppercase ${item.delivery_status === 'delivered' ? 'text-green-700' : 'text-orange-700'}`}>
                        {item.delivery_status.replace("_", " ")}
                    </Text>
                </View>
            </View>

            <View className="h-[1px] bg-gray-50 w-full mb-3" />

            <View className="flex-row justify-between items-center">
                <Text className="text-[#1DB954] font-bold text-xl">₦{Number(item.total_price).toLocaleString()}</Text>
                <TouchableOpacity
                    onPress={() => router.push(`/orders/${item.id}`)}
                    className="bg-gray-900 px-4 py-2 rounded-xl flex-row items-center"
                >
                    <Text className="text-white text-xs font-bold mr-1">Details</Text>
                    <Ionicons name="chevron-forward" size={14} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

            {/* Simple Header */}
            <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row items-center pt-12">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">My Orders</Text>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#1DB954" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderOrder}
                    contentContainerStyle={{ padding: 24 }}
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-4">You have no orders yet.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}
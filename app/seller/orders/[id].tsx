import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function SellerOrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchOrder = async () => {
        try {
            // Quick trick: Fetch all seller orders and find the specific one
            // This saves us from creating a new backend endpoint just for this
            const ordersRes = await marketAPI.getSellerOrders();
            const allOrders = ordersRes.results || ordersRes;
            const found = allOrders.find((o: any) => o.id === Number(id));
            setOrder(found);
        } catch (e) {
            console.log("Error", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const markAsReady = async () => {
        Alert.alert("Confirm", "Is this order packed and ready for the rider?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes, Ready for Pickup",
                onPress: async () => {
                    setIsUpdating(true);
                    try {
                        // We use 'ready_for_pickup' status so Riders can see it
                        await marketAPI.updateOrderStatus(Number(id), 'ready_for_pickup');
                        Alert.alert("Success", "Riders have been notified!");
                        fetchOrder(); // Refresh UI
                    } catch (e: any) {
                        Alert.alert("Error", e.message || "Failed to update");
                    } finally {
                        setIsUpdating(false);
                    }
                }
            }
        ]);
    };

    if (isLoading || !order) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#111827" />

            {/* Header */}
            <View className="bg-gray-900 pt-12 pb-6 px-6 rounded-b-[32px] shadow-lg z-10">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-gray-800 p-2 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">Order #{order.id}</Text>
                </View>
                <View className="flex-row gap-2">
                    {/* Status Badge */}
                    <View className={`px-3 py-1 rounded-full ${order.delivery_status === 'delivered' ? 'bg-green-500' :
                            order.delivery_status === 'ready_for_pickup' ? 'bg-blue-500' :
                                order.delivery_status === 'picked_up' ? 'bg-purple-500' :
                                    'bg-orange-500'
                        }`}>
                        <Text className="text-white font-bold text-xs uppercase">{order.delivery_status.replace("_", " ")}</Text>
                    </View>

                    {/* Payment Badge */}
                    <View className={`px-3 py-1 rounded-full ${order.payment_status === 'released' ? 'bg-green-500' : 'bg-gray-700'}`}>
                        <Text className="text-white font-bold text-xs uppercase">
                            {order.payment_status === 'released' ? 'Paid' : 'Escrow Locked'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">

                {/* Buyer Info Card */}
                <View className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="person" size={20} color="#1DB954" />
                        <Text className="font-bold text-gray-900 ml-2 text-lg">Customer Details</Text>
                    </View>
                    <Text className="text-gray-900 text-base font-medium mb-1">{order.shipping_address_json?.address}</Text>
                    <Text className="text-gray-500 mb-2">{order.shipping_address_json?.city}</Text>

                    <TouchableOpacity className="flex-row items-center bg-gray-50 p-3 rounded-xl mt-2">
                        <Ionicons name="call" size={18} color="#3B82F6" />
                        <Text className="text-blue-600 font-bold ml-2">{order.shipping_address_json?.phone}</Text>
                    </TouchableOpacity>
                </View>

                {/* Items List */}
                <Text className="font-bold text-gray-900 text-lg mb-3 ml-1">Items to Pack</Text>
                {/* We map through items if available, or just show a placeholder if the structure differs */}
                {order.items ? order.items.map((item: any) => (
                    <View key={item.id} className="flex-row items-center mb-3 bg-white p-4 rounded-2xl border border-gray-100">
                        <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center">
                            <Text className="font-bold text-gray-900">x{item.quantity}</Text>
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="font-bold text-gray-900 text-lg">{item.product?.name || "Product"}</Text>
                            <Text className="text-green-600 font-bold">₦{Number(item.price_at_purchase).toLocaleString()}</Text>
                        </View>
                    </View>
                )) : (
                    <Text className="text-gray-500">Items loading...</Text>
                )}

                <View className="h-24" />
            </ScrollView>

            {/* Action Button: Only show if status is Pending */}
            {order.delivery_status === 'pending' && (
                <View className="absolute bottom-0 w-full p-6 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        onPress={markAsReady}
                        disabled={isUpdating}
                        className="bg-gray-900 py-4 rounded-2xl items-center shadow-lg"
                    >
                        {isUpdating ? <ActivityIndicator color="white" /> : (
                            <View className="flex-row items-center">
                                <Ionicons name="cube" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold text-lg">Ready for Pickup</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
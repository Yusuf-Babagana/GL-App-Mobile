import { useAuth } from "@/context/AuthContext";
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { userRole } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchOrder = async () => {
        // Safety: Don't call the API if ID is not a valid number
        if (!id || isNaN(Number(id))) {
            console.log("DEBUG: ID is NaN, skipping fetch");
            return;
        }

        try {
            setIsLoading(true);
            const data = await marketAPI.getOrderById(Number(id));
            setOrder(data);
        } catch (e) {
            console.log("Error fetching order:", e);
            // Alert.alert("Error", "Could not load order details.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id && id !== 'NaN') {
            fetchOrder();
        }
    }, [id]);

    const markAsShipped = async () => {
        Alert.alert("Confirm Shipment", "Are you sure you have shipped this item?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes, Mark Shipped",
                onPress: async () => {
                    setIsUpdating(true);
                    try {
                        await marketAPI.updateOrderStatus(Number(id), 'shipped');
                        Alert.alert("Success", "Buyer has been notified!");
                        fetchOrder(); // Refresh
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
                    <View className={`px-3 py-1 rounded-full ${order.delivery_status === 'shipped' ? 'bg-blue-500' : order.delivery_status === 'delivered' ? 'bg-green-500' : 'bg-orange-500'}`}>
                        <Text className="text-white font-bold text-xs uppercase">{order.delivery_status}</Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${order.payment_status === 'released' ? 'bg-green-500' : 'bg-gray-700'}`}>
                        <Text className="text-white font-bold text-xs uppercase">Payment: {order.payment_status === 'released' ? 'Paid' : 'In Escrow'}</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">

                {/* Secure Delivery PIN Card */}



                {/* Rider Information & Contact Card */}
                {order.rider && (
                    <View className="bg-white p-5 rounded-3xl mt-4 shadow-sm border border-gray-100 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="bg-emerald-100 p-3 rounded-full">
                                <Ionicons name="bicycle" size={24} color="#059669" />
                            </View>
                            <View className="ml-4">
                                <Text className="text-gray-400 text-xs font-bold uppercase">Your Rider</Text>
                                <Text className="text-gray-900 font-bold text-lg">{order.rider_name || "Kano Partner"}</Text>
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={() => Linking.openURL(`tel:${order.rider_phone || '0800000000'}`)}
                            className="bg-emerald-500 p-3 rounded-2xl"
                        >
                            <Ionicons name="call" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Shipping Address Card */}
                <View className="bg-white p-5 rounded-2xl mb-4 shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="location" size={20} color="#1DB954" />
                        <Text className="font-bold text-gray-900 ml-2 text-lg">Ship To</Text>
                    </View>
                    <Text className="text-gray-900 text-base font-medium mb-1">{order.shipping_address_json?.address}</Text>
                    <Text className="text-gray-500 mb-2">{order.shipping_address_json?.city}</Text>

                    <TouchableOpacity className="flex-row items-center bg-gray-50 p-3 rounded-xl">
                        <Ionicons name="call" size={18} color="#3B82F6" />
                        <Text className="text-blue-600 font-bold ml-2">{order.shipping_address_json?.phone}</Text>
                    </TouchableOpacity>
                </View>

                {/* Items List */}
                <Text className="font-bold text-gray-900 text-lg mb-3 ml-1">Items to Pack</Text>
                {order.items?.map((item: any) => (
                    <View key={item.id} className="flex-row items-center mb-3 bg-white p-4 rounded-2xl border border-gray-100">
                        <View className="w-12 h-12 bg-gray-200 rounded-lg items-center justify-center">
                            <Text className="font-bold text-gray-500">x{item.quantity}</Text>
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="font-bold text-gray-900">{item.product_name}</Text>
                            <Text className="text-green-600 font-bold">₦{Number(item.price_at_purchase).toLocaleString()}</Text>
                        </View>
                    </View>
                ))}

                <View className="h-24" />
            </ScrollView>

            {/* Action Button - ONLY FOR SELLERS */}
            {userRole === 'seller' && order.delivery_status === 'pending' && (
                <View className="absolute bottom-0 w-full p-6 bg-white border-t border-gray-100">
                    <TouchableOpacity
                        onPress={markAsShipped}
                        disabled={isUpdating}
                        className="bg-gray-900 py-4 rounded-2xl items-center shadow-lg"
                    >
                        {isUpdating ? <ActivityIndicator color="white" /> : (
                            <View className="flex-row items-center">
                                <Ionicons name="cube" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold text-lg">Mark as Shipped</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
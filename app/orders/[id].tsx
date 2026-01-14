import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch Order Data
    const fetchOrder = async () => {
        try {
            const data = await marketAPI.getOrderById(Number(id));
            setOrder(data);
        } catch (e) {
            console.log("Error", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    // Handle Confirmation Logic
    const handleConfirmReceipt = async () => {
        Alert.alert(
            "Confirm Delivery",
            "Are you sure you have received these items? This will release funds to the seller.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Confirm",
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await marketAPI.confirmOrder(order.id); // Call API
                            Alert.alert("Success", "Funds released to seller!");
                            fetchOrder(); // Refresh to see updated status
                        } catch (e: any) {
                            Alert.alert("Error", e.error || "Failed to confirm.");
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#1DB954" />
            </View>
        );
    }

    if (!order) return <View className="flex-1 bg-white" />;

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Order #{order.id}</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6">

                {/* Status Card */}
                <View className={`p-6 rounded-2xl border mb-6 items-center ${order.delivery_status === 'delivered' ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                    <View className={`p-3 rounded-full mb-3 ${order.delivery_status === 'delivered' ? 'bg-green-100' : 'bg-orange-100'}`}>
                        <Ionicons name={order.delivery_status === 'delivered' ? "checkmark-circle" : "time"} size={30} color={order.delivery_status === 'delivered' ? "#15803d" : "#EA580C"} />
                    </View>
                    <Text className="text-xl font-bold text-gray-900 uppercase">
                        {order.delivery_status.replace("_", " ")}
                    </Text>
                    <Text className="text-gray-500 text-center mt-2 px-4">
                        {order.delivery_status === 'delivered'
                            ? "This order is complete."
                            : "Funds are held in Escrow until you confirm receipt."}
                    </Text>
                </View>

                {/* CONFIRM BUTTON (Only if not delivered yet) */}
                {order.delivery_status !== 'delivered' && (
                    <TouchableOpacity
                        onPress={handleConfirmReceipt}
                        className="bg-black py-4 rounded-xl items-center mb-8 shadow-md shadow-gray-300"
                    >
                        <Text className="text-white font-bold text-lg">Confirm I Received Order</Text>
                    </TouchableOpacity>
                )}

                {/* Shipping Info */}
                <View className="mb-6">
                    <Text className="font-bold text-lg mb-3">Shipping Details</Text>
                    <View className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <Text className="text-gray-900 font-bold mb-1">Address</Text>
                        <Text className="text-gray-600 mb-3">{order.shipping_address_json?.address}</Text>

                        <Text className="text-gray-900 font-bold mb-1">Contact</Text>
                        <Text className="text-gray-600">{order.shipping_address_json?.phone}</Text>
                    </View>
                </View>

                {/* Items List */}
                <View className="mb-8">
                    <Text className="font-bold text-lg mb-3">Items Purchased</Text>
                    {order.items?.map((item: any) => (
                        <View key={item.id} className="flex-row items-center mb-4 bg-white p-3 rounded-xl border border-gray-100">
                            <View className="w-16 h-16 bg-gray-200 rounded-lg mr-4 bg-center bg-cover">
                                {/* Placeholder image if item.image is missing from serializer, otherwise use Image component */}
                                <Ionicons name="cube" size={24} color="#ccc" style={{ alignSelf: 'center', marginTop: 15 }} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-gray-900">{item.product_name || "Product"}</Text>
                                <Text className="text-gray-500">Qty: {item.quantity}</Text>
                            </View>
                            <Text className="font-bold text-gray-900">₦{Number(item.price_at_purchase).toLocaleString()}</Text>
                        </View>
                    ))}
                </View>

                {/* Total */}
                <View className="border-t border-gray-100 pt-4 mb-10 flex-row justify-between items-center">
                    <Text className="text-xl font-bold text-gray-900">Total Paid</Text>
                    <Text className="text-2xl font-bold text-[#1DB954]">₦{Number(order.total_price).toLocaleString()}</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
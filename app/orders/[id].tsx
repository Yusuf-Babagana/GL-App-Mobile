import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchOrder = async () => {
        if (!id || isNaN(Number(id))) return;

        try {
            setIsLoading(true);
            const data = await marketAPI.getOrderById(Number(id));
            setOrder(data);
        } catch (e) {

        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id && id !== 'NaN') {
            fetchOrder();
        }
    }, [id]);

    // --- ACTIONS ---

    const handleDispatch = async () => {
        setIsUpdating(true);
        try {
            await marketAPI.markOrderDispatched(order.id);
            Alert.alert("Success", "Order marked as dispatched!");
            fetchOrder();
        } catch (err: any) {
            Alert.alert("Error", "Could not update status");
        } finally {
            setIsUpdating(false);
        }
    };

    const handleConfirm = async () => {
        Alert.alert(
            "Confirm Delivery",
            "Are you sure you have received this item? This will mark the order as completed.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes, Received",
                    onPress: async () => {
                        setIsUpdating(true);
                        try {
                            await marketAPI.confirmOrderReceipt(Number(id));
                            setOrder((prev: any) => prev ? { ...prev, delivery_status: 'delivered' } : prev);
                            Alert.alert("Success", "Order completed!");
                            fetchOrder();
                        } catch (err: any) {
                            Alert.alert("Error", err.error || "Action failed");
                        } finally {
                            setIsUpdating(false);
                        }
                    }
                }
            ]
        );
    };

    if (isLoading || !order) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text className="mt-4 text-gray-500">Loading Order Details...</Text>
            </View>
        );
    }

    const isSeller = order.store?.owner_id === currentUser?.id;
    const isBuyer = order.buyer?.id === currentUser?.id;

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#111827" />

            {/* Header */}
            <View className="bg-slate-900 pt-12 pb-6 px-6 rounded-b-[32px] z-10">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} className="mr-4 bg-slate-800 p-2 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-2xl font-bold">Order #{order.id}</Text>
                </View>
                <View className="flex-row gap-2">
                    <View className={`px-3 py-1 rounded-full ${order.delivery_status === 'shipped' ? 'bg-blue-500' : order.delivery_status === 'delivered' ? 'bg-primary' : 'bg-orange-500'}`}>
                        <Text className="text-white font-bold text-xs uppercase">{order.delivery_status}</Text>
                    </View>
                    <View className="px-3 py-1 rounded-full bg-primary">
                        <Text className="text-white font-bold text-xs uppercase">Paid</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">

                {/* Delivery PIN (For tracking) */}
                {isBuyer && order.delivery_code && order.delivery_status !== 'delivered' && (
                    <View className="bg-blue-50 p-5 rounded-3xl mb-4 border border-blue-100 items-center">
                        <Text className="text-blue-600 font-bold uppercase text-xs mb-1">Confirmation Code</Text>
                        <Text className="text-3xl font-black text-blue-700 tracking-widest">{order.delivery_code}</Text>
                        <Text className="text-blue-500 text-[10px] mt-2 text-center">Share this code with the rider upon delivery.</Text>
                    </View>
                )}

                {/* Rider Section */}
                {order.rider && (
                    <View className="bg-white p-5 rounded-3xl mb-4 border border-gray-100 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="bg-green-50 p-3 rounded-full">
                                <Ionicons name="bicycle" size={24} color={Colors.primary} />
                            </View>
                            <View className="ml-4">
                                <Text className="text-gray-500 text-xs font-bold uppercase">Assigned Rider</Text>
                                <Text className="text-slate-900 font-bold text-lg">{order.rider_name || "GloLink Rider"}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => Linking.openURL(`tel:${order.rider_phone}`)}
                            className="bg-primary p-3 rounded-2xl"
                        >
                            <Ionicons name="call" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Shipping Info */}
                <View className="bg-white p-5 rounded-3xl mb-4 border border-gray-100">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="location" size={20} color={Colors.primary} />
                        <Text className="font-bold text-slate-900 ml-2 text-lg">Delivery Address</Text>
                    </View>
                    <Text className="text-slate-900 text-base font-medium mb-1">{order.shipping_address_json?.address}</Text>
                    <Text className="text-gray-500 mb-3">{order.shipping_address_json?.city}</Text>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL(`tel:${order.shipping_address_json?.phone}`)}
                        className="flex-row items-center bg-gray-50 p-3 rounded-xl"
                    >
                        <Ionicons name="call" size={18} color="#2563EB" />
                        <Text className="text-blue-700 font-bold ml-2">{order.shipping_address_json?.phone}</Text>
                    </TouchableOpacity>
                </View>

                {/* Items */}
                <Text className="font-bold text-slate-900 text-lg mb-3 ml-1">Products</Text>
                {order.items?.map((item: any) => (
                    <View key={item.id} className="flex-row items-center mb-3 bg-white p-4 rounded-2xl border border-gray-100">
                        <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center">
                            <Text className="font-bold text-primary">x{item.quantity}</Text>
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="font-bold text-slate-900" numberOfLines={1}>{item.product_name}</Text>
                            <Text className="text-gray-500 text-xs">₦{Number(item.price_at_purchase).toLocaleString()}</Text>
                        </View>
                        <Text className="font-bold text-slate-900">₦{(item.quantity * item.price_at_purchase).toLocaleString()}</Text>
                    </View>
                ))}

                {/* Pricing Breakdown */}
                {order.items?.length > 0 && (() => {
                    const subtotal = order.items.reduce(
                        (sum: number, item: any) => sum + (item.quantity * Number(item.price_at_purchase)),
                        0
                    );
                    const totalPaid = Number(order.total_price) || subtotal;
                    const processingFee = Math.max(0, totalPaid - subtotal);
                    const netYield = isSeller ? totalPaid - processingFee : null;

                    return (
                        <View className="bg-white p-5 rounded-3xl mb-4 border border-gray-100">
                            <Text className="font-bold text-slate-900 text-lg mb-4">Payment Summary</Text>

                            <View className="flex-row justify-between items-center mb-3">
                                <View className="flex-1">
                                    <Text className="text-slate-900 font-bold text-sm">Item Subtotal</Text>
                                    <Text className="text-gray-500 text-[10px] font-medium">Gross order value</Text>
                                </View>
                                <Text className="text-slate-900 font-bold">₦{subtotal.toLocaleString()}</Text>
                            </View>

                            <View className="h-px bg-gray-100 my-2" />

                            <View className="flex-row justify-between items-center mb-3">
                                <View className="flex-1">
                                    <Text className="text-slate-900 font-bold text-sm">Platform Processing Fee</Text>
                                    <Text className="text-gray-500 text-[10px] font-medium">Includes platform processing fee capped at ₦2,500</Text>
                                </View>
                                <Text className="text-gray-500 font-bold">─ ₦{processingFee.toLocaleString()}</Text>
                            </View>

                            {processingFee === 0 && (
                                <View className="bg-emerald-50 rounded-xl px-3 py-2 mb-3">
                                    <Text className="text-emerald-600 text-[10px] font-bold">No processing fee applied to this order.</Text>
                                </View>
                            )}

                            <View className="h-px bg-gray-100 my-2" />

                            <View className="flex-row justify-between items-center">
                                <View className="flex-1">
                                    <Text className="text-slate-900 font-bold text-base">
                                        {isSeller ? 'Total Estimated Net Yield' : 'Total Charged'}
                                    </Text>
                                    {isSeller && (
                                        <Text className="text-gray-500 text-[10px] font-medium">Vendor payout after fees</Text>
                                    )}
                                </View>
                                <Text className="text-slate-900 font-black text-lg">
                                    ₦{(isSeller ? netYield : totalPaid).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    );
                })()}

                <View className="h-32" />
            </ScrollView>

            {/* SELLER: Dispatch Button */}
            {isSeller && order.delivery_status === 'pending' && (
                <View className="absolute bottom-0 w-full p-6 bg-white border-t border-gray-100 pb-10">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleDispatch}
                        disabled={isUpdating}
                        className="bg-blue-600 py-4 rounded-2xl items-center"
                    >
                        {isUpdating ? <ActivityIndicator color="white" /> : (
                            <Text className="text-white font-bold text-lg">Mark as Dispatched</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* BUYER: Confirm Receipt Button — only when shipped */}
            {isBuyer && order.delivery_status === 'shipped' && (
                <View className="absolute bottom-0 w-full p-6 bg-white border-t border-gray-100 pb-10">
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleConfirm}
                        disabled={isUpdating}
                        className="bg-emerald-600 py-5 rounded-2xl items-center flex-row justify-center"
                    >
                        {isUpdating ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={22} color="white" />
                                <Text className="text-white font-black text-lg ml-2">Confirm Material Received</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

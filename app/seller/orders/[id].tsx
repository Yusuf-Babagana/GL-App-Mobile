import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function SellerOrderDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch the order using the unified marketAPI on mount
    useEffect(() => { fetchOrder(); }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            // Yusuf, we now use the central marketAPI to ensure the Token is included
            const data = await marketAPI.getOrderDetail(id);
            setOrder(data);
        } catch (e: any) {
            console.log("Fetch Error for Order #" + id, e.response?.data);
            const errorMsg = e.response?.status === 401
                ? "Your session has expired. Please log in again."
                : "Order not found.";
            Alert.alert("Authentication Error", errorMsg);
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status: string) => {
        try {
            setIsUpdating(true);
            // Sends the PATCH request through the authenticated marketAPI channel
            await marketAPI.updateOrderStatus(id, status);

            Alert.alert("Success", `Order is now ${status.replace('_', ' ')}`);
            fetchOrder(); // Refresh data to update the status badge
        } catch (e: any) {
            console.log("Update Error:", e.response?.data);
            Alert.alert("Action Failed", "You do not have permission to update this order.");
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <View className="flex-1 justify-center items-center bg-slate-50">
            <ActivityIndicator size="large" color="#10B981" />
        </View>
    );

    return (
        <ScrollView className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" />

            {/* --- Dark Professional Header --- */}
            <View className="bg-white pt-14 pb-6 px-6 border-b border-slate-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#0f172a" />
                </TouchableOpacity>
                <Text className="text-xl font-black text-slate-900">Order Fulfillment</Text>
                <View className="w-10" />
            </View>

            <View className="p-6">
                {/* Reference & Badge */}
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Reference ID</Text>
                        <Text className="text-3xl font-black text-slate-900">#{order?.id}</Text>
                    </View>
                    <View className="bg-emerald-500 px-4 py-2 rounded-2xl shadow-sm">
                        <Text className="text-white font-black text-[10px] uppercase tracking-tighter">
                            {order?.delivery_status?.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                {/* --- Customer Shipping Info --- */}
                <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-8">
                    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Customer Details</Text>
                    <View className="flex-row items-center mb-4">
                        <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mr-4">
                            <Ionicons name="person" size={20} color="#10B981" />
                        </View>
                        <View>
                            <Text className="text-slate-900 font-black text-base">{order?.shipping_address_json?.full_name}</Text>
                            <Text className="text-slate-500 font-bold text-xs">{order?.shipping_address_json?.phone}</Text>
                        </View>
                    </View>

                    <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-2">
                        <Text className="text-slate-600 leading-5 font-medium">
                            {order?.shipping_address_json?.address}{"\n"}
                            {order?.shipping_address_json?.city}, {order?.shipping_address_json?.state}
                        </Text>
                    </View>
                </View>

                {/* --- Action Buttons --- */}
                <Text className="text-slate-900 font-black text-lg mb-4 px-1">Update Progress</Text>

                <TouchableOpacity
                    onPress={() => updateStatus('ready_for_pickup')}
                    disabled={isUpdating || order?.delivery_status === 'ready_for_pickup'}
                    className={`p-6 rounded-3xl flex-row items-center justify-center shadow-lg ${order?.delivery_status === 'ready_for_pickup' ? 'bg-emerald-600' : 'bg-slate-950'
                        }`}
                >
                    {isUpdating ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Ionicons name="cube" size={22} color="white" />
                            <Text className="text-white font-black ml-3 text-base uppercase tracking-widest">
                                {order?.delivery_status === 'ready_for_pickup' ? "Ready for Pickup" : "Mark Ready to Pickup"}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <View className="flex-row gap-4 mt-4">
                    <TouchableOpacity
                        onPress={() => updateStatus('shipped')}
                        className="flex-1 bg-white border border-slate-200 p-5 rounded-3xl items-center shadow-sm"
                    >
                        <Text className="text-slate-900 font-black text-xs uppercase tracking-widest">Shipped</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => updateStatus('delivered')}
                        className="flex-1 bg-white border border-slate-200 p-5 rounded-3xl items-center shadow-sm"
                    >
                        <Text className="text-slate-900 font-black text-xs uppercase tracking-widest">Delivered</Text>
                    </TouchableOpacity>
                </View>

                {/* Financial Summary */}
                <View className="mt-12 pt-8 border-t border-slate-100 items-center">
                    <Text className="text-slate-400 text-[10px] font-black uppercase mb-2">Total Earnings</Text>
                    <Text className="text-emerald-600 text-4xl font-black">₦{Number(order?.total_price).toLocaleString()}</Text>
                </View>
            </View>
        </ScrollView>
    );
}
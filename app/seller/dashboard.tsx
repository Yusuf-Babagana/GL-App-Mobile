import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function SellerDashboard() {
    const { logout } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

    const fetchAllData = async () => {
        try {
            setIsLoading(true);
            const [productsRes, ordersRes, statsRes] = await Promise.all([
                api.get("/market/seller/products/"),
                api.get("/market/seller/orders/"),
                api.get("/market/seller/stats/")
            ]);
            setProducts(productsRes.data.results || productsRes.data);
            setOrders(ordersRes.data.results || ordersRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.log("Error fetching seller data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchAllData(); }, []));

    // Fixes white background by resolving Cloudinary vs Local paths
    const getImageUrl = (item: any) => {
        const path = item.image || item.images?.[0]?.image;
        if (!path) return 'https://via.placeholder.com/400';
        if (path.startsWith('http')) return path;
        return `http://172.20.10.7:8000/media/${path}`;
    };

    const handleDeleteProduct = (id: number) => {
        Alert.alert("Delete Product", "This is permanent. Are you sure?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        await api.delete(`/market/seller/products/${id}/delete/`);
                        fetchAllData();
                    } catch (e) {
                        Alert.alert("Error", "Could not delete product.");
                    }
                }
            }
        ]);
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* --- TOP HEADER --- */}
            <View className="bg-slate-900 pt-12 pb-8 px-6 rounded-b-[40px] shadow-2xl">
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-1 mr-4">
                        <Text className="text-emerald-500 text-[10px] font-black uppercase tracking-[2px] mb-1">Live Management</Text>
                        <Text className="text-white text-3xl font-black" numberOfLines={1}>{stats?.store_name || "Merchant"}</Text>
                    </View>

                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={logout}
                            className="bg-red-500/10 w-12 h-12 rounded-2xl items-center justify-center border border-red-500/20"
                        >
                            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.replace("/(tabs)")}
                            className="bg-slate-800 w-12 h-12 rounded-2xl items-center justify-center border border-slate-700"
                        >
                            <Ionicons name="storefront-outline" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Revenue Card */}
                <View className="bg-emerald-500 p-6 rounded-3xl flex-row justify-between items-center shadow-lg shadow-emerald-900/20">
                    <View>
                        <Text className="text-emerald-100 text-[10px] font-black uppercase mb-1">Available Revenue</Text>
                        <Text className="text-white text-4xl font-black">₦{Number(stats?.revenue || 0).toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity className="bg-white/20 px-5 py-3 rounded-2xl">
                        <Text className="text-white font-black text-xs uppercase tracking-widest">Payout</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 -mt-6 pt-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAllData} tintColor="#10B981" />}
            >
                {/* --- NAVIGATION TABS --- */}
                <View className="flex-row gap-3 mb-8">
                    <TouchableOpacity
                        onPress={() => setActiveTab('orders')}
                        className={`flex-1 p-5 rounded-3xl shadow-sm border items-center ${activeTab === 'orders' ? 'bg-white border-emerald-500' : 'bg-slate-100 border-transparent'}`}
                    >
                        <Ionicons name="receipt" size={24} color={activeTab === 'orders' ? '#10B981' : '#94a3b8'} />
                        <Text className={`font-black text-xl mt-2 ${activeTab === 'orders' ? 'text-slate-900' : 'text-slate-400'}`}>{orders.length}</Text>
                        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Orders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab('products')}
                        className={`flex-1 p-5 rounded-3xl shadow-sm border items-center ${activeTab === 'products' ? 'bg-white border-emerald-500' : 'bg-slate-100 border-transparent'}`}
                    >
                        <Ionicons name="cube" size={24} color={activeTab === 'products' ? '#10B981' : '#94a3b8'} />
                        <Text className={`font-black text-xl mt-2 ${activeTab === 'products' ? 'text-slate-900' : 'text-slate-400'}`}>{products.length}</Text>
                        <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Items</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push("/seller/add-product")}
                        className="flex-1 bg-slate-900 p-5 rounded-3xl shadow-xl items-center justify-center"
                    >
                        <Ionicons name="add" size={32} color="#10B981" />
                        <Text className="text-white text-[10px] font-black uppercase tracking-widest mt-1">Add</Text>
                    </TouchableOpacity>
                </View>

                {/* --- CONTENT SECTION --- */}
                {activeTab === 'products' ? (
                    <View className="gap-4">
                        {products.map((item) => (
                            <View key={item.id} className="bg-white p-4 rounded-[32px] flex-row shadow-sm border border-slate-100">
                                <Image
                                    source={{ uri: getImageUrl(item) }}
                                    className="w-20 h-20 rounded-2xl bg-slate-50"
                                    contentFit="cover"
                                />
                                <View className="flex-1 ml-4 justify-between">
                                    <View className="flex-row justify-between items-start">
                                        <Text className="font-black text-slate-900 text-base flex-1 mr-2" numberOfLines={1}>{item.name}</Text>
                                        <View className="flex-row gap-4">
                                            <TouchableOpacity onPress={() => router.push(`/seller/edit-product/${item.id}`)}>
                                                <Ionicons name="create-outline" size={20} color="#3B82F6" />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleDeleteProduct(item.id)}>
                                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View className="flex-row justify-between items-end">
                                        <Text className="text-emerald-600 font-black text-lg">₦{Number(item.price).toLocaleString()}</Text>
                                        <View className="bg-slate-50 px-2 py-1 rounded-lg">
                                            <Text className="text-[10px] font-black text-slate-400 uppercase">{item.stock} Left</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="gap-4">
                        {orders.length === 0 ? (
                            <View className="items-center py-20">
                                <Ionicons name="receipt-outline" size={64} color="#e2e8f0" />
                                <Text className="text-slate-400 font-bold mt-4">No active orders</Text>
                            </View>
                        ) : (
                            orders.map((order) => (
                                <TouchableOpacity
                                    key={order.id}
                                    onPress={() => router.push(`/seller/orders/${order.id}`)}
                                    activeOpacity={0.7}
                                    className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100"
                                >
                                    <View className="flex-row justify-between items-center mb-4">
                                        <Text className="font-black text-slate-900 text-lg">Order #{order.id}</Text>
                                        <View className={`px-3 py-1 rounded-full ${order.delivery_status === 'ready_for_pickup' ? 'bg-emerald-100' : 'bg-orange-100'}`}>
                                            <Text className={`text-[10px] font-black uppercase tracking-tighter ${order.delivery_status === 'ready_for_pickup' ? 'text-emerald-700' : 'text-orange-700'}`}>
                                                {order.delivery_status?.replace("_", " ")}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row justify-between items-end border-t border-slate-50 pt-4">
                                        <View>
                                            <Text className="text-slate-400 text-[10px] font-black uppercase mb-1">Customer</Text>
                                            <Text className="text-slate-900 font-bold">{order.shipping_address_json?.full_name || "Guest"}</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-slate-400 text-[10px] font-black uppercase mb-1">Total Value</Text>
                                            <Text className="text-emerald-600 font-black text-lg">₦{Number(order.total_price).toLocaleString()}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
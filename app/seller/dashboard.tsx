import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function SellerDashboard() {
    const [products, setProducts] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

    // Fetch all data (Products, Orders, Stats)
    const fetchAllData = async () => {
        try {
            setIsLoading(true);

            // 1. Fetch Products
            const productsRes = await api.get("/market/seller/products/");
            setProducts(productsRes.data.results || productsRes.data);

            // 2. Fetch Orders (For the new tab)
            const ordersRes = await api.get("/market/seller/orders/");
            setOrders(ordersRes.data.results || ordersRes.data);

            // 3. Fetch Real Stats
            const statsRes = await api.get("/market/seller/stats/");
            setStats(statsRes.data);

        } catch (error) {
            console.log("Error fetching seller data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAllData();
        }, [])
    );

    const handleWithdraw = () => {
        Alert.alert("Info", "Withdrawal system coming soon.");
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#111827" />

            {/* --- TOP HEADER (Dark Theme) --- */}
            <View className="bg-gray-900 pt-12 pb-6 px-6 rounded-b-[30px] z-10">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">Store Dashboard</Text>
                        <Text className="text-white text-2xl font-bold mt-1">{stats?.store_name || "My Business"}</Text>
                    </View>

                    {/* Close Button -> Goes back to Profile Tab */}
                    <TouchableOpacity
                        onPress={() => router.replace("/(tabs)/profile")}
                        className="bg-gray-800 p-2 rounded-full"
                    >
                        <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Wallet Card */}
                <View className="bg-[#1DB954] p-5 rounded-2xl flex-row justify-between items-center shadow-lg shadow-green-900/20">
                    <View>
                        <Text className="text-white/80 text-xs font-medium mb-1">Total Revenue</Text>
                        <Text className="text-white text-3xl font-bold">₦{Number(stats?.revenue || 0).toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity onPress={handleWithdraw} className="bg-white/20 px-4 py-2 rounded-lg">
                        <Text className="text-white font-bold text-xs">Withdraw</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 -mt-4 pt-6"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchAllData} tintColor="#1DB954" />}
            >

                {/* --- QUICK ACTIONS GRID --- */}
                <View className="flex-row gap-3 mb-4">
                    <TouchableOpacity
                        onPress={() => setActiveTab('orders')}
                        className={`flex-1 p-4 rounded-2xl shadow-sm border items-center ${activeTab === 'orders' ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-100'}`}
                    >
                        <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="receipt" size={20} color="#F97316" />
                        </View>
                        <Text className="text-gray-900 font-bold text-lg">{stats?.orders || orders.length}</Text>
                        <Text className="text-gray-400 text-xs">Orders</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab('products')}
                        className={`flex-1 p-4 rounded-2xl shadow-sm border items-center ${activeTab === 'products' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}
                    >
                        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="cube" size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-gray-900 font-bold text-lg">{stats?.products || products.length}</Text>
                        <Text className="text-gray-400 text-xs">Products</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push("/seller/add-product")}
                        className="flex-1 bg-gray-900 p-4 rounded-2xl shadow-sm items-center justify-center"
                    >
                        <Ionicons name="add" size={28} color="white" />
                        <Text className="text-white text-xs font-bold mt-1">Add New</Text>
                    </TouchableOpacity>
                </View>

                {/* --- NEW: MESSAGES BUTTON --- */}
                <TouchableOpacity
                    onPress={() => router.push("/seller/messages")}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-row items-center justify-between mb-6"
                >
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3">
                            <Ionicons name="chatbubbles" size={20} color="#9333EA" />
                        </View>
                        <View>
                            <Text className="text-gray-900 font-bold text-base">Customer Messages</Text>
                            <Text className="text-gray-400 text-xs">View inquiries from buyers</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </TouchableOpacity>


                {/* --- TAB SWITCHER --- */}
                <View className="flex-row border-b border-gray-200 mb-4">
                    <TouchableOpacity
                        onPress={() => setActiveTab('products')}
                        className={`pb-2 mr-6 border-b-2 ${activeTab === 'products' ? 'border-gray-900' : 'border-transparent'}`}
                    >
                        <Text className={`font-bold text-lg ${activeTab === 'products' ? 'text-gray-900' : 'text-gray-400'}`}>
                            Inventory
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab('orders')}
                        className={`pb-2 border-b-2 ${activeTab === 'orders' ? 'border-gray-900' : 'border-transparent'}`}
                    >
                        <Text className={`font-bold text-lg ${activeTab === 'orders' ? 'text-gray-900' : 'text-gray-400'}`}>
                            Orders <Text className="text-xs text-[#1DB954]">{orders.length > 0 ? `(${orders.length})` : ''}</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* --- PRODUCTS TAB --- */}
                {activeTab === 'products' && (
                    <View>
                        {products.length === 0 && !isLoading ? (
                            <View>
                                {/* Alert Banner for New Sellers */}
                                <TouchableOpacity
                                    onPress={() => router.push("/seller/setup")}
                                    className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-4 flex-row items-center"
                                >
                                    <Ionicons name="warning" size={24} color="#F97316" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-orange-800 font-bold">First Step: Setup Shop</Text>
                                        <Text className="text-orange-700 text-xs mt-1">
                                            You must name your store before you can add products. Tap here.
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color="#F97316" />
                                </TouchableOpacity>

                                {/* Empty State Illustration */}
                                <View className="bg-white p-8 rounded-2xl items-center border border-dashed border-gray-200">
                                    <View className="bg-gray-50 w-16 h-16 rounded-full items-center justify-center mb-4">
                                        <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
                                    </View>
                                    <Text className="text-gray-900 font-bold mb-1">Your store is empty</Text>
                                    <Text className="text-gray-500 text-center text-sm px-4">
                                        After you set up your store, upload your first product here.
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View className="gap-3">
                                {products.map((item) => (
                                    <View key={item.id} className="bg-white p-3 rounded-2xl flex-row shadow-sm border border-gray-100">
                                        <Image
                                            source={{ uri: item.image || item.images?.[0]?.image }}
                                            className="w-24 h-24 rounded-xl bg-gray-100"
                                            contentFit="cover"
                                            transition={200}
                                        />

                                        <View className="flex-1 ml-3 justify-between py-1">
                                            <View>
                                                <View className="flex-row justify-between items-start">
                                                    <Text className="font-bold text-gray-900 text-base flex-1 mr-2" numberOfLines={1}>{item.name}</Text>
                                                    <TouchableOpacity>
                                                        <Ionicons name="ellipsis-horizontal" size={20} color="#9CA3AF" />
                                                    </TouchableOpacity>
                                                </View>
                                                <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>{item.description}</Text>
                                            </View>

                                            <View className="flex-row justify-between items-center mt-2">
                                                <Text className="text-[#1DB954] font-bold text-lg">₦{Number(item.price).toLocaleString()}</Text>
                                                <View className={`px-2 py-1 rounded-md ${item.stock > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                                                    <Text className={`text-xs font-bold ${item.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                        {item.stock > 0 ? `${item.stock} in Stock` : 'Out of Stock'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* --- ORDERS TAB (NEW) --- */}
                {activeTab === 'orders' && (
                    <View>
                        {orders.length === 0 ? (
                            <View className="bg-white p-10 rounded-2xl items-center border border-dashed border-gray-200 mt-2">
                                <Ionicons name="receipt-outline" size={40} color="#D1D5DB" />
                                <Text className="text-gray-400 mt-4 text-center">No incoming orders yet.</Text>
                            </View>
                        ) : (
                            <View className="gap-3">
                                {orders.map((order) => (
                                    <TouchableOpacity
                                        key={order.id}
                                        onPress={() => router.push(`/seller/orders/${order.id}`)}
                                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 active:bg-gray-50"
                                    >
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="font-bold text-gray-900 text-base">Order #{order.id}</Text>
                                            <View className={`px-2 py-1 rounded-full ${order.delivery_status === 'delivered' ? 'bg-green-100' :
                                                order.delivery_status === 'ready_for_pickup' ? 'bg-blue-100' :
                                                    order.delivery_status === 'picked_up' ? 'bg-purple-100' :
                                                        'bg-orange-100'
                                                }`}>
                                                <Text className={`text-[10px] font-bold uppercase ${order.delivery_status === 'delivered' ? 'text-green-700' :
                                                    order.delivery_status === 'ready_for_pickup' ? 'text-blue-700' :
                                                        order.delivery_status === 'picked_up' ? 'text-purple-700' :
                                                            'text-orange-700'
                                                    }`}>
                                                    {order.delivery_status?.replace("_", " ")}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text className="text-gray-500 text-xs mb-3">
                                            {new Date(order.created_at).toDateString()}
                                        </Text>

                                        <View className="bg-gray-50 p-3 rounded-xl mb-3">
                                            <Text className="text-xs text-gray-500 font-bold uppercase mb-1">Ship To</Text>
                                            <Text className="text-gray-900 font-medium text-sm" numberOfLines={1}>{order.shipping_address_json?.address}</Text>
                                            <Text className="text-gray-600 text-xs">{order.shipping_address_json?.city}</Text>
                                        </View>

                                        <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                                            <Text className="text-gray-500 text-xs font-bold uppercase">Total Value</Text>
                                            <Text className="font-bold text-lg text-gray-900">₦{Number(order.total_price).toLocaleString()}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>
        </View>
    );
}
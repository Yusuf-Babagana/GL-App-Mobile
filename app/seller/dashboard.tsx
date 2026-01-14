import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function SellerDashboard() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Mock Stats (Fetch real data later)
    const stats = {
        totalSales: 0,
        activeOrders: 0,
        views: 0
    };

    const fetchMyProducts = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("/market/seller/products/");
            setProducts(response.data);
        } catch (error) {
            console.log("Error fetching seller products", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchMyProducts();
        }, [])
    );

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#111827" />

            {/* --- TOP HEADER (Dark Theme) --- */}
            <View className="bg-gray-900 pt-12 pb-6 px-6 rounded-b-[30px]">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">Store Dashboard</Text>
                        <Text className="text-white text-2xl font-bold mt-1">My Business</Text>
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
                        <Text className="text-white text-3xl font-bold">₦{stats.totalSales.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity className="bg-white/20 px-4 py-2 rounded-lg">
                        <Text className="text-white font-bold text-xs">Withdraw</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 -mt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchMyProducts} tintColor="#1DB954" />}
            >

                {/* --- QUICK ACTIONS GRID --- */}
                <View className="flex-row gap-3 mb-6">
                    <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center">
                        <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="receipt" size={20} color="#F97316" />
                        </View>
                        <Text className="text-gray-900 font-bold text-lg">{stats.activeOrders}</Text>
                        <Text className="text-gray-400 text-xs">Orders</Text>
                    </View>

                    <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 items-center">
                        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mb-2">
                            <Ionicons name="analytics" size={20} color="#3B82F6" />
                        </View>
                        <Text className="text-gray-900 font-bold text-lg">{stats.views}</Text>
                        <Text className="text-gray-400 text-xs">Views</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push("/seller/add-product")}
                        className="flex-1 bg-gray-900 p-4 rounded-2xl shadow-sm items-center justify-center"
                    >
                        <Ionicons name="add" size={28} color="white" />
                        <Text className="text-white text-xs font-bold mt-1">Add New</Text>
                    </TouchableOpacity>
                </View>

                {/* --- PRODUCTS SECTION --- */}
                <View className="flex-row justify-between items-end mb-4">
                    <Text className="text-gray-900 font-bold text-lg">Inventory ({products.length})</Text>
                    <TouchableOpacity>
                        <Text className="text-[#1DB954] text-sm font-medium">See All</Text>
                    </TouchableOpacity>
                </View>

                {/* --- SETUP STORE BANNER (If Empty) --- */}
                {products.length === 0 && !isLoading ? (
                    <View>
                        {/* Alert Banner for New Sellers */}
                        <TouchableOpacity
                            onPress={() => router.push("/seller/setup-store")}
                            className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-4 flex-row items-center"
                        >
                            <Ionicons name="warning" size={24} color="#F97316" />
                            <View className="ml-3 flex-1">
                                <Text className="text-orange-800 font-bold">First Step: Setup Shop</Text>
                                <Text className="text-orange-700 text-xs mt-1">
                                    You must name your store before you can add products. Tap here to set it up.
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
                                    source={{ uri: item.images?.[0]?.image }}
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
                                        <Text className="text-[#1DB954] font-bold text-lg">₦{item.price.toLocaleString()}</Text>

                                        {/* Stock Badge */}
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

            </ScrollView>
        </View>
    );
}
import SafeScreen from "@/components/SafeScreen";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function SellerDashboard() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMyProducts = async () => {
        try {
            setIsLoading(true);
            // Backend endpoint to get ONLY my products
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
        <SafeScreen>
            <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-2xl font-bold text-gray-900">My Store</Text>
                <TouchableOpacity
                    onPress={() => router.push("/seller/add-product")}
                    className="bg-[#1DB954] px-4 py-2 rounded-full flex-row items-center"
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text className="text-white font-bold ml-1">Add Product</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchMyProducts} />}
            >
                {/* Stats Row (Mock Data for now) */}
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <Text className="text-blue-500 font-bold text-xs uppercase">Total Sales</Text>
                        <Text className="text-2xl font-bold text-gray-900 mt-1">₦0.00</Text>
                    </View>
                    <View className="flex-1 bg-orange-50 p-4 rounded-xl border border-orange-100">
                        <Text className="text-orange-500 font-bold text-xs uppercase">Orders</Text>
                        <Text className="text-2xl font-bold text-gray-900 mt-1">0</Text>
                    </View>
                </View>

                <Text className="text-lg font-bold mb-4">My Products</Text>

                {products.length === 0 && !isLoading ? (
                    <View className="items-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                        <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
                        <Text className="text-gray-500 mt-2">No products yet.</Text>
                        <Text className="text-gray-400 text-sm text-center px-8 mt-1">
                            Start selling by adding your first product!
                        </Text>
                    </View>
                ) : (
                    products.map((item) => (
                        <View key={item.id} className="flex-row bg-white p-3 rounded-xl mb-3 border border-gray-100 shadow-sm">
                            <Image
                                source={{ uri: item.images?.[0]?.image }}
                                className="w-20 h-20 rounded-lg bg-gray-200"
                            />
                            <View className="flex-1 ml-3 justify-center">
                                <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{item.name}</Text>
                                <Text className="text-[#1DB954] font-bold mt-1">₦{item.price.toLocaleString()}</Text>
                                <Text className="text-gray-500 text-xs mt-1">Stock: {item.stock}</Text>
                            </View>
                            <TouchableOpacity className="justify-center px-2">
                                <Ionicons name="create-outline" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeScreen>
    );
}
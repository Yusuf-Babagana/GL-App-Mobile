import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function StorePublicView() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [store, setStore] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                // Fetch store details and all products
                const [storeData, allProducts] = await Promise.all([
                    marketAPI.getStoreDetail(id as string),
                    marketAPI.getProducts()
                ]);
                setStore(storeData);
                // Filter products to only show those belonging to this store
                const storeProducts = allProducts.filter((p: any) => p.store === parseInt(id as string) || p.store?.id === parseInt(id as string));
                setProducts(storeProducts);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStoreData();
    }, [id]);

    if (loading) return <ActivityIndicator size="large" color="#10B981" className="flex-1" />;

    return (
        <View className="flex-1 bg-background">
            {/* Header / Banner */}
            <LinearGradient
                colors={['#14532D', '#329629']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="pt-14 pb-10 px-6 rounded-b-[40px] shadow-lg shadow-primary/30"
            >
                <TouchableOpacity onPress={() => router.back()} className="mb-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>

                <View className="flex-row items-center">
                    <View className="w-20 h-20 bg-white rounded-2xl overflow-hidden mr-5 border-2 border-white/20 shadow-md">
                        <Image source={{ uri: store?.logo }} className="w-full h-full" contentFit="cover" />
                    </View>
                    <View className="flex-1 justify-center">
                        <View className="flex-row items-center mb-1">
                            <Text className="text-white text-2xl font-black mr-2 tracking-tight leading-7">{store?.name}</Text>
                            {store?.is_verified && <Ionicons name="checkmark-circle" size={18} color="#DCFCE7" />}
                        </View>
                        <Text className="text-primary-container text-xs font-medium bg-primary-dark/30 self-start px-2 py-1 rounded-lg overflow-hidden border border-white/10">
                            {store?.product_count} Products Available
                        </Text>
                    </View>
                </View>
                <Text className="text-primary-container mt-5 text-sm font-medium leading-6 opacity-90 pl-1 border-l-2 border-white/30">{store?.description}</Text>
            </LinearGradient>

            {/* Products Grid */}
            <FlatList
                data={products}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                ListHeaderComponent={<Text className="text-slate-900 font-black text-xl mb-4 ml-1">Store Collection</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => router.push(`/product/${item.id}`)}
                        activeOpacity={0.9}
                        className="w-[48%] mb-4 bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden"
                        style={{
                            shadowColor: "#64748B",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.08,
                            shadowRadius: 12,
                            elevation: 4
                        }}
                    >
                        <View className="h-36 bg-slate-50 relative">
                            <Image
                                source={{ uri: item.images?.[0]?.image }}
                                className="w-full h-full"
                                contentFit="cover"
                                transition={300}
                            />
                        </View>
                        <View className="p-3">
                            <Text className="font-bold text-slate-800 text-sm mb-1" numberOfLines={1}>{item.name}</Text>
                            <Text className="text-primary font-black text-sm">₦{Number(item.price).toLocaleString()}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={<Text className="text-center text-slate-400 mt-10">This store has no products yet.</Text>}
            />
        </View>
    );
}
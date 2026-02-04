import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

export default function MarketsScreen() {
    const router = useRouter();
    const [stores, setStores] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchStores = async () => {
        try {
            const data = await marketAPI.getAllStores();
            setStores(data);
        } catch (e) {
            console.log("Markets Fetch Error:", e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { fetchStores(); }, []));

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchStores();
    };

    const renderStore = ({ item }: { item: any }) => {
        /**
         * UPDATED LOGIC:
         * Uses the same logic as the Product grid to resolve Cloudinary vs Local Media
         */
        const getLogoUrl = (path: string) => {
            const BASE_IP = "172.20.10.7"; // Your current active IP

            if (!path || path === "undefined" || path === "null") {
                // Dynamic placeholder using the Store's initial
                return `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`;
            }

            if (path.startsWith('http')) return path;

            const cleanPath = path.startsWith('/') ? path.substring(1) : path;
            return `http://${BASE_IP}:8000/media/${cleanPath}`;
        };

        const logoUrl = getLogoUrl(item.logo);

        return (
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: "/market/[id]",
                    params: { id: item.id, name: item.name }
                })}
                activeOpacity={0.9}
                className="w-[48%] mb-4 bg-white rounded-3xl p-4 items-center shadow-sm border border-slate-100"
                style={styles.cardShadow}
            >
                {/* Store Logo Container */}
                <View className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden mb-3 border border-slate-100 shadow-inner items-center justify-center">
                    <Image
                        source={{ uri: logoUrl }}
                        className="w-full h-full"
                        contentFit="cover"
                        transition={300}
                        // Add cache policy to avoid flickering on refresh
                        cachePolicy="memory-disk"
                    />
                </View>

                {/* Info */}
                <View className="items-center w-full">
                    <View className="flex-row items-center justify-center mb-1">
                        <Text className="text-slate-900 font-bold text-base text-center leading-5" numberOfLines={1}>
                            {item.name}
                        </Text>
                        {item.is_verified && (
                            <View className="bg-green-100 p-0.5 rounded-full ml-1.5">
                                <Ionicons name="checkmark-sharp" size={10} color="#10B981" />
                            </View>
                        )}
                    </View>

                    <Text className="text-slate-400 text-xs font-medium text-center mb-3" numberOfLines={1}>
                        {item.product_count || 0} Products
                    </Text>

                    <View className="bg-slate-50 px-3 py-1.5 rounded-full w-full items-center">
                        <Text className="text-primary text-[10px] font-bold uppercase tracking-wider">
                            View Store
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-slate-50">
            <StatusBar barStyle="dark-content" />

            {/* Header Area */}
            <LinearGradient
                colors={['#DCFCE7', '#F8FAFC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                className="pt-16 pb-6 px-6 z-10 border-b border-primary/5 rounded-b-[40px] shadow-sm mb-4"
            >
                <View className="flex-row items-center justify-between mb-2">
                    <View className="bg-primary/10 px-3 py-1 rounded-full">
                        <Text className="text-primary text-[10px] font-black uppercase tracking-[2px]">Directory</Text>
                    </View>
                </View>

                <View className="flex-row items-end justify-between">
                    <Text className="text-3xl font-black text-slate-900 leading-9 tracking-tight">
                        Verified{"\n"}Markets
                    </Text>
                    <View className="bg-white w-12 h-12 rounded-2xl items-center justify-center mb-1 shadow-sm border border-slate-100">
                        <Ionicons name="storefront" size={24} color="#329629" />
                    </View>
                </View>
            </LinearGradient>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator color="#10B981" size="large" />
                    <Text className="text-slate-400 font-bold mt-4 text-xs uppercase tracking-widest">Finding Stores...</Text>
                </View>
            ) : (
                <FlatList
                    data={stores}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderStore}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#10B981" />
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-24 px-10">
                            <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-4 shadow-sm border border-slate-100">
                                <Ionicons name="storefront-outline" size={32} color="#CBD5E1" />
                            </View>
                            <Text className="text-slate-900 font-black text-lg text-center">No Stores Found</Text>
                            <Text className="text-slate-400 text-center text-sm mt-2">There are no verification merchants available right now.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor: "#64748B",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3
    }
});
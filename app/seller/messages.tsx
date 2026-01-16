import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SellerMessagesScreen() {
    const router = useRouter();
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadChats = async () => {
        try {
            const data = await marketAPI.getConversations();
            setConversations(data);
        } catch (error) {
            console.log("Error fetching chats:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadChats();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/chat/${item.other_user_id}`)}
            className="flex-row items-center p-4 bg-white border-b border-gray-100"
        >
            {/* Avatar */}
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                <Text className="text-blue-600 font-bold text-lg">
                    {item.name.charAt(0).toUpperCase()}
                </Text>
            </View>

            {/* Info */}
            <View className="flex-1">
                <View className="flex-row justify-between mb-1">
                    <Text className="font-bold text-gray-900 text-base">{item.name}</Text>
                    <Text className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                </View>
                <Text numberOfLines={1} className="text-gray-500 text-sm">
                    {item.last_message}
                </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="p-4 bg-white border-b border-gray-200 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="font-bold text-xl">Messages</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#1DB954" />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => {
                            setRefreshing(true);
                            loadChats();
                        }} />
                    }
                    ListEmptyComponent={
                        <View className="items-center mt-20">
                            <Ionicons name="chatbubbles-outline" size={64} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-4">No messages yet</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, SafeAreaView, Text, TouchableOpacity, View } from "react-native";

export default function ChatTab() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const loadConversations = async () => {
        setIsLoading(true);
        try {
            const data = await marketAPI.getConversations();
            setConversations(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadConversations();
        }, [])
    );

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push({
                pathname: "/chat/[userId]",
                params: { userId: item.id, name: item.other_user_name }
            })}
            className="flex-row items-center p-4 border-b border-gray-100 bg-white"
        >
            <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center">
                <Text className="font-bold text-primary text-lg">
                    {(item.other_user_name || "?")[0]}
                </Text>
            </View>
            <View className="flex-1 ml-4">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-bold text-gray-900 text-base">{item.other_user_name}</Text>
                    <Text className="text-gray-400 text-xs">{item.time}</Text>
                </View>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>
                    {item.last_message || "No messages yet"}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
                <Text className="text-2xl font-black text-gray-900">Messages</Text>
                <TouchableOpacity onPress={loadConversations}>
                    <Ionicons name="refresh" size={20} color="#329629" />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#329629" />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ flexGrow: 1 }}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center p-6">
                            <Ionicons name="chatbubbles-outline" size={64} color="#e2e8f0" />
                            <Text className="text-gray-400 mt-4 text-center font-bold">
                                No conversations yet.{'\n'}Start chatting from a product page!
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

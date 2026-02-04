import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { chatApi } from "@/lib/chatApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function SellerMessages() {
    const [inbox, setInbox] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadInbox = async () => {
        try {
            const data = await chatApi.getInbox();
            setInbox(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadInbox(); }, []);

    return (
        <ScreenWrapper bg="bg-white">
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-50">
                <Text className="text-2xl font-bold text-gray-900">Customer Chats</Text>
                <TouchableOpacity onPress={loadInbox}>
                    <Ionicons name="refresh" size={20} color="#64748B" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator className="mt-20" color="#3B82F6" />
            ) : (
                <FlatList
                    data={inbox}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    ListEmptyComponent={
                        <View className="items-center mt-20 px-10">
                            <Ionicons name="chatbubbles-outline" size={60} color="#CBD5E1" />
                            <Text className="text-gray-400 text-center mt-4 font-medium">
                                No active inquiries yet. High-quality product videos attract more buyers!
                            </Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: `/chat/${item.id}`,
                                params: { name: item.other_user_name }
                            })}
                            className="flex-row items-center p-4 mx-4 my-1 bg-white rounded-2xl border border-gray-100"
                        >
                            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                                <Text className="text-blue-600 font-bold">{item.other_user_name[0]}</Text>
                            </View>
                            <View className="flex-1 ml-4">
                                <View className="flex-row justify-between">
                                    <Text className="font-bold text-gray-900">{item.other_user_name}</Text>
                                    <Text className="text-gray-400 text-[10px]">{item.time}</Text>
                                </View>
                                <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                                    {item.last_message}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </ScreenWrapper>
    );
}
import { useAuth } from "@/context/AuthContext";
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ChatScreen() {
    const { userId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    const [conversationId, setConversationId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [chatTitle, setChatTitle] = useState("Loading...");
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const flatListRef = useRef<FlatList>(null);

    // Initialize Chat & Fetch Details
    const initChat = async () => {
        try {
            const data = await marketAPI.startChat(Number(userId));
            setConversationId(data.conversation_id);

            if (data.partner_name) {
                setChatTitle(data.partner_name);
            } else {
                setChatTitle("User");
            }

            setMessages(data.messages);
        } catch (e) {
            console.log("Error loading chat:", e);
            setChatTitle("Chat");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setMessages([]);
        setChatTitle("Loading...");
        setIsLoading(true);

        initChat();

        const interval = setInterval(() => {
            initChat();
        }, 3000);

        return () => clearInterval(interval);
    }, [userId]);

    const handleSend = async () => {
        if (!inputText.trim() || !conversationId) return;

        const tempMsg = {
            id: Date.now(),
            text: inputText,
            sender__id: user?.id,
            sender__email: user?.email,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempMsg]);
        setInputText("");

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        try {
            await marketAPI.sendMessage(conversationId, tempMsg.text);
        } catch (e) {
            console.log("Failed to send message");
        }
    };

    const renderMessage = ({ item }: { item: any }) => {
        // 1. Check ID (Primary) OR Email (Fallback)
        const isMe = (user?.id && String(item.sender__id) === String(user.id)) ||
            (user?.email && item.sender__email === user.email);

        return (
            <View className={`mb-2 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                {/* STYLE CHANGE:
                   - Me: Brand Green (#1DB954)
                   - Them: Light Gray (gray-200) -> This is the "Standard" look
                */}
                <View className={`px-4 py-3 rounded-2xl max-w-[80%] ${isMe
                    ? 'bg-[#1DB954] rounded-tr-none'
                    : 'bg-gray-200 rounded-tl-none'
                    }`}>

                    <Text className={`text-base ${isMe ? 'text-white' : 'text-gray-900'}`}>
                        {item.text}
                    </Text>

                    <Text className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-100' : 'text-gray-500'}`}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="white" />

            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row items-center z-10 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>

                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Text className="text-blue-600 font-bold text-lg">
                        {chatTitle && chatTitle !== "Loading..." ? chatTitle.charAt(0).toUpperCase() : "?"}
                    </Text>
                </View>

                <View>
                    <Text className="font-bold text-lg text-gray-900">
                        {chatTitle}
                    </Text>
                    {!isLoading && <Text className="text-green-600 text-xs">● Active now</Text>}
                </View>
            </View>

            {/* Messages List */}
            {isLoading && messages.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#1DB954" />
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View className="items-center mt-10">
                            <Text className="text-gray-400">No messages yet. Say Hi!</Text>
                        </View>
                    }
                />
            )}

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
            >
                <View className="p-4 bg-white flex-row items-center border-t border-gray-100">
                    <TextInput
                        className="flex-1 bg-gray-100 rounded-2xl px-5 py-3 mr-3 max-h-24 text-base"
                        placeholder="Type a message..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                        className={`w-12 h-12 rounded-full items-center justify-center shadow-sm ${inputText.trim() ? 'bg-[#1DB954]' : 'bg-gray-200'}`}
                    >
                        <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
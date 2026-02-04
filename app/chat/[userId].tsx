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
    const [lastId, setLastId] = useState(0);
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

            // Set initial lastId
            if (data.messages && data.messages.length > 0) {
                const maxId = data.messages[data.messages.length - 1].id;
                setLastId(maxId);
            }
        } catch (e) {
            console.log("Error loading chat:", e);
            setChatTitle("Chat");
        } finally {
            setIsLoading(false);
        }
    };

    // Yusuf: Optimized Polling function
    const pollMessages = async () => {
        if (!conversationId) return;

        try {
            // Only fetch messages newer than what we have
            const newMessages = await marketAPI.getMessages(conversationId, lastId);

            if (newMessages.length > 0) {
                setMessages(prev => [...prev, ...newMessages]);
                // Update the lastId to the ID of the very last message received
                const maxId = newMessages[newMessages.length - 1].id;
                setLastId(maxId);

                // Auto scroll to bottom for new messages
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
            }
        } catch (e) {
            console.log("Polling error:", e);
        }
    };

    useEffect(() => {
        setMessages([]);
        setChatTitle("Loading...");
        setIsLoading(true);
        setLastId(0);

        initChat();

        // Yusuf: Use a 2-second interval for professional balance 
        // between speed and server load on PythonAnywhere
        const interval = setInterval(() => {
            pollMessages();
        }, 2000);

        return () => clearInterval(interval);
    }, [userId, conversationId, lastId]); // Dependencies are important!

    const handleSend = async () => {
        if (!inputText.trim() || !conversationId) return;

        const tempMsg = {
            id: Date.now(),
            text: inputText,
            sender__id: user?._id,
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
        // Yusuf: Check for 'id' and '_id' to be safe across different versions
        const myId = (user as any)?.id || user?._id;
        const senderId = item.sender_id || item.sender__id;
        const isMe = senderId === myId;

        return (
            <View className={`p-3 rounded-2xl mb-2 max-w-[75%] ${isMe ? 'bg-[#1DB954] self-end rounded-tr-none' : 'bg-gray-200 self-start rounded-tl-none'
                }`}>
                <Text className={isMe ? 'text-white' : 'text-gray-800'}>{item.text}</Text>
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
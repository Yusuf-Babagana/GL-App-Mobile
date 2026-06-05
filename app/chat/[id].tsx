import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const POLL_INTERVAL_MS = 3000;

interface Message {
    id: number;
    text: string;
    sender__id: number;
    is_me?: boolean;
    created_at: string;
    failed?: boolean;
}

const formatTime = (iso: string) => {
    try {
        return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
        return '';
    }
};

const MessageBubble = React.memo(({ item }: { item: Message }) => {
    const isMe = item.is_me;
    return (
        <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther, item.failed && styles.bubbleFailed]}>
                <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextOther]}>
                    {item.text}
                </Text>
                <View style={[styles.bubbleMeta, isMe ? styles.bubbleMetaMe : styles.bubbleMetaOther]}>
                    <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeOther]}>
                        {formatTime(item.created_at)}
                    </Text>
                    {isMe && item.failed && (
                        <Ionicons name="close-circle" size={13} color="#EF4444" style={{ marginLeft: 3 }} />
                    )}
                </View>
            </View>
        </View>
    );
});

export default function ChatScreen() {
    const { id, userId, name } = useLocalSearchParams<{ id?: string; userId?: string; name?: string }>();
    const identifier = id || userId;
    const router = useRouter();
    const { user, isSignedIn } = useAuth();
    const insets = useSafeAreaInsets();

    const initialConvId = identifier ? Number(identifier) : null;
    const [messages, setMessages] = useState<Message[]>([]);
    const [chatTitle, setChatTitle] = useState(name || "Chat");
    const [convId, setConvId] = useState<number | null>(initialConvId);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    const flatListRef = useRef<FlatList>(null);
    const lastIdRef = useRef(0);
    const mountedRef = useRef(true);
    const currentUserId = (user as any)?.id || (user as any)?._id;

    // ── Fetch messages via startChat ──
    const fetchMessages = useCallback(async () => {
        if (!identifier) return;
        try {
            const { data } = await api.post('/chat/start/', {
                user_id: Number(identifier),
            });
            if (!mountedRef.current || !data) return;

            if (data.conversation_id) setConvId(data.conversation_id);
            if (data.partner_name || data.other_user_name) {
                setChatTitle(data.partner_name || data.other_user_name);
            }

            const msgs: Message[] = (data.messages || []).map((m: Message) => ({
                ...m,
                is_me: m.sender__id === currentUserId,
            }));
            if (msgs.length > 0) {
                setMessages(msgs);
                lastIdRef.current = msgs[msgs.length - 1].id;
            }
        } catch {
            // silent
        }
    }, [identifier, currentUserId]);

    // ── Init ──
    useEffect(() => {
        mountedRef.current = true;
        let cancelled = false;

        (async () => {
            await fetchMessages();
            if (cancelled) return;
            setIsLoading(false);
        })();

        return () => { cancelled = true; mountedRef.current = false; };
    }, [fetchMessages]);

    // ── Poll loop ──
    useEffect(() => {
        const timer = setInterval(async () => {
            if (!mountedRef.current) return;
            try {
                const { data } = await api.post('/chat/start/', {
                    user_id: Number(identifier),
                });
                if (!mountedRef.current || !data) return;

                if (data.conversation_id) setConvId(data.conversation_id);

                const fresh: Message[] = (data.messages || []).map((m: Message) => ({
                    ...m,
                    is_me: m.sender__id === currentUserId,
                }));

                setMessages(prev => {
                    const existing = new Set(prev.map(m => m.id));
                    const newOnes = fresh.filter((m: Message) => !existing.has(m.id));
                    if (!newOnes.length) return prev;
                    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
                    return [...prev, ...newOnes];
                });

                if (fresh.length > 0) {
                    lastIdRef.current = fresh[fresh.length - 1].id;
                }
            } catch { /* silent */ }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(timer);
    }, [identifier, currentUserId]);

    // ── Send ──
    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || !convId || !identifier) return;

        setIsSending(true);
        const optimistic: Message = {
            id: Date.now(),
            text,
            sender__id: currentUserId || 0,
            is_me: true,
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimistic]);
        setInputText("");
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

        try {
            await api.post(`/chat/conversations/${convId}/send/`, {
                conversation: convId,
                message: text,
            });
        } catch {
            setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, failed: true } as Message : m));
        } finally {
            setIsSending(false);
        }
    };

    const renderMessage = useCallback(({ item }: { item: Message }) => (
        <MessageBubble item={item} />
    ), []);

    const keyExtractor = useCallback((item: Message, i: number) =>
        item.id?.toString() || `msg-${i}`, []);

    if (!isSignedIn) {
        return (
            <View style={[styles.root, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />
                <Ionicons name="chatbubble-ellipses" size={64} color={Colors.primary} />
                <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.text.primary, marginTop: 16, textAlign: 'center' }}>
                    Login to chat with sellers
                </Text>
                <Text style={{ fontSize: 14, color: Colors.text.secondary, marginTop: 8, textAlign: 'center', marginBottom: 24 }}>
                    You need to be signed in to send and receive messages.
                </Text>
                <TouchableOpacity
                    onPress={() => router.push("/(auth)/login")}
                    style={{ backgroundColor: Colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 }}
                >
                    <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>Log In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 44 : 0}
        >
            <StatusBar barStyle="light-content" backgroundColor={Colors.primaryDark} />

            <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerProfile}>
                        <View style={styles.headerAvatar}>
                            <Text style={styles.headerAvatarText}>
                                {chatTitle && chatTitle !== "Chat"
                                    ? chatTitle.charAt(0).toUpperCase()
                                    : '?'}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerName} numberOfLines={1}>{chatTitle}</Text>
                            <Text style={styles.headerStatus}>Online</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.messageArea}>
                {isLoading && messages.length === 0 ? (
                    <View style={styles.loadingWrap}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={keyExtractor}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        onContentSizeChange={(_, h) => {
                            if (h > 0) flatListRef.current?.scrollToEnd({ animated: false });
                        }}
                        ListEmptyComponent={
                            <View style={styles.emptyWrap}>
                                <View style={styles.emptyIcon}>
                                    <Ionicons name="chatbubble-ellipses" size={40} color={Colors.primary} />
                                </View>
                                <Text style={styles.emptyTitle}>Say hello!</Text>
                                <Text style={styles.emptySub}>Send a message to get started</Text>
                            </View>
                        }
                        maxToRenderPerBatch={20}
                        windowSize={5}
                        initialNumToRender={20}
                        removeClippedSubviews={Platform.OS === 'android'}
                    />
                )}
            </View>

            <View style={[styles.inputBar, { paddingBottom: insets.bottom + 8 }]}>
                <View style={styles.inputWrap}>
                    <TextInput
                        style={styles.input}
                        placeholder="Message..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        value={inputText}
                        onChangeText={setInputText}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSend}
                    disabled={!inputText.trim() || isSending}
                    activeOpacity={0.8}
                    style={[
                        styles.sendBtn,
                        { opacity: !inputText.trim() || isSending ? 0.4 : 1 },
                    ]}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Ionicons name="send" size={18} color="white" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },

    header: {
        backgroundColor: Colors.primary,
        paddingBottom: 12,
        paddingHorizontal: 12,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 6,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        zIndex: 10,
    },
    headerRow: { flexDirection: 'row', alignItems: 'center' },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center', alignItems: 'center',
    },
    headerProfile: {
        flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12,
    },
    headerAvatar: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.25)',
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    headerAvatarText: { color: 'white', fontSize: 18, fontWeight: '700' },
    headerName: { color: 'white', fontSize: 17, fontWeight: '700' },
    headerStatus: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 1 },

    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    messageArea: { flex: 1 },
    listContent: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 },

    bubbleRow: {
        marginBottom: 3,
        flexDirection: 'row',
    },
    bubbleRowMe: { justifyContent: 'flex-end' },
    bubble: {
        maxWidth: '78%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
    },
    bubbleMe: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    bubbleOther: {
        backgroundColor: '#F1F5F9',
        borderBottomLeftRadius: 4,
    },
    bubbleText: { fontSize: 16, lineHeight: 21 },
    bubbleTextMe: { color: 'white' },
    bubbleTextOther: { color: '#0F172A' },
    bubbleMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    bubbleMetaMe: { justifyContent: 'flex-end' },
    bubbleMetaOther: { justifyContent: 'flex-end' },
    bubbleTime: { fontSize: 10, fontWeight: '500' },
    bubbleTimeMe: { color: 'rgba(255,255,255,0.65)' },
    bubbleTimeOther: { color: '#94A3B8' },
    bubbleFailed: { opacity: 0.6, borderWidth: 1, borderColor: '#EF4444' },

    emptyWrap: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: Colors.primaryContainer,
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
    emptySub: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, textAlign: 'center' },

    inputBar: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
        paddingTop: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        gap: 8,
    },
    inputWrap: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 10 : 6,
        maxHeight: 100,
    },
    input: {
        fontSize: 16,
        color: Colors.text.primary,
        maxHeight: 80,
        padding: 0,
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center', alignItems: 'center',
        elevation: 3,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

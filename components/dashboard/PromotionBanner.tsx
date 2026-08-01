import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Text, TouchableOpacity, View, ViewToken } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, ShoppingBag } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { marketAPI } from '@/lib/marketApi';

interface PromotedPost {
    id: number;
    text_content: string;
    promotion_type: 'product' | 'standalone';
    product_id: number | null;
    image: string | null;
    seller_name: string | null;
    time_remaining_seconds: number | null;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40; // matches Home's px-5 (20px) container padding on each side
const CARD_HEIGHT = 108;
const AUTOPLAY_MS = 4000;

function formatTimeRemaining(seconds: number | null): string | null {
    if (seconds == null) return null;
    if (seconds <= 0) return null;
    const hours = Math.floor(seconds / 3600);
    if (hours >= 24) return `${Math.floor(hours / 24)}d left`;
    if (hours >= 1) return `${hours}h left`;
    return `${Math.max(1, Math.floor(seconds / 60))}m left`;
}

export default function PromotionBanner() {
    const router = useRouter();
    const [posts, setPosts] = useState<PromotedPost[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<FlatList>(null);
    const autoplayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        let isMounted = true;
        marketAPI.getActivePromotedPosts().then((data) => {
            if (isMounted) setPosts(Array.isArray(data) ? data : []);
        });
        return () => { isMounted = false; };
    }, []);

    const stopAutoplay = useCallback(() => {
        if (autoplayTimer.current) {
            clearInterval(autoplayTimer.current);
            autoplayTimer.current = null;
        }
    }, []);

    const startAutoplay = useCallback(() => {
        stopAutoplay();
        if (posts.length <= 1) return;
        autoplayTimer.current = setInterval(() => {
            setActiveIndex((prev) => {
                const next = (prev + 1) % posts.length;
                listRef.current?.scrollToIndex({ index: next, animated: true });
                return next;
            });
        }, AUTOPLAY_MS);
    }, [posts.length, stopAutoplay]);

    useEffect(() => {
        startAutoplay();
        return stopAutoplay;
    }, [startAutoplay, stopAutoplay]);

    const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index != null) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const goToDestination = (post: PromotedPost) => {
        if (post.promotion_type === 'product' && post.product_id) {
            router.push({ pathname: '/product/[id]', params: { id: post.product_id } });
        } else {
            router.push({ pathname: '/promoted-post/[id]', params: { id: post.id } });
        }
    };

    if (posts.length === 0) {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/promoted-post/create')}
                style={{ height: CARD_HEIGHT, marginBottom: 16 }}
                className="rounded-3xl overflow-hidden bg-emerald-600 items-center justify-center px-5"
            >
                <View className="flex-row items-center justify-between w-full">
                    <View className="flex-1 pr-3">
                        <Text className="text-white text-base font-black leading-tight">Shop Smarter</Text>
                        <Text className="text-white/70 text-[11px] mt-1 font-medium">
                            Promote your business today and reach thousands of customers
                        </Text>
                    </View>
                    <View className="w-10 h-10 rounded-full bg-white/15 items-center justify-center">
                        <ShoppingBag size={20} color="white" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={{ marginBottom: 16 }}>
            <FlatList
                ref={listRef}
                data={posts}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => String(item.id)}
                snapToInterval={CARD_WIDTH}
                decelerationRate="fast"
                onScrollBeginDrag={stopAutoplay}
                onMomentumScrollEnd={startAutoplay}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
                getItemLayout={(_, index) => ({ length: CARD_WIDTH, offset: CARD_WIDTH * index, index })}
                renderItem={({ item }) => {
                    const timeLabel = formatTimeRemaining(item.time_remaining_seconds);
                    return (
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => goToDestination(item)}
                            style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
                            className="rounded-3xl overflow-hidden bg-slate-200"
                        >
                            {item.image ? (
                                <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                            ) : (
                                <View className="w-full h-full items-center justify-center bg-emerald-600" />
                            )}
                            <LinearGradient
                                colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.75)']}
                                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}
                            />

                            <View className="absolute top-2 left-2 flex-row items-center bg-white/90 px-2 py-0.5 rounded-full">
                                <Sparkles size={10} color="#059669" />
                                <Text className="text-emerald-700 text-[9px] font-black uppercase tracking-widest ml-1">Sponsored</Text>
                            </View>

                            {!!timeLabel && (
                                <View className="absolute top-2 right-2 bg-black/40 px-2 py-0.5 rounded-full">
                                    <Text className="text-white text-[9px] font-bold">{timeLabel}</Text>
                                </View>
                            )}

                            <View className="absolute bottom-2 left-3 right-3">
                                <Text numberOfLines={1} className="text-white/70 text-[10px] font-semibold mb-0.5">
                                    {item.seller_name || 'Sponsored'}
                                </Text>
                                <View className="flex-row items-center justify-between">
                                    <Text numberOfLines={1} className="text-white text-sm font-black flex-1 mr-2">
                                        {item.text_content}
                                    </Text>
                                    <View className="bg-white px-2.5 py-1 rounded-full">
                                        <Text className="text-slate-900 text-[10px] font-black">View Details</Text>
                                    </View>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />

            {posts.length > 1 && (
                <View className="flex-row justify-center mt-2.5" style={{ gap: 5 }}>
                    {posts.map((_, i) => (
                        <View
                            key={i}
                            style={{
                                width: i === activeIndex ? 16 : 6,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: i === activeIndex ? '#329629' : '#D1D5DB',
                            }}
                        />
                    ))}
                </View>
            )}
        </View>
    );
}

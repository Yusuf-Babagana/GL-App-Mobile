import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { ShoppingBag, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { marketAPI } from '@/lib/marketApi';
import { useT as useTranslation } from '@/lib/useT';

interface PromotedPost {
    id: number;
    code: string;
    text_content: string;
    promotion_type: 'product' | 'standalone';
    product_id: number | null;
    product_image: string | null;
    image: string | null;
}

const PIXELS_PER_SECOND = 40;
const BANNER_HEIGHT = 64;

export default function PromotedTicker() {
    const { t } = useTranslation();
    const router = useRouter();
    const [posts, setPosts] = useState<PromotedPost[]>([]);
    const [setWidth, setSetWidth] = useState(0);
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let isMounted = true;
        marketAPI.getActivePromotedPosts().then((data) => {
            if (isMounted) setPosts(Array.isArray(data) ? data : []);
        });
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (setWidth <= 0 || posts.length === 0) return;

        let stopped = false;
        const duration = (setWidth / PIXELS_PER_SECOND) * 1000;

        const runCycle = () => {
            if (stopped) return;
            translateX.setValue(-setWidth);
            Animated.timing(translateX, {
                toValue: 0,
                duration,
                easing: Easing.linear,
                useNativeDriver: false,
            }).start(({ finished }) => {
                if (finished && !stopped) runCycle();
            });
        };
        runCycle();

        return () => {
            stopped = true;
            translateX.stopAnimation();
        };
    }, [setWidth, posts.length, translateX]);

    const goToDestination = (post: PromotedPost) => {
        if (!post.code) return;
        router.push({ pathname: '/promotion/[code]', params: { code: post.code } });
    };

    if (posts.length === 0) {
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/promoted-post/create')}
                className="rounded-3xl overflow-hidden p-6"
                style={{ backgroundColor: '#329629' }}
            >
                <View className="flex-row items-center justify-between">
                    <View className="pr-4 flex-1">
                        <Text className="text-white text-xl font-black leading-tight">
                            {t('shop_smarter')}
                        </Text>
                        <Text className="text-white/70 text-sm mt-1 font-medium">
                            {t('discover_deals')}
                        </Text>
                    </View>
                    <View className="w-20 h-20 rounded-full bg-white/15 items-center justify-center">
                        <ShoppingBag size={36} color="white" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    const renderItems = (measureFirstSet: boolean) => (
        <View
            className="flex-row items-center"
            onLayout={measureFirstSet ? (e) => setSetWidth(e.nativeEvent.layout.width) : undefined}
        >
            {posts.map((post, i) => (
                <TouchableOpacity
                    key={`${measureFirstSet ? 'a' : 'b'}-${post.id}-${i}`}
                    activeOpacity={0.8}
                    onPress={() => goToDestination(post)}
                    className="flex-row items-center"
                    style={{ flexShrink: 0 }}
                >
                    {(post.product_image || post.image) ? (
                        <Image
                            source={{ uri: post.product_image || post.image as string }}
                            style={{ width: 32, height: 32, borderRadius: 10 }}
                        />
                    ) : (
                        <View
                            style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)' }}
                            className="items-center justify-center"
                        >
                            <ShoppingBag size={15} color="#FFF" />
                        </View>
                    )}
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        className="text-white font-bold text-sm ml-2.5"
                        style={{ flexShrink: 0, maxWidth: 300 }}
                    >
                        {post.text_content}
                    </Text>
                    <View style={{ width: 1, height: 18, backgroundColor: 'rgba(255,255,255,0.35)', marginHorizontal: 20 }} />
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <View
            className="rounded-3xl overflow-hidden flex-row items-center"
            style={{ backgroundColor: '#329629', height: BANNER_HEIGHT }}
        >
            <View
                className="items-center justify-center px-4 h-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.12)', zIndex: 2 }}
            >
                <Sparkles size={16} color="#FFF" />
            </View>
            <View style={{ flex: 1, overflow: 'hidden', height: BANNER_HEIGHT }}>
                <Animated.View
                    className="flex-row items-center absolute"
                    style={{ height: BANNER_HEIGHT, left: 20, transform: [{ translateX }] }}
                >
                    {renderItems(true)}
                    {renderItems(false)}
                </Animated.View>
            </View>
        </View>
    );
}

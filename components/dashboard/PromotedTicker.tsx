import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { ShoppingBag, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { marketAPI } from '@/lib/marketApi';
import { useT as useTranslation } from '@/lib/useT';

interface PromotedPost {
    id: number;
    text_content: string;
    product_id: number;
}

const ROTATE_INTERVAL_MS = 5000;
const FADE_DURATION_MS = 250;

export default function PromotedTicker() {
    const { t } = useTranslation();
    const router = useRouter();
    const [posts, setPosts] = useState<PromotedPost[]>([]);
    const [index, setIndex] = useState(0);
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        let isMounted = true;
        marketAPI.getActivePromotedPosts().then((data) => {
            if (isMounted) setPosts(Array.isArray(data) ? data : []);
        });
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        if (posts.length < 2) return;
        const timer = setInterval(() => {
            Animated.timing(opacity, { toValue: 0, duration: FADE_DURATION_MS, useNativeDriver: true }).start(() => {
                setIndex((prev) => (prev + 1) % posts.length);
                Animated.timing(opacity, { toValue: 1, duration: FADE_DURATION_MS, useNativeDriver: true }).start();
            });
        }, ROTATE_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [posts, opacity]);

    const activePost = posts[index];

    const handlePress = () => {
        if (activePost?.product_id) {
            router.push(`/product/${activePost.product_id}`);
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={activePost ? 0.85 : 1}
            disabled={!activePost}
            onPress={handlePress}
            className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-3xl overflow-hidden"
            style={{ backgroundColor: '#329629' }}
        >
            <View className="flex-row items-center justify-between">
                <Animated.View style={{ opacity, flex: 1 }} className="pr-4">
                    <View className="flex-row items-center mb-2">
                        <Sparkles size={16} color="#FFF" />
                        <Text className="text-white/80 text-xs font-bold ml-1.5 uppercase tracking-widest">
                            {t('featured')}
                        </Text>
                    </View>
                    {activePost ? (
                        <Text className="text-white text-xl font-black leading-tight" numberOfLines={2}>
                            {activePost.text_content}
                        </Text>
                    ) : (
                        <>
                            <Text className="text-white text-xl font-black leading-tight">
                                {t('shop_smarter')}
                            </Text>
                            <Text className="text-white/70 text-sm mt-1 font-medium">
                                {t('discover_deals')}
                            </Text>
                        </>
                    )}
                </Animated.View>
                <View className="w-20 h-20 rounded-full bg-white/15 items-center justify-center">
                    <ShoppingBag size={36} color="white" />
                </View>
            </View>
        </TouchableOpacity>
    );
}

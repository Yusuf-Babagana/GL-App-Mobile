import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

const { height, width } = Dimensions.get('window');

interface Ad {
    id: number;
    name: string;
    price: number | string;
    video_url?: string;
    video?: string;
    description?: string;
    store_name?: string; // Assuming we might get this later
    [key: string]: any;
}

const getVideoUrl = (path: string) => {
    if (!path) return '';

    // If Cloudinary, inject the mobile-friendly codec automatically
    if (path.includes('cloudinary.com') && path.includes('/video/upload/')) {
        return path.replace('/video/upload/', '/video/upload/f_mp4,vc_h264,q_auto/');
    }

    // If it's a local Django path
    if (path.startsWith('/media/')) {
        return `http://172.20.10.7:8000${path}`;
    }

    return path;
};

const VideoAdItem = ({ item, isVisible }: { item: Ad; isVisible: boolean }) => {
    const router = useRouter();
    const finalVideoUrl = getVideoUrl(item.video_url || item.video || '');
    // This creates a thumbnail image from the 0-second mark of your video
    const posterUrl = finalVideoUrl.replace('/f_mp4,vc_h264', '/so_0,f_jpg');

    const [isPlaying, setIsPlaying] = useState(true);

    // Initialize the player
    const player = useVideoPlayer(finalVideoUrl, (p) => {
        p.loop = true;
        p.muted = false;
        p.pause(); // Start paused to prevent overlap
    });

    // Reset state to playing whenever the video becomes visible (like TikTok)
    useEffect(() => {
        if (isVisible) {
            setIsPlaying(true);
        }
    }, [isVisible]);

    // Handle Play/Pause based on visibility AND manual state
    useEffect(() => {
        if (isVisible && isPlaying && player && finalVideoUrl) {
            player.play();
            // console.log(`[Live] Playing video ID: ${item.id}`);
        } else if (player) {
            player.pause();
            // Reset to start if we scrolled away (so it plays from start next time)
            if (!isVisible) {
                player.currentTime = 0;
            }
        }
    }, [isVisible, isPlaying, player, finalVideoUrl]);

    const togglePlay = () => {
        setIsPlaying(prev => !prev);
    };

    if (!finalVideoUrl) {
        return (
            <View style={[styles.itemContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color="white" />
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={togglePlay}>
            <View style={styles.itemContainer}>
                <VideoView
                    style={styles.video}
                    player={player}
                    contentFit="cover"
                    nativeControls={false}
                    // Use textureView for smoother scrolling on Android
                    surfaceType="textureView"
                    posterSource={{ uri: posterUrl }}
                />

                {/* Play Icon Overlay - Visible when paused */}
                {!isPlaying && (
                    <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', zIndex: 5 }]}>
                        <Ionicons name="play" size={80} color="rgba(255, 255, 255, 0.6)" />
                    </View>
                )}

                {/* Right Sidebar - Social Actions */}
                <View style={styles.rightSidebar}>
                    <View style={styles.profileContainer}>
                        <View style={styles.avatarBorder}>
                            <Image
                                // Ensure this is a clean URI object
                                source={{ uri: `https://ui-avatars.com/api/?name=${item.store_name || 'Store'}&background=random` }}
                                style={styles.avatar}
                                contentFit="cover"
                                transition={500}
                            />
                        </View>
                        <View style={styles.followBadge}>
                            <Ionicons name="add" size={12} color="white" />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="heart" size={35} color="white" />
                        <Text style={styles.actionText}>1.2K</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="chatbubble-ellipses" size={35} color="white" />
                        <Text style={styles.actionText}>234</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="arrow-redo" size={35} color="white" />
                        <Text style={styles.actionText}>Share</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom Gradient Overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
                    style={styles.gradientOverlay}
                >
                    <View style={styles.contentContainer}>
                        <Text style={styles.storeName}>@{item.store_name || 'GL Store'}</Text>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text numberOfLines={2} style={styles.description}>
                            {item.description || 'Check out this amazing product! Limited stock available. #fashion #style'}
                        </Text>

                        <View style={styles.priceRow}>
                            <Text style={styles.currency}>₦</Text>
                            <Text style={styles.price}>{Number(item.price).toLocaleString()}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.shopNowBtn}
                            onPress={() => {
                                router.push(`/product/${item.id}`);
                            }}
                        >
                            <Ionicons name="bag-handle" size={20} color="white" />
                            <Text style={styles.shopNowText}>Shop Now</Text>
                            <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default function AdsScreen() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    // Pagination State
    const [page, setPage] = useState(1);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loadAds = async (pageNum: number) => {
        // 1. CRITICAL: Stop if already loading OR if we know there's no more data
        if (loadingMore || (!hasMore && pageNum > 1)) return;

        try {
            setLoadingMore(true);
            const data = await marketAPI.getVideoAds(pageNum);

            // 2. LOGIC FIX: If the server returns 0 items, or fewer items than a full page
            // (usually 10), we know we have reached the end.
            if (!data || data.length === 0) {
                setHasMore(false);
                console.log("[LiveFeed] No more ads to fetch.");
                return;
            }

            setAds(prev => {
                if (pageNum === 1) return data;

                // 3. DUPLICATE CHECK: Prevent adding the same video twice
                const existingIds = new Set(prev.map(item => item.id));
                const newItems = data.filter((item: Ad) => !existingIds.has(item.id));

                // If after filtering all items are duplicates, stop fetching
                if (newItems.length === 0 && data.length > 0) {
                    setHasMore(false);
                }

                return [...prev, ...newItems];
            });

        } catch (e) {
            console.error("Failed to load ads", e);
            setHasMore(false); // Stop loop on error
        } finally {
            setLoadingMore(false);
        }
    };

    // Initial Load
    useEffect(() => {
        loadAds(1);
    }, []);

    const fetchMoreAds = () => {
        if (!loadingMore && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadAds(nextPage);
        }
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            setActiveIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 80,
        minimumViewTime: 100, // Wait 100ms to avoid flickering
    }).current;

    return (
        <View style={styles.container}>
            <FlatList
                data={ads}
                // Yusuf, make sure each item has a unique ID from Django. 
                // If IDs are missing, use index as a last resort, but ID is better.
                keyExtractor={(item, index) => item.id?.toString() || index.toString()}
                renderItem={({ item, index }) => (
                    <VideoAdItem
                        item={item}
                        // Only play if the index strictly matches activeIndex
                        isVisible={index === activeIndex}
                    />
                )}
                pagingEnabled={true}
                ListEmptyComponent={
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', height: height }}>
                        <Ionicons name="videocam-off-outline" size={50} color="gray" />
                        <Text style={{ color: 'gray', marginTop: 10 }}>No live videos available yet.</Text>
                        <TouchableOpacity onPress={() => loadAds(1)} style={{ marginTop: 20, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}>
                            <Text style={{ color: 'white' }}>Refresh Feed</Text>
                        </TouchableOpacity>
                    </View>
                }
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                snapToInterval={height}
                snapToAlignment="start"
                decelerationRate="fast"
                showsVerticalScrollIndicator={false}

                // --- Infinite Scroll Props ---
                onEndReached={fetchMoreAds}
                onEndReachedThreshold={0.1} // Trigger when 10% from the bottom
                ListFooterComponent={() =>
                    loadingMore ? (
                        <View style={{ height: 100, justifyContent: 'center' }}>
                            <ActivityIndicator color="white" />
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'black' },
    itemContainer: { width: width, height: height, position: 'relative' },
    video: { width: '100%', height: '100%' },

    // Right Sidebar
    rightSidebar: {
        position: 'absolute',
        right: 10,
        bottom: 180, // Moved up to make room for bottom content
        alignItems: 'center',
        zIndex: 10,
    },
    profileContainer: {
        marginBottom: 20,
        position: 'relative',
    },
    avatarBorder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
    },
    followBadge: {
        position: 'absolute',
        bottom: -8,
        left: 17, // center horizontally relative to avatar (50/2 - 16/2)
        backgroundColor: '#FF3B30',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButton: {
        alignItems: 'center',
        marginBottom: 20,
    },
    actionText: {
        color: 'white',
        marginTop: 5,
        fontSize: 13,
        fontWeight: '600',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },

    // Bottom Content
    gradientOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingBottom: 20, // Adjust for tab bar if needed
        paddingTop: 80,
    },
    contentContainer: {
        marginBottom: 60, // Space effectively for bottom tab bar
    },
    storeName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    productName: {
        color: 'white',
        fontSize: 20,
        fontWeight: '400',
        marginBottom: 8,
    },
    description: {
        color: '#e0e0e0',
        fontSize: 14,
        marginBottom: 12,
        lineHeight: 20,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 15,
    },
    currency: {
        color: '#10B981', // Emerald green
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 2,
    },
    price: {
        color: '#10B981',
        fontSize: 28,
        fontWeight: '800',
    },
    shopNowBtn: {
        backgroundColor: '#F59E0B', // Amber/Gold color
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignSelf: 'flex-start',
        width: '100%', // Full width on mobile feels good for CTA
    },
    shopNowText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});
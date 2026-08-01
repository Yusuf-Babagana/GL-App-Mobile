import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { marketAPI } from "@/lib/marketApi";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

export default function PromotedAdDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [ad, setAd] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    marketAPI.getPromotedPostDetail(Number(id))
      .then(setAd)
      .catch(console.log)
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!ad) return <View className="flex-1 bg-white" />;

  const images: string[] = ad.images && ad.images.length > 0 ? ad.images : (ad.image ? [ad.image] : []);
  const showWhatsapp = ['whatsapp', 'both'].includes(ad.contact_preference) && ad.whatsapp_number;
  const showPhone = ['phone', 'both'].includes(ad.contact_preference) && ad.phone_number;

  const openWhatsapp = () => Linking.openURL(buildWhatsAppLink(ad.whatsapp_number));
  const callSeller = () => Linking.openURL(`tel:${ad.phone_number}`);

  return (
    <ScreenWrapper safeAreaTop={false}>
      <View className="absolute left-6 z-10" style={{ top: insets.top + 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm backdrop-blur-md border border-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <View className="absolute z-10 bg-emerald-600 px-3 py-1 rounded-full" style={{ top: insets.top + 12, right: 24 }}>
        <Text className="text-white text-[10px] font-black uppercase tracking-widest">Sponsored</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }}>
        <View className="w-full h-96 bg-gray-100 relative">
          {images.length > 0 ? (
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              windowSize={3}
              removeClippedSubviews
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={{ width, height: 384 }} contentFit="cover" />
              )}
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Ionicons name="image-outline" size={48} color="#CBD5E1" />
            </View>
          )}
          <View className="absolute -bottom-1 w-full h-6 bg-white rounded-t-3xl pointer-events-none" />
        </View>

        <View className="px-6 pt-2">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <Ionicons name="person-circle-outline" size={16} color="#6B7280" />
              <Text className="text-gray-500 font-medium ml-2" numberOfLines={1}>{ad.seller_name || 'Seller'}</Text>
            </View>
            {!!ad.location && (
              <View className="flex-row items-center">
                <Ionicons name="location" size={12} color="#9CA3AF" />
                <Text className="text-gray-500 text-xs ml-1">{ad.location}</Text>
              </View>
            )}
          </View>

          <Text className="text-3xl font-bold text-gray-900 mb-2">{ad.title}</Text>
          {ad.price != null && (
            <Text className="text-[#1DB954] text-2xl font-bold mb-6">₦{Number(ad.price).toLocaleString()}</Text>
          )}

          <View className="h-[1px] bg-gray-100 w-full mb-6" />

          <Text className="text-gray-900 font-bold text-lg mb-2">Sponsored Message</Text>
          <Text className="text-gray-500 leading-6 text-base mb-6">{ad.text_content}</Text>

          {!!ad.description && (
            <>
              <Text className="text-gray-900 font-bold text-lg mb-2">Description</Text>
              <Text className="text-gray-500 leading-6 text-base">{ad.description}</Text>
            </>
          )}
        </View>
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <View className="flex-row items-center gap-3">
          {showPhone && (
            <TouchableOpacity
              onPress={callSeller}
              activeOpacity={0.7}
              className={`${showWhatsapp ? 'flex-1' : 'w-full'} h-14 rounded-2xl items-center justify-center flex-row bg-slate-900`}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text className="text-white font-black text-base ml-2">Call</Text>
            </TouchableOpacity>
          )}
          {showWhatsapp && (
            <TouchableOpacity
              onPress={openWhatsapp}
              activeOpacity={0.7}
              className={`${showPhone ? 'flex-1' : 'w-full'} h-14 rounded-2xl items-center justify-center flex-row`}
              style={{ backgroundColor: '#25D366' }}
            >
              <Ionicons name="logo-whatsapp" size={20} color="white" />
              <Text className="text-white font-black text-base ml-2">WhatsApp</Text>
            </TouchableOpacity>
          )}
          {!showPhone && !showWhatsapp && (
            <View className="w-full h-14 rounded-2xl items-center justify-center bg-gray-100">
              <Text className="text-gray-500 font-bold text-sm">Contact details unavailable</Text>
            </View>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

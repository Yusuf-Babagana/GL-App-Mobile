import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Animated } from 'react-native';
import { Search, ShoppingBag } from 'lucide-react-native';
import { ProductCard } from '@/components/dashboard/ProductCard';
import { marketAPI } from '@/lib/marketApi';
import { useFocusEffect, useRouter } from 'expo-router';
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useT as useTranslation } from '@/lib/useT';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import KYCBanner from '@/components/KYCBanner';
import PromotionBanner from '@/components/dashboard/PromotionBanner';
import { useAuth } from '@/context/AuthContext';
import { Megaphone } from 'lucide-react-native';
import { ErrorState } from '@/components/ErrorState';

const SkeletonCard = () => {
  const opacity = new Animated.Value(0.3);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);
  return (
    <View className="w-[48%] mb-5 bg-white rounded-2xl p-3" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
      <Animated.View style={{ opacity }} className="h-36 w-full bg-gray-100 rounded-xl mb-3" />
      <Animated.View style={{ opacity }} className="h-3 w-3/4 bg-gray-100 rounded-full mb-2" />
      <Animated.View style={{ opacity }} className="h-3 w-1/2 bg-gray-100 rounded-full" />
    </View>
  );
};

export default function ExploreScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { userRole, isSignedIn } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setLoadError(false);
      const prodData = await marketAPI.getProducts();
      const allProducts: any[] = prodData.results || prodData;
      setProducts(allProducts.filter((p: any) => !p.video_ad_url));
    } catch (e) {
      setLoadError(true);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const renderProduct = useCallback(({ item }: { item: any }) => (
    <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
  ), [router]);

  const keyExtractor = useCallback(
    (item: any, index: number) => item?.id?.toString() ?? `item-${index}`,
    []
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p: any) =>
      p.name?.toLowerCase().includes(query) ||
      p.category_name?.toLowerCase().includes(query) ||
      p.shop_name?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  return (
    <ScreenWrapper>
      <View className="px-5 pt-4 pb-2">
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3.5 border-2 border-gray-100" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 }}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            placeholder={t('search_products')}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-sm font-semibold text-gray-900"
          />
        </View>
      </View>

      <View className="px-5 mb-3">
        <PromotionBanner />
        {isSignedIn && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/promoted-post/create')}
            className="flex-row items-center justify-center mt-3 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl"
          >
            <Megaphone size={14} color="#B45309" />
            <Text className="text-amber-700 font-bold text-xs ml-1.5">
              {userRole === 'seller' ? 'Promote Your Product' : 'Advertise Something to Sell'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="px-5 mb-3">
        <LanguageSwitcher />
      </View>

      <KYCBanner />

      {isLoading ? (
        <View className="px-5 flex-row flex-wrap justify-between">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      ) : loadError ? (
        <ErrorState
          title="Couldn't load products"
          description="Check your connection and try again."
          onRetry={fetchData}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={
            <View className="items-center justify-center mt-16">
              <View className="bg-gray-50 p-6 rounded-full mb-4">
                <ShoppingBag size={48} color="#CBD5E1" />
              </View>
              <Text className="text-gray-400 font-bold text-lg">{t('no_products')}</Text>
              <Text className="text-gray-300 text-sm mt-1">{t('check_later')}</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
}

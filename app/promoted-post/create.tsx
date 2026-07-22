import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Megaphone, Package, CheckCircle2 } from 'lucide-react-native';
import { marketAPI } from '@/lib/marketApi';
import * as Haptics from 'expo-haptics';

type DurationType = '24h' | '3days' | '1wk';
type Tier = { value: DurationType; label: string; price: number };

const DEFAULT_TIERS: Tier[] = [
  { value: '24h', label: '24 Hours', price: 1000 },
  { value: '3days', label: '3 Days', price: 2000 },
  { value: '1wk', label: '1 Week', price: 4000 },
];

const MAX_CHARS = 300;

function getImageUrl(item: any): string | null {
  const path = item?.image || item?.images?.[0]?.image;
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://glappbackend.pythonanywhere.com/media/${path}`;
}

export default function CreatePromotedPost() {
  const router = useRouter();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [text, setText] = useState('');
  const [duration, setDuration] = useState<DurationType>('24h');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await marketAPI.get('/finance/wallet/');
        setAvailableBalance(Number(res.data.available_balance ?? res.data.balance ?? 0));
      } catch {
        setAvailableBalance(0);
      } finally {
        setLoadingBalance(false);
      }
    };
    fetchBalance();

    const fetchPricing = async () => {
      const data = await marketAPI.getPromotedPostPricing();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: Tier[] = data.map((p: any) => ({
          value: p.duration_type,
          label: p.label,
          price: Number(p.price),
        }));
        setTiers(mapped);
      }
    };
    fetchPricing();

    const fetchProducts = async () => {
      try {
        const data = await marketAPI.getSellerProducts();
        const list = data.results || data;
        setProducts(Array.isArray(list) ? list : []);
      } catch {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const selectedTier = useMemo(
    () => tiers.find((t) => t.value === duration) || tiers[0],
    [tiers, duration]
  );
  const exceedsBalance = selectedTier.price > availableBalance;
  const canSubmit = text.trim().length > 0 && !!selectedProductId && !exceedsBalance && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit || !selectedProductId) return;
    setSubmitting(true);
    try {
      await marketAPI.createPromotedPost({
        text_content: text.trim(),
        product: selectedProductId,
        duration_type: duration,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success 🎉', 'Your promoted post is now live.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const data = error.response?.data;
      const msg =
        (typeof data === 'string' ? data : data?.error || data?.detail || data?.message) ||
        'Could not create your promoted post. Please try again.';
      Alert.alert('Promotion Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const noProducts = !loadingProducts && products.length === 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} className="bg-slate-100 p-2 rounded-2xl mr-3">
          <ChevronLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-black text-slate-900 tracking-tight mr-10">Promote a Product</Text>
      </View>

      {noProducts ? (
        <View className="flex-1 items-center justify-center px-10">
          <View className="bg-gray-100 w-16 h-16 rounded-full items-center justify-center mb-4">
            <Package size={28} color="#9CA3AF" />
          </View>
          <Text className="text-slate-900 font-black text-lg text-center mb-2">No products to promote</Text>
          <Text className="text-gray-500 text-sm text-center mb-6">
            You need at least one listed product before you can create a promoted post.
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/merchant/add-product')}
            className="bg-emerald-600 rounded-2xl px-6 py-3.5"
          >
            <Text className="text-white font-black text-base">Add a Product</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-emerald-50/70 border border-emerald-100/40 p-4 rounded-3xl mb-6">
            <Text className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1">Wallet Balance</Text>
            {loadingBalance ? (
              <ActivityIndicator size="small" color="#059669" />
            ) : (
              <Text className="text-emerald-950 text-xl font-black tracking-tight">₦{availableBalance.toLocaleString()}</Text>
            )}
          </View>

          <Text className="text-slate-900 font-bold mb-4 uppercase tracking-wider text-xs ml-1">1. Your Message</Text>
          <View className="bg-white rounded-3xl p-5 border border-gray-100 mb-6">
            <View className="flex-row items-start bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-2">
              <Megaphone size={20} color="#9CA3AF" style={{ marginTop: 2 }} />
              <TextInput
                className="flex-1 ml-3 text-slate-900 font-semibold text-base"
                placeholder="What do you want everyone to see?"
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={MAX_CHARS}
                value={text}
                onChangeText={setText}
                style={{ minHeight: 70, textAlignVertical: 'top' }}
              />
            </View>
            <Text className="text-gray-400 text-xs text-right mr-1">{text.length}/{MAX_CHARS}</Text>
          </View>

          <Text className="text-slate-900 font-bold mb-4 uppercase tracking-wider text-xs ml-1">2. Product to Promote</Text>
          {loadingProducts ? (
            <View className="items-center py-6 mb-6">
              <ActivityIndicator color="#329629" />
            </View>
          ) : (
            <View className="bg-white rounded-3xl border border-gray-100 overflow-hidden mb-6" style={{ maxHeight: 300 }}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {products.map((product, i) => {
                  const selected = selectedProductId === product.id;
                  const imageUrl = getImageUrl(product);
                  return (
                    <TouchableOpacity
                      key={product.id}
                      activeOpacity={0.7}
                      onPress={() => setSelectedProductId(product.id)}
                      style={{
                        backgroundColor: selected ? 'rgba(74, 222, 128, 0.07)' : '#FFFFFF',
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderBottomWidth: i === products.length - 1 ? 0 : 1,
                        borderBottomColor: '#F1F5F9',
                      }}
                    >
                      {imageUrl ? (
                        <Image source={{ uri: imageUrl }} className="w-12 h-12 rounded-xl mr-3" />
                      ) : (
                        <View className="w-12 h-12 rounded-xl bg-gray-100 items-center justify-center mr-3">
                          <Package size={18} color="#9CA3AF" />
                        </View>
                      )}
                      <View className="flex-1">
                        <Text
                          numberOfLines={1}
                          style={{ fontWeight: '700', color: selected ? '#15803d' : '#1F2937' }}
                        >
                          {product.name}
                        </Text>
                        <Text className="text-gray-500 text-xs font-semibold mt-0.5">
                          ₦{Number(product.price || 0).toLocaleString()}
                        </Text>
                      </View>
                      {selected && <CheckCircle2 color="#10B981" size={20} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          <Text className="text-slate-900 font-bold mb-4 uppercase tracking-wider text-xs ml-1">3. Choose Duration</Text>
          <View className="mb-6">
            {tiers.map((tier) => {
              const selected = tier.value === duration;
              const disabled = tier.price > availableBalance;
              return (
                <TouchableOpacity
                  key={tier.value}
                  activeOpacity={0.7}
                  disabled={disabled}
                  onPress={() => setDuration(tier.value)}
                  className={`flex-row items-center justify-between p-4 rounded-2xl border mb-3 ${
                    selected ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-100'
                  } ${disabled ? 'opacity-40' : ''}`}
                >
                  <View>
                    <Text className="text-slate-900 font-black text-base">{tier.label}</Text>
                    <Text className="text-gray-500 text-xs font-semibold mt-0.5">₦{tier.price.toLocaleString()}</Text>
                  </View>
                  {selected ? (
                    <CheckCircle2 size={22} color="#10B981" />
                  ) : (
                    <View className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {exceedsBalance && (
            <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
              <Text className="text-red-700 font-bold text-sm">
                Insufficient wallet balance for this duration. Top up your wallet to continue.
              </Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSubmit}
            disabled={!canSubmit}
            className={`rounded-[25px] h-14 items-center justify-center ${!canSubmit ? 'bg-gray-300' : 'bg-emerald-600'}`}
          >
            {submitting ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" />
                <Text className="text-white font-black text-sm ml-2">Publishing...</Text>
              </View>
            ) : (
              <Text className={`font-black text-lg ${!canSubmit ? 'text-gray-500' : 'text-white'}`}>
                Pay ₦{selectedTier.price.toLocaleString()} & Go Live
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

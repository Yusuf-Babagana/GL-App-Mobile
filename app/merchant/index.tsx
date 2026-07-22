import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Alert, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { marketAPI } from '@/lib/marketApi';

function getImageUrl(item: any): string | null {
  const path = item.image || item.images?.[0]?.image;
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `https://glappbackend.pythonanywhere.com/media/${path}`;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function MerchantStudioDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appStatus, setAppStatus] = useState<'approved' | 'pending' | 'none'>('none');
  const [shopInfo, setShopInfo] = useState<any>({ name: 'Loading Store...', role: 'Shop Owner' });
  const [dashboardStats, setDashboardStats] = useState<any>({
    total_sales: '₦0',
    total_orders: '0',
    products_sold: '0',
    new_customers: '0',
    top_products: []
  });
  const [wallet, setWallet] = useState<{ balance: number; escrow_balance: number }>({
    balance: 0,
    escrow_balance: 0
  });
  const [products, setProducts] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [])
  );

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const statusRes = await marketAPI.get('/market/shop/my-status/');
      const backendStatus = statusRes.data.status;

      if (backendStatus === 'pending') {
        setAppStatus('pending');
        return;
      }

      if (backendStatus === 'approved') {
        setAppStatus('approved');
        const [analyticsRes, productsRes, ordersRes, walletRes] = await Promise.all([
          marketAPI.get('/market/merchant/analytics/'),
          marketAPI.get('/market/seller/products/').catch(() => ({ data: [] })),
          marketAPI.getSellerOrders().catch(() => []),
          marketAPI.get('/finance/wallet/').then(r => r.data).catch(() => ({ available_balance: 0, locked_balance: 0 }))
        ]);
        setDashboardStats(analyticsRes.data.stats);
        setShopInfo({ name: analyticsRes.data.shop_name, role: 'Shop Owner' });
        setProducts(productsRes.data.results || productsRes.data);
        setOrders(ordersRes.results || ordersRes.data || ordersRes);
        setWallet({
          balance: Number(walletRes.available_balance ?? 0),
          escrow_balance: Number(walletRes.locked_balance ?? 0)
        });
        return;
      }

      router.replace('/(tabs)/more');
    } catch (error) {
      console.error("Network sync fault:", error);
      router.replace('/(tabs)/more');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id: number) => {
    Alert.alert("Delete Product", "This action is permanent. Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDelete(id),
      },
    ]);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await marketAPI.delete(`/market/seller/products/${id}/delete/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      Alert.alert("Deleted", "Product removed from inventory.");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Could not delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#F8FAFC] justify-center items-center">
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        <ActivityIndicator size="large" color="#329629" />
        <Text className="text-gray-500 font-bold text-xs mt-3">Verifying Merchant Status...</Text>
      </SafeAreaView>
    );
  }

  if (appStatus === 'pending') {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center px-8">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Stack.Screen options={{ headerShown: false }} />
        <View className="w-24 h-24 bg-amber-50 rounded-full items-center justify-center mb-6 border border-amber-100">
          <Text className="text-4xl">{'⏳'}</Text>
        </View>
        <Text className="text-slate-900 text-2xl font-black text-center tracking-tight">Application Under Review</Text>
        <Text className="text-gray-500 text-sm font-medium text-center mt-2 leading-5 px-4">
          Thank you for setting up your GLAPP Shop! Our administrators are currently reviewing your documents and trade credentials.
        </Text>
        <View className="bg-slate-50 border border-slate-100 rounded-2xl p-4 w-full mt-6">
          <Text className="text-blue-600 font-bold text-xs text-center uppercase tracking-wider">
            Verification Queue Status: Pending Approval
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/more')} className="w-full bg-slate-900 py-4 rounded-2xl items-center mt-10">
          <Text className="text-white font-bold text-sm">Return to Main App</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row justify-between items-center px-5 py-3 bg-white border-b border-slate-100">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/(tabs)/more')} className="bg-slate-100 p-3 rounded-2xl mr-3">
            <Text className="font-bold text-slate-700 text-base">{'<'}</Text>
          </TouchableOpacity>
          <View className="w-12 h-12 rounded-full bg-primary-container items-center justify-center mr-3">
            <Text className="text-xl">{'🏪'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-slate-900 text-lg font-bold tracking-tight" numberOfLines={1}>{shopInfo.name}</Text>
            <Text className="text-gray-500 text-xs font-semibold">{shopInfo.role}</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/merchant/edit-store')}
          className="bg-primary/10 p-3 rounded-2xl"
        >
          <Text className="text-primary font-black text-xs">Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row gap-3 mb-6 mt-4">
          <View className="flex-1 bg-emerald-50/70 border border-emerald-100/40 p-4 rounded-3xl">
            <Text className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1">Withdrawable Balance</Text>
            <Text className="text-emerald-950 text-2xl font-black tracking-tight">₦{wallet.balance.toLocaleString()}</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/merchant/withdraw')}
              className="bg-emerald-600 px-4 py-2 rounded-xl mt-3 items-center"
            >
              <Text className="text-white font-bold text-xs">Withdraw</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-1 bg-amber-50/70 border border-amber-100/40 p-4 rounded-3xl">
            <Text className="text-amber-600 text-[10px] font-black uppercase tracking-widest mb-1">In-Transit</Text>
            <Text className="text-amber-950 text-2xl font-black tracking-tight">₦{wallet.escrow_balance.toLocaleString()}</Text>
            <View className="bg-amber-100/60 px-2 py-1 rounded-lg mt-3 items-center">
              <Text className="text-amber-700 text-[10px] font-bold">Pending Settlement</Text>
            </View>
          </View>
        </View>

        <View className="flex-row flex-wrap justify-between mb-6">
          <View className="w-[48%] bg-primary-container p-4 rounded-3xl mb-3 border border-primary/20">
            <Text className="text-primary-dark text-2xl font-black tracking-tight">{dashboardStats.total_sales}</Text>
            <Text className="text-primary-dark/60 text-xs font-bold mt-1">Total Sales</Text>
          </View>
          <View className="w-[48%] bg-amber-50 p-4 rounded-3xl mb-3 border border-amber-200/40">
            <Text className="text-amber-700 text-2xl font-black tracking-tight">{dashboardStats.total_orders}</Text>
            <Text className="text-amber-600/60 text-xs font-bold mt-1">Total Orders</Text>
          </View>
          <View className="w-[48%] bg-emerald-50 p-4 rounded-3xl mb-3 border border-emerald-200/40">
            <Text className="text-emerald-700 text-2xl font-black tracking-tight">{dashboardStats.products_sold}</Text>
            <Text className="text-emerald-600/60 text-xs font-bold mt-1">Products Sold</Text>
          </View>
          <View className="w-[48%] bg-purple-50 p-4 rounded-3xl mb-3 border border-purple-200/40">
            <Text className="text-purple-700 text-2xl font-black tracking-tight">{dashboardStats.new_customers}</Text>
            <Text className="text-purple-600/60 text-xs font-bold mt-1">New Customers</Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/merchant/add-product')}
            className="flex-1 bg-primary p-4 rounded-2xl items-center"
          >
            <Text className="text-white font-black text-sm">Add Product</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/merchant')}
            className="flex-1 bg-slate-900 p-4 rounded-2xl items-center"
          >
            <Text className="text-white font-black text-sm">Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/promoted-post/create')}
            className="flex-1 bg-amber-500 p-4 rounded-2xl items-center"
          >
            <Text className="text-white font-black text-sm">Promote</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between items-end mb-4">
          <View>
            <Text className="text-slate-900 text-xl font-black tracking-tight">Orders Management Deck</Text>
            <Text className="text-gray-500 text-xs font-semibold mt-0.5">{orders.length} incoming purchase tickets</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/orders')}>
            <Text className="text-primary font-bold text-xs">View All</Text>
          </TouchableOpacity>
        </View>

        {orders.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center mb-6 border border-slate-100">
            <Text className="text-4xl mb-3">{'📋'}</Text>
            <Text className="text-slate-900 text-base font-bold text-center">No incoming orders yet</Text>
            <Text className="text-gray-500 text-xs font-medium text-center mt-1">Customer purchase tickets will appear here once orders start coming in.</Text>
          </View>
        ) : (
          <View className="gap-3 mb-6">
            {orders.slice(0, 5).map((order: any) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => router.push(`/orders/${order.id}?role=seller`)}
                activeOpacity={0.7}
                className="bg-white p-5 rounded-3xl border border-slate-100"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="font-black text-slate-900 text-base">Order #{order.id}</Text>
                  <View className={`px-3 py-1 rounded-full ${order.delivery_status === 'delivered' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <Text className={`text-[10px] font-black uppercase tracking-tighter ${order.delivery_status === 'delivered' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {STATUS_LABELS[order.delivery_status] || order.delivery_status?.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-end border-t border-slate-100 pt-3">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-500 text-[10px] font-black uppercase mb-1">Customer</Text>
                    <Text className="text-slate-900 font-bold text-sm">{order.buyer_name || 'Guest'}</Text>
                    {order.buyer_phone && (
                      <TouchableOpacity
                        onPress={() => Linking.openURL(`tel:${order.buyer_phone}`)}
                        className="flex-row items-center mt-1"
                      >
                        <Text className="text-blue-700 text-xs font-medium">{order.buyer_phone}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-500 text-[10px] font-black uppercase mb-1">Total</Text>
                    <Text className="text-primary font-black text-lg">₦{Number(order.total_price).toLocaleString()}</Text>
                  </View>
                </View>
                {order.items?.length > 0 && (
                  <View className="flex-row flex-wrap gap-1.5 mt-3">
                    {order.items.slice(0, 3).map((item: any, i: number) => (
                      <View key={i} className="bg-slate-50 px-2.5 py-1 rounded-lg">
                        <Text className="text-gray-500 text-[10px] font-bold" numberOfLines={1}>{item.product_name}</Text>
                      </View>
                    ))}
                    {order.items.length > 3 && (
                      <View className="bg-slate-50 px-2.5 py-1 rounded-lg">
                        <Text className="text-gray-500 text-[10px] font-bold">+{order.items.length - 3} more</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
            {orders.length > 5 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/orders')}
                className="items-center py-3"
              >
                <Text className="text-primary font-bold text-xs">Show all {orders.length} orders →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View className="flex-row justify-between items-end mb-4">
          <View>
            <Text className="text-slate-900 text-xl font-black tracking-tight">Product Inventory</Text>
            <Text className="text-gray-500 text-xs font-semibold mt-0.5">{products.length} items listed</Text>
          </View>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/merchant/add-product')}>
            <Text className="text-primary font-bold text-xs">+ Add New</Text>
          </TouchableOpacity>
        </View>

        {products.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center mb-6 border border-slate-100">
            <Text className="text-4xl mb-3">{'📦'}</Text>
            <Text className="text-slate-900 text-base font-bold text-center">No products yet</Text>
            <Text className="text-gray-500 text-xs font-medium text-center mt-1">Start by adding your first inventory item.</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/merchant/add-product')}
              className="bg-primary mt-5 px-8 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold text-sm">Add Product</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-4 mb-6">
            {products.map((item: any) => {
              const imgUri = getImageUrl(item);
              return (
                <View key={item.id} className="bg-white p-4 rounded-3xl flex-row border border-slate-100">
                  <View className="w-20 h-20 rounded-2xl bg-primary-container items-center justify-center overflow-hidden">
                    {imgUri ? (
                      <Image source={{ uri: imgUri }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Text className="text-2xl">{'📦'}</Text>
                    )}
                  </View>
                  <View className="flex-1 ml-4 justify-between">
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1 mr-2">
                        <Text className="text-slate-900 font-bold text-base" numberOfLines={1}>{item.name}</Text>
                        <Text className="text-primary font-black text-base">₦{Number(item.price).toLocaleString()}</Text>
                      </View>
                      <View className="bg-slate-50 px-2 py-1 rounded-lg">
                        <Text className="text-[10px] font-black text-slate-500 uppercase">{item.stock ?? 0} left</Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2 mt-2">
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => router.push(`/merchant/edit-product/${item.id}` as any)}
                        className="bg-primary/10 px-4 py-2 rounded-xl"
                      >
                        <Text className="text-primary font-bold text-xs">Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => confirmDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="bg-red-50 px-4 py-2 rounded-xl"
                      >
                        {deletingId === item.id ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Text className="text-red-600 font-bold text-xs">Delete</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text className="text-slate-900 text-xl font-black tracking-tight">Top Products</Text>
        <Text className="text-gray-500 text-xs font-bold mb-4">Most sold products</Text>

        {dashboardStats.top_products.length === 0 ? (
          <View className="bg-white rounded-3xl p-8 items-center mb-6 border border-slate-100">
            <Text className="text-3xl mb-3">{'📊'}</Text>
            <Text className="text-slate-900 text-base font-bold text-center">No sales data yet</Text>
            <Text className="text-gray-500 text-xs font-medium text-center mt-1">Sales will appear here once customers start purchasing.</Text>
          </View>
        ) : (
          dashboardStats.top_products.map((prod: any, idx: number) => (
            <View key={idx} className="mb-4 bg-white p-4 rounded-2xl border border-slate-100">
              <View className="flex-row justify-between items-baseline">
                <Text className="text-slate-900 font-bold text-sm flex-1 pr-2" numberOfLines={1}>{prod.name}</Text>
                <Text className="text-primary-dark font-black text-xs">{prod.sales_count} Sold</Text>
              </View>
              <View className="w-full h-1.5 bg-slate-200 rounded-full mt-2 overflow-hidden">
                <View className="h-full bg-primary rounded-full" style={{ width: `${Math.min(prod.percentage || 20, 100)}%` }} />
              </View>
            </View>
          ))
        )}

        <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/merchant/add-product')} className="w-full bg-primary py-4 rounded-2xl items-center mb-10 mt-4">
          <Text className="text-white font-black text-sm">Add New Store Inventory</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

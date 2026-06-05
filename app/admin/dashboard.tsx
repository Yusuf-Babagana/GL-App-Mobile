// app/admin/dashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  Dimensions, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Stack } from 'expo-router';
import { marketAPI } from '../../lib/marketApi';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'shops' | 'users'>('shops');
  const [metrics, setMetrics] = useState<any>({});
  const [pendingShops, setPendingShops] = useState([]);
  const [systemUsers, setSystemUsers] = useState([]);

  const { width } = Dimensions.get('window');
  const isLargeScreen = width > 600;
  const gridCardWidth = isLargeScreen ? 'w-[23%]' : 'w-[48%]';

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await marketAPI.get('/market/admin/overview/');
      // Merged robust fallback to ensure metrics never throws undefined errors
      setMetrics(res.data.metrics || {
        total_revenue: 'N0.00',
        total_users: 0,
        sellers: 0,
        buyers: 0,
        total_products: 0
      });
      setPendingShops(res.data.pending_shops || []);
      setSystemUsers(res.data.users || []);
    } catch (err) {
      Alert.alert("System Error", "Failed to retrieve management sync states.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveShop = async (shopId: string) => {
    try {
      const res = await marketAPI.post(`/api/market/admin/approve-shop/${shopId}/`);
      if (res.data.status === 'success') {
        Alert.alert("Success", "Shop profile activated.");
        fetchAdminData();
      }
    } catch (err) {
      Alert.alert("Action Failed", "Could not complete activation.");
    }
  };

  const handleModifyUserRole = (userId: number, currentRole: string, currentStaff: boolean) => {
    Alert.alert(
      "Manage Permissions",
      "Select a target role update assignment for this account profile:",
      [
        {
          text: "Promote to Admin",
          onPress: () => updateUserRoleOnServer(userId, 'admin')
        },
        {
          text: currentRole === 'seller' ? "Demote to Buyer" : "Promote to Seller",
          onPress: () => updateUserRoleOnServer(userId, currentRole === 'seller' ? 'buyer' : 'seller')
        },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const updateUserRoleOnServer = async (userId: number, targetRole: 'admin' | 'seller' | 'buyer') => {
    try {
      setLoading(true);
      const res = await marketAPI.post(`/api/market/admin/update-user-role/${userId}/`, { role: targetRole });
      if (res.data.status === 'success') {
        Alert.alert("Updated", "User system permissions adjusted.");
        fetchAdminData();
      }
    } catch (err) {
      Alert.alert("Update Failed", "Server rejected role modification request.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <Stack.Screen options={{ headerShown: true, title: "System HQ", headerShadowVisible: false }} />

      <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
        
        {/* Global Financial Highlight Card */}
        <View className="bg-indigo-900 p-6 rounded-3xl shadow-md shadow-indigo-900/20 mb-4 mt-2 flex-row justify-between items-center">
          <View>
            <Text className="text-indigo-200 text-xs font-bold uppercase tracking-wider">Gross Platform Revenue</Text>
            <Text className="text-3xl font-black text-white mt-1">{metrics.total_revenue || 'N0.00'}</Text>
          </View>
          <View className="bg-white/10 p-3 rounded-2xl"><Text className="text-xl">💰</Text></View>
        </View>

        {/* Analytics 4-Column Responsive Analytics Stat Grid */}
        <View className="flex-row flex-wrap justify-between mb-4">
          <StatMiniCard count={metrics.total_users} title="Total Members" icon="👥" tailWidth={gridCardWidth} />
          <StatMiniCard count={metrics.sellers} title="Active Sellers" icon="🏬" tailWidth={gridCardWidth} />
          <StatMiniCard count={metrics.buyers} title="Active Buyers" icon="🛍️" tailWidth={gridCardWidth} />
          <StatMiniCard count={metrics.total_products} title="Items Listed" icon="📦" tailWidth={gridCardWidth} />
        </View>

        {/* List Selector Toggles */}
        <View className="flex-row bg-gray-200/80 rounded-2xl p-1.5 mb-5">
          <TouchableOpacity onPress={() => setViewMode('shops')} className={`flex-1 py-3 rounded-xl items-center ${viewMode === 'shops' ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`font-bold text-sm ${viewMode === 'shops' ? 'text-indigo-600' : 'text-gray-600'}`}>Pending Shops ({pendingShops.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('users')} className={`flex-1 py-3 rounded-xl items-center ${viewMode === 'users' ? 'bg-white shadow-sm' : ''}`}>
            <Text className={`font-bold text-sm ${viewMode === 'users' ? 'text-indigo-600' : 'text-gray-600'}`}>User Base Directory</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic List Execution Engine */}
        {viewMode === 'shops' ? (
          pendingShops.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm items-center"><Text className="text-gray-400 text-sm">All shops verified! Queue empty.</Text></View>
          ) : (
            pendingShops.map((shop: any) => (
              <View key={shop.id} className="bg-white p-5 rounded-2xl mb-4 border border-gray-100 shadow-sm">
                <Text className="text-lg font-bold text-gray-900">{shop.name}</Text>
                <Text className="text-gray-400 text-xs mb-3">{shop.owner_email}</Text>
                <TouchableOpacity onPress={() => handleApproveShop(shop.id)} className="w-full bg-indigo-600 py-3.5 rounded-xl items-center">
                  <Text className="text-white font-bold text-sm">Approve Operational License</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : (
          systemUsers.map((user: any) => (
            <TouchableOpacity 
              key={user.id} 
              onPress={() => handleModifyUserRole(user.id, user.role, user.is_staff)}
              activeOpacity={0.7}
              className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm flex-row justify-between items-center"
            >
              <View className="flex-1 pr-3">
                <Text className="font-bold text-gray-900 text-base">{user.first_name || 'System'} {user.last_name || 'User'}</Text>
                <Text className="text-gray-400 text-xs mt-0.5">{user.email}</Text>
              </View>
              <View className={`px-3 py-1.5 rounded-xl ${user.is_staff ? 'bg-purple-50 border border-purple-100' : 'bg-gray-50 border border-gray-100'}`}>
                <Text className={`text-xs font-bold uppercase ${user.is_staff ? 'text-purple-600' : 'text-gray-500'}`}>
                  {user.is_staff ? 'Admin' : user.role || 'Buyer'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Sub-Component for Clean Analytics Rendering
const StatMiniCard = ({ count, title, icon, tailWidth }: any) => (
  <View className={`${tailWidth} bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm mb-3`}>
    <View className="flex-row justify-between items-center mb-1">
      <Text className="text-2xl font-black text-gray-900">{count || 0}</Text>
      <Text className="text-sm">{icon}</Text>
    </View>
    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wide">{title}</Text>
  </View>
);
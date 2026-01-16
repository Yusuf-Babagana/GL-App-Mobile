import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, Vibration, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile/");
      setProfile(res.data);
    } catch (e) {
      console.log("Error fetching profile", e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout },
    ]);
  };

  // --- HIDDEN ADMIN ACCESS ---
  const handleAdminAccess = () => {
    if (profile?.is_staff) {
      // Haptic feedback to let you know it worked
      Vibration.vibrate(50);
      router.push("/admin/dashboard");
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  const isSeller = profile?.roles?.includes('seller');
  const isRider = profile?.roles?.includes('rider');
  const kycStatus = profile?.kyc_status; // 'unverified', 'pending', 'verified', 'rejected'

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header Profile Section */}
        <View className="items-center py-8 bg-gray-50 border-b border-gray-100 mb-6">

          {/* SECRET DOOR: Long Press the Picture to open Admin Mode */}
          <TouchableOpacity
            activeOpacity={1}
            onLongPress={handleAdminAccess}
            delayLongPress={2000} // Hold for 2 seconds
            className="w-24 h-24 bg-gray-200 rounded-full mb-4 items-center justify-center overflow-hidden border-4 border-white shadow-sm"
          >
            {profile?.profile_image ? (
              <Image source={{ uri: profile.profile_image }} className="w-full h-full" />
            ) : (
              <Ionicons name="person" size={40} color="#9CA3AF" />
            )}
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-gray-900">{profile?.full_name || "User"}</Text>
          <Text className="text-gray-500">{profile?.email}</Text>

          <View className="flex-row mt-3 gap-2">
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 text-xs font-bold uppercase">{profile?.active_role || "Buyer"}</Text>
            </View>

            {/* Verification Badge */}
            {kycStatus === 'verified' && (
              <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
                <Ionicons name="checkmark-circle" size={12} color="#15803d" style={{ marginRight: 4 }} />
                <Text className="text-green-700 text-xs font-bold uppercase">Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* KYC BANNER (If not verified and not admin) */}
        {kycStatus !== 'verified' && !profile?.is_staff && (
          <TouchableOpacity
            onPress={() => kycStatus === 'pending' ? null : router.push("/kyc/upload")}
            className={`mx-6 mb-6 p-4 rounded-xl flex-row items-center shadow-sm ${kycStatus === 'pending' ? 'bg-yellow-50 border border-yellow-100' : kycStatus === 'rejected' ? 'bg-red-50 border border-red-100' : 'bg-blue-50 border border-blue-100'}`}
          >
            <Ionicons
              name={kycStatus === 'pending' ? 'time' : 'shield-checkmark'}
              size={28}
              color={kycStatus === 'pending' ? '#EAB308' : kycStatus === 'rejected' ? '#EF4444' : '#3B82F6'}
            />
            <View className="ml-3 flex-1">
              <Text className={`font-bold text-base ${kycStatus === 'pending' ? 'text-yellow-800' : kycStatus === 'rejected' ? 'text-red-800' : 'text-blue-800'}`}>
                {kycStatus === 'pending' ? 'Verification Pending' : kycStatus === 'rejected' ? 'Verification Rejected' : 'Verify Your Identity'}
              </Text>
              <Text className="text-xs text-gray-600 mt-0.5">
                {kycStatus === 'pending' ? 'We are reviewing your documents.' : 'Required to withdraw funds & increase limits.'}
              </Text>
            </View>
            {kycStatus !== 'pending' && <Ionicons name="chevron-forward" size={20} color="gray" />}
          </TouchableOpacity>
        )}

        <View className="px-6">
          {/* --- BUSINESS SECTION --- */}
          <Text className="text-gray-900 font-bold text-lg mb-3">Business & Earning</Text>

          {/* 1. SELLER BUTTON */}
          {isSeller ? (
            <TouchableOpacity
              onPress={() => router.push("/seller/dashboard")}
              className="bg-gray-900 p-4 rounded-xl flex-row justify-between items-center mb-4 shadow-md"
            >
              <View className="flex-row items-center">
                <View className="bg-gray-800 p-2 rounded-lg mr-3">
                  <Ionicons name="storefront" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">{t('seller_dashboard')}</Text>
                  <Text className="text-gray-400 text-xs">Manage products & orders</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/seller/setup")}
              className="bg-[#1DB954] p-4 rounded-xl flex-row justify-between items-center mb-4 shadow-lg shadow-green-200"
            >
              <View className="flex-row items-center">
                <View className="bg-white/20 p-2 rounded-lg mr-3">
                  <Ionicons name="rocket-outline" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">Become a Seller</Text>
                  <Text className="text-green-100 text-xs">Open your shop today</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
          )}

          {/* 2. RIDER BUTTON */}
          <TouchableOpacity
            onPress={() => router.push("/rider/dashboard")}
            className="bg-orange-500 p-4 rounded-xl flex-row justify-between items-center mb-6 shadow-lg shadow-orange-200"
          >
            <View className="flex-row items-center">
              <View className="bg-white/20 p-2 rounded-lg mr-3">
                <Ionicons name="bicycle" size={20} color="white" />
              </View>
              <View>
                <Text className="text-white font-bold text-lg">{isRider ? "Rider Dashboard" : "Become a Rider"}</Text>
                <Text className="text-orange-100 text-xs">Deliver orders & earn money</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="white" />
          </TouchableOpacity>

          {/* FINANCE SECTION */}
          <Text className="text-gray-900 font-bold text-lg mb-2">Finance</Text>
          <TouchableOpacity onPress={() => router.push("/wallet")} className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="wallet-outline" size={22} color="#1DB954" />
              <Text className="text-gray-700 ml-3 text-base">My Wallet</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/orders")} className="flex-row items-center justify-between py-4 border-b border-gray-100 mb-6">
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={22} color="#4B5563" />
              <Text className="text-gray-700 ml-3 text-base">My Orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* SETTINGS SECTION */}
          <Text className="text-gray-900 font-bold text-lg mb-2">Settings</Text>
          <View className="mb-4">
            <LanguageSwitcher />
          </View>
          <TouchableOpacity onPress={handleLogout} className="flex-row items-center mt-4 mb-10 p-4 bg-red-50 rounded-xl justify-center">
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-600 font-bold ml-2">Log Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
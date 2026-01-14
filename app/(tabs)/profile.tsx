import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
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

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header Profile Section */}
        <View className="items-center py-8 bg-gray-50 border-b border-gray-100 mb-6">
          <View className="w-24 h-24 bg-gray-200 rounded-full mb-4 items-center justify-center overflow-hidden border-4 border-white shadow-sm">
            {profile?.profile_image ? (
              <Image source={{ uri: profile.profile_image }} className="w-full h-full" />
            ) : (
              <Ionicons name="person" size={40} color="#9CA3AF" />
            )}
          </View>
          <Text className="text-2xl font-bold text-gray-900">{profile?.full_name || "User"}</Text>
          <Text className="text-gray-500">{profile?.email}</Text>

          <View className="flex-row mt-3 gap-2">
            <View className="bg-blue-100 px-3 py-1 rounded-full">
              <Text className="text-blue-700 text-xs font-bold uppercase">{profile?.active_role || "Buyer"}</Text>
            </View>
          </View>
        </View>

        <View className="px-6">

          {/* SELLER DASHBOARD BUTTON */}
          <TouchableOpacity
            onPress={() => router.push("/seller/dashboard")}
            className="bg-gray-900 p-4 rounded-xl flex-row justify-between items-center mb-6 shadow-md"
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

          {/* FINANCE SECTION (NEW) */}
          <Text className="text-gray-900 font-bold text-lg mb-2">Finance</Text>

          <TouchableOpacity
            onPress={() => router.push("/wallet")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <Ionicons name="wallet-outline" size={22} color="#1DB954" />
              <Text className="text-gray-700 ml-3 text-base">My Wallet</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/orders")}
            className="flex-row items-center justify-between py-4 border-b border-gray-100 mb-6"
          >
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={22} color="#4B5563" />
              <Text className="text-gray-700 ml-3 text-base">My Orders</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* LANGUAGE SECTION */}
          <View className="mb-6">
            <Text className="text-gray-900 font-bold text-lg mb-2">{t('language')}</Text>
            <LanguageSwitcher />
          </View>

          {/* GENERAL SETTINGS */}
          <Text className="text-gray-900 font-bold text-lg mb-2">Settings</Text>

          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="person-outline" size={22} color="#4B5563" />
              <Text className="text-gray-700 ml-3 text-base">Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-100">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={22} color="#4B5563" />
              <Text className="text-gray-700 ml-3 text-base">Shipping Address</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          {/* LOGOUT */}
          <TouchableOpacity
            onPress={logout}
            className="flex-row items-center mt-8 mb-10 p-4 bg-red-50 rounded-xl justify-center"
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-600 font-bold ml-2">Log Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
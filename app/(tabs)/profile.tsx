import SafeScreen from "@/components/SafeScreen";
import { useAuth } from "@/context/AuthContext"; // 1. Use Custom Auth
import api from "@/lib/api"; // 2. Import API

import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";

const MENU_ITEMS = [
  { id: 1, icon: "person-outline", title: "Edit Profile", color: "#3B82F6", action: "/profile/edit" },
  { id: 2, icon: "list-outline", title: "Orders", color: "#10B981", action: "/orders" },
  { id: 3, icon: "location-outline", title: "Addresses", color: "#F59E0B", action: "/addresses" },
  { id: 4, icon: "heart-outline", title: "Wishlist", color: "#EF4444", action: "/wishlist" },
] as const;

const ProfileScreen = () => {
  const { logout } = useAuth(); // 3. Get logout function
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 4. Fetch Profile Data when screen loads (or focuses)
  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile/');
      setUser(response.data);
    } catch (error) {
      console.log("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuPress = (action: string) => {
    // router.push(action); // Uncomment when you build these screens
    console.log("Navigate to:", action);
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* HEADER */}
        <View className="px-6 pb-8 pt-4">
          <View className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <View className="flex-row items-center">
              <View className="relative">
                {/* 5. Handle Profile Image (URL or Fallback) */}
                {user?.profile_image ? (
                  <Image
                    source={{ uri: user.profile_image }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                    transition={200}
                    contentFit="cover"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-full bg-gray-200 items-center justify-center">
                    <Ionicons name="person" size={40} color="#9CA3AF" />
                  </View>
                )}

                {/* Verified Badge (Only if KYC is verified) */}
                {user?.kyc_status === 'verified' && (
                  <View className="absolute -bottom-1 -right-1 bg-[#1DB954] rounded-full w-7 h-7 items-center justify-center border-2 border-white">
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-gray-900 text-2xl font-bold mb-1">
                  {user?.full_name || "User"}
                </Text>
                <Text className="text-gray-500 text-sm mb-2">
                  {user?.email || "No email"}
                </Text>

                {/* Role Badge */}
                <View className="bg-green-100 self-start px-3 py-1 rounded-full">
                  <Text className="text-[#1DB954] text-xs font-bold uppercase">
                    {user?.active_role || "Member"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* MENU ITEMS */}
        <View className="flex-row flex-wrap gap-3 mx-6 mb-6">
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-gray-50 rounded-2xl p-6 items-center justify-center border border-gray-100"
              style={{ width: "48%" }}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.action)}
            >
              <View
                className="rounded-full w-14 h-14 items-center justify-center mb-3"
                style={{ backgroundColor: item.color + "15" }} // 15 = 10% opacity hex
              >
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text className="text-gray-900 font-bold text-sm">{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NOTIFICATIONS BTN */}
        <View className="mb-3 mx-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <TouchableOpacity
            className="flex-row items-center justify-between py-1"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="bg-gray-200 p-2 rounded-full">
                <Ionicons name="notifications-outline" size={20} color="#374151" />
              </View>
              <Text className="text-gray-900 font-semibold ml-3">Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* PRIVACY AND SECURITY LINK */}
        <View className="mb-6 mx-6 bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <TouchableOpacity
            className="flex-row items-center justify-between py-1"
            activeOpacity={0.7}
            onPress={() => router.push("/privacy-security")}
          >
            <View className="flex-row items-center">
              <View className="bg-gray-200 p-2 rounded-full">
                <Ionicons name="shield-checkmark-outline" size={20} color="#374151" />
              </View>
              <Text className="text-gray-900 font-semibold ml-3">Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* SELLER MODE SECTION (ADDED) */}
        <View className="mx-6 mb-3">
          {user?.active_role === 'seller' ? (
            <TouchableOpacity
              className="bg-[#1DB954] rounded-2xl py-4 flex-row items-center justify-center shadow-sm"
              activeOpacity={0.8}
              onPress={() => router.push("/seller/dashboard")}
            >
              <Ionicons name="storefront" size={22} color="white" />
              <Text className="text-white font-bold text-base ml-2">Seller Dashboard</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="bg-gray-900 rounded-2xl py-4 flex-row items-center justify-center"
              activeOpacity={0.8}
              onPress={() => router.push("/seller/create-store")}
            >
              <Ionicons name="rocket-outline" size={22} color="white" />
              <Text className="text-white font-bold text-base ml-2">Become a Seller</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* SIGNOUT BTN */}
        <TouchableOpacity
          className="mx-6 mb-3 bg-red-50 rounded-2xl py-4 flex-row items-center justify-center border border-red-100"
          activeOpacity={0.8}
          onPress={logout} // 6. Call logout
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base ml-2">Sign Out</Text>
        </TouchableOpacity>

        <Text className="mx-6 mb-3 text-center text-gray-400 text-xs">Version 1.0.0</Text>
      </ScrollView>
    </SafeScreen>
  );
};

export default ProfileScreen;
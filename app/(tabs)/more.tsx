import { Button } from "@/components/ui/Button";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function MoreScreen() {
  const router = useRouter();
  const { isSignedIn, logout, userRole, user } = useAuth();

  const MenuLink = ({ icon, title, onPress, color = "#64748B", isLast = false }: any) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center bg-white p-5 ${!isLast ? 'border-b border-slate-50' : ''}`}
    >
      <View style={{ backgroundColor: color + '10' }} className="w-9 h-9 rounded-xl items-center justify-center mr-4">
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text className="flex-1 text-slate-700 font-semibold text-base">{title}</Text>
      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper bg="bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* --- DYNAMIC HEADER --- */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-4xl font-black text-gray-900 tracking-tight">Account</Text>
        </View>

        {/* --- PROFILE INFO / EDIT SECTION --- */}
        {isSignedIn ? (
          <TouchableOpacity
            onPress={() => router.push("/profile/edit")} // Navigates to edit screen
            className="mx-4 mb-6 bg-white p-5 rounded-[32px] shadow-sm border border-slate-100 flex-row items-center"
          >
            <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center border-4 border-emerald-50">
              <Text className="text-2xl font-bold text-emerald-700">
                {user?.fullName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
                {user?.fullName || "Globalink User"}
              </Text>
              <Text className="text-gray-500 text-sm" numberOfLines={1}>{user?.email}</Text>
              <View className="flex-row items-center mt-1">
                <View className="bg-primary/10 px-2 py-0.5 rounded-md">
                  <Text className="text-primary text-[10px] font-bold uppercase">{userRole}</Text>
                </View>
              </View>
            </View>

            <View className="bg-gray-50 p-2 rounded-full">
              <Ionicons name="settings-outline" size={20} color="#64748B" />
            </View>
          </TouchableOpacity>
        ) : (
          null
        )}

        {/* --- GENERAL SETTINGS --- */}
        <View className="mx-4 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">
          <MenuLink
            icon="person-outline"
            title="Edit Profile Details"
            onPress={() => router.push("/profile/edit")}
            color="#6366F1"
          />
          {isSignedIn && (
            <MenuLink
              icon="wallet-outline"
              title="My Wallet"
              onPress={() => router.push("/wallet")}
              color="#329629"
            />
          )}
          <MenuLink
            icon="cart-outline"
            title="My Cart"
            onPress={() => router.push("/(tabs)/cart")}
          />
          <MenuLink
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() => router.push("/help")}
          />
          <MenuLink
            icon="shield-checkmark-outline"
            title="Privacy & Security"
            onPress={() => router.push("/privacy")}
            isLast={true}
          />
        </View>

        {/* --- USER ONLY SECTION --- */}
        {isSignedIn ? (
          <>
            {/* --- USER ONLY SECTION --- */}
            <Text className="px-6 text-gray-400 font-bold text-[10px] uppercase tracking-[2px] mb-3 ml-1">
              Actions
            </Text>
            <View className="mx-4 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8">
              <MenuLink
                icon="receipt-outline"
                title="My Orders"
                onPress={() => router.push("/orders")}
                color="#3B82F6"
                isLast={true}
              />
            </View>

            {/* --- BUSINESS TOOLS (Role-Specific) --- */}
            {(userRole === 'seller' || userRole === 'rider') && (
              <>
                <Text className="px-6 text-gray-400 font-bold text-[10px] uppercase tracking-[2px] mb-3 ml-1">
                  Business Tools
                </Text>
                <View className="mx-4 bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-6">

                  {/* Show only to Sellers */}
                  {userRole === 'seller' && (
                    <MenuLink
                      icon="storefront-outline"
                      title="Seller Dashboard"
                      onPress={() => router.push("/seller/dashboard")}
                      isLast={userRole !== 'rider'} // Dynamic border handling
                    />
                  )}

                  {/* Show only to Riders */}
                  {userRole === 'rider' && (
                    <MenuLink
                      icon="bicycle-outline"
                      title="Rider Dashboard"
                      onPress={() => router.push("/rider/dashboard")}
                      isLast={true}
                    />
                  )}
                </View>
              </>
            )}

            <View className="mx-6 mt-12 mb-20">
              <Button
                title="Sign Out"
                onPress={async () => {
                  console.log("Signing out...");
                  await logout();
                }}
                variant="danger"
                className="bg-red-50"
                icon={<Ionicons name="log-out-outline" size={20} color="#EF4444" />}
              />
            </View>
          </>
        ) : (
          /* --- GUEST ONLY SECTION --- */
          <View className="p-6 mt-8 mb-20">
            <View className="bg-primary/10 p-6 rounded-3xl border border-primary/20 items-center">
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center mb-4">
                <Ionicons name="person-add-outline" size={24} color="#329629" />
              </View>
              <Text className="text-gray-900 font-bold text-lg mb-2">Join Globalink</Text>
              <Text className="text-gray-500 text-center text-sm mb-6">
                Sign in to manage your orders, wallet, and store.
              </Text>

              <Button
                title="Login / Register"
                onPress={() => router.push("/(auth)/login")}
                className="w-full shadow-lg shadow-primary/20"
              />
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}
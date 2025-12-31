import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Set to true when backend cart is ready
  const [totalPrice, setTotalPrice] = useState(0);

  // Placeholder for fetching cart (We will build the Cart Backend later)
  useEffect(() => {
    // For now, we start with an empty cart to prevent crashes
    setCartItems([]);
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">My Cart</Text>
        <Text className="text-gray-500">{cartItems.length} items</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {cartItems.length === 0 ? (
          <View className="items-center justify-center py-20 px-10">
            <View className="bg-gray-100 p-6 rounded-full mb-6">
              <Ionicons name="cart-outline" size={48} color="#9ca3af" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</Text>
            <Text className="text-gray-500 text-center leading-6">
              Looks like you haven't added anything to your cart yet.
            </Text>
          </View>
        ) : (
          <View className="px-4 mt-4">
            {/* Cart Items will be mapped here later */}
            <Text>Cart Items List</Text>
          </View>
        )}
      </ScrollView>

      {/* Checkout Bar (Only show if items exist) */}
      {cartItems.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-8">
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-500">Total</Text>
            <Text className="text-xl font-bold text-gray-900">₦{totalPrice.toLocaleString()}</Text>
          </View>
          <TouchableOpacity className="bg-[#1DB954] py-4 rounded-xl items-center">
            <Text className="text-white font-bold text-lg">Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
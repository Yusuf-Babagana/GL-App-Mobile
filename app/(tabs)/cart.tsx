import SafeScreen from "@/components/SafeScreen";
import { useCart } from "@/context/CartContext";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, cartTotal, removeFromCart, isLoading } = useCart();

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    Alert.alert("Checkout", "Checkout flow coming next!");
    router.push("/checkout"); // We will create this next
  };

  if (isLoading && cartItems.length === 0) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-6 py-4 border-b border-gray-100 bg-white">
          <Text className="text-2xl font-bold text-gray-900">My Cart</Text>
          <Text className="text-gray-500 text-sm">{cartItems.length} items</Text>
        </View>

        {cartItems.length === 0 ? (
          // --- EMPTY STATE ---
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-white p-6 rounded-full shadow-sm mb-6">
              <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</Text>
            <Text className="text-gray-500 text-center mb-8">
              Looks like you haven't added anything to your cart yet.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)")}
              className="bg-[#1DB954] px-8 py-4 rounded-full"
            >
              <Text className="text-white font-bold text-lg">Start Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // --- CART LIST ---
          <View className="flex-1">
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View className="flex-row bg-white p-3 rounded-2xl mb-4 shadow-sm border border-gray-100">
                  {/* Product Image */}
                  <Image
                    source={{ uri: item.product_image || "https://placehold.co/100x100" }}
                    className="w-24 h-24 rounded-xl bg-gray-100"
                    contentFit="cover"
                  />

                  {/* Details */}
                  <View className="flex-1 ml-4 justify-between py-1">
                    <View>
                      <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                        {item.product_name}
                      </Text>
                      <Text className="text-gray-500 text-xs mt-1">Quantity: {item.quantity}</Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-[#1DB954] font-bold text-lg">
                        ₦{(Number(item.product_price) * item.quantity).toLocaleString()}
                      </Text>

                      {/* Delete Button */}
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.id)}
                        className="bg-red-50 p-2 rounded-lg"
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />

            {/* --- CHECKOUT FOOTER --- */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 pb-8 rounded-t-[30px] shadow-lg">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-500">Subtotal</Text>
                <Text className="text-gray-900 font-bold">₦{Number(cartTotal).toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between mb-6">
                <Text className="text-gray-500">Delivery</Text>
                <Text className="text-[#1DB954] font-bold">Free</Text>
              </View>

              <View className="h-[1px] bg-gray-100 mb-6" />

              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-gray-900">Total</Text>
                <Text className="text-2xl font-bold text-[#1DB954]">
                  ₦{Number(cartTotal).toLocaleString()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleCheckout}
                className="bg-[#1DB954] w-full py-4 rounded-2xl flex-row justify-center items-center shadow-lg shadow-green-200"
              >
                <Text className="text-white font-bold text-lg mr-2">Checkout</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeScreen>
  );
}
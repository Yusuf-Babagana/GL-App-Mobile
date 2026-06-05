import { Button } from "@/components/ui/Button";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useCart } from "@/context/CartContext";
import { getOptimizedImageUrl } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, cartTotal, removeFromCart, isLoading } = useCart();

  if (isLoading && cartItems.length === 0) {
    return (
      <ScreenWrapper className="justify-center items-center">
        <ActivityIndicator size="large" color="#329629" />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View className="flex-1">
        <View className="px-6 pt-4 pb-4 bg-white">
          <Text className="text-2xl font-black text-gray-900">My Cart</Text>
          <Text className="text-gray-400 text-sm font-medium mt-0.5">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</Text>
        </View>

        {cartItems.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="bg-gray-50 w-24 h-24 rounded-3xl items-center justify-center mb-6">
              <Ionicons name="cart-outline" size={48} color="#CBD5E1" />
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-1">Your cart is empty</Text>
            <Text className="text-gray-400 text-center mb-8 px-8 font-medium">
              Looks like you haven't added anything yet
            </Text>
            <Button
              title="Start Shopping"
              onPress={() => router.push("/(tabs)")}
              size="lg"
            />
          </View>
        ) : (
          <View className="flex-1">
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{ padding: 20, paddingBottom: 180 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View className="flex-row bg-white p-3.5 rounded-2xl mb-3.5" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
                  <Image
                    source={{ uri: getOptimizedImageUrl(item.product_image) || "" }}
                    className="w-24 h-24 rounded-xl bg-gray-100"
                    contentFit="cover"
                    transition={500}
                  />
                  <View className="flex-1 ml-4 justify-between py-0.5">
                    <View>
                      <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
                        {item.product_name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-gray-400 text-xs font-medium">Qty: {item.quantity}</Text>
                      </View>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-primary font-black text-lg">
                        ₦{(Number(item.product_price) * item.quantity).toLocaleString()}
                      </Text>
                      <View className="flex-row gap-2">
                        <TouchableOpacity
                          onPress={() => router.push(`/product/${item.product}`)}
                          className="bg-blue-50 p-2.5 rounded-xl"
                        >
                          <Ionicons name="chatbubble-ellipses" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => removeFromCart(item.id)}
                          className="bg-red-50 p-2.5 rounded-xl"
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            />

            <View className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-5 pb-8 rounded-t-[32px]" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 8 }}>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-400 font-medium">Subtotal</Text>
                <Text className="text-gray-900 font-bold">₦{Number(cartTotal).toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between mb-5">
                <Text className="text-gray-400 font-medium">Delivery</Text>
                <Text className="text-green-600 font-bold">Free</Text>
              </View>
              <View className="h-px bg-gray-100 mb-5" />
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-lg font-black text-gray-900">Total</Text>
                <Text className="text-2xl font-black text-primary">₦{Number(cartTotal).toLocaleString()}</Text>
              </View>
              <Button
                title="Proceed to Checkout"
                onPress={() => router.push("/checkout")}
                size="lg"
                icon={<Ionicons name="arrow-forward" size={20} color="white" />}
              />
            </View>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

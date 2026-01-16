import { useCart } from "@/context/CartContext";
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StatusBar, Text, TouchableOpacity, View } from "react-native";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    marketAPI.getProductById(Number(id))
      .then(setProduct)
      .catch(console.log)
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      Alert.alert("Success", "Added to cart", [
        { text: "Continue Shopping", style: "cancel" },
        { text: "Go to Cart", onPress: () => router.push("/cart") }
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!product) return <View className="flex-1 bg-white" />;

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header (Absolute) */}
      <View className="absolute top-12 left-6 z-10">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/80 rounded-full items-center justify-center shadow-sm backdrop-blur-md">
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Large Image */}
        <View className="w-full h-96 bg-gray-100 relative">
          <Image
            source={{ uri: product.image || product.images?.[0]?.image }}
            className="w-full h-full"
            contentFit="cover"
          />
          {/* Curve divider */}
          <View className="absolute -bottom-1 w-full h-6 bg-white rounded-t-3xl" />
        </View>

        <View className="px-6 pt-2">

          {/* STORE INFO & CHAT BUTTON */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="storefront" size={16} color="#6B7280" />
              <Text className="text-gray-500 font-medium ml-2">{product.store?.name || "Official Store"}</Text>
            </View>

            {/* Chat Button (Only shows if owner_id exists) */}
            {product.store?.owner_id && (
              <TouchableOpacity
                onPress={() => router.push(`/chat/${product.store.owner_id}`)}
                className="bg-blue-50 px-3 py-1.5 rounded-full flex-row items-center"
              >
                <Ionicons name="chatbubble-ellipses" size={16} color="#3B82F6" />
                <Text className="text-blue-600 font-bold text-xs ml-1">Chat</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text className="text-3xl font-bold text-gray-900 mb-2">{product.name}</Text>
          <Text className="text-[#1DB954] text-2xl font-bold mb-6">₦{Number(product.price).toLocaleString()}</Text>

          {/* Divider */}
          <View className="h-[1px] bg-gray-100 w-full mb-6" />

          <Text className="text-gray-900 font-bold text-lg mb-2">Description</Text>
          <Text className="text-gray-500 leading-6 text-base">{product.description}</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <View className="flex-row items-center gap-4">
          {/* Quantity Stepper */}
          <View className="flex-row items-center bg-gray-100 rounded-xl px-2 py-2">
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 bg-white rounded-lg items-center justify-center shadow-sm"
            >
              <Ionicons name="remove" size={20} color="black" />
            </TouchableOpacity>
            <Text className="w-8 text-center font-bold text-lg">{quantity}</Text>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              className="w-10 h-10 bg-white rounded-lg items-center justify-center shadow-sm"
            >
              <Ionicons name="add" size={20} color="black" />
            </TouchableOpacity>
          </View>

          {/* Add Button */}
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={addingToCart}
            className="flex-1 bg-[#1DB954] h-14 rounded-xl flex-row items-center justify-center shadow-lg shadow-green-200"
          >
            {addingToCart ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="cart" size={20} color="white" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-lg">Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
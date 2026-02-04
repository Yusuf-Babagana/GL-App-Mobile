import { Button } from "@/components/ui/Button";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { chatApi } from "@/lib/chatApi";
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, FlatList, ScrollView, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { isSignedIn } = useAuth(); // Get auth state

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
    // Guest Mode Check
    if (!isSignedIn) {
      Alert.alert(
        "Login Required",
        "You need to sign in to purchase items.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/(auth)/login") }
        ]
      );
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);

      // Fly-to-Cart Logic
      Alert.alert(
        "Added to Cart! 🛒",
        `${product.name} is ready for checkout.`,
        [
          {
            text: "Keep Browsing",
            style: "cancel"
          },
          {
            text: "View Cart",
            onPress: () => router.push("/cart"),
            style: "default"
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Could not add to cart. Please try again.");
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
    <ScreenWrapper safeAreaTop={false}>
      {/* Header (Absolute) */}
      <View className="absolute top-12 left-6 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-sm backdrop-blur-md border border-gray-100"
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Large Image */}
        {/* Image Gallery */}
        <View className="w-full h-96 bg-gray-100 relative">
          <FlatList
            data={product.images && product.images.length > 0 ? product.images : [{ image: product.image }]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.image || item }}
                style={{ width: width, height: 384 }} // 384 is h-96
                contentFit="cover"
              />
            )}
          />
          {/* Curve divider */}
          <View className="absolute -bottom-1 w-full h-6 bg-white rounded-t-3xl ponter-events-none" />
        </View>

        <View className="px-6 pt-2">

          {/* STORE INFO & CHAT BUTTON */}
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="storefront" size={16} color="#6B7280" />
              <Text className="text-gray-500 font-medium ml-2">{product.store?.name || "Official Store"}</Text>
            </View>

            {/* Location Badge */}
            <View className="flex-row items-center mt-1 mb-2">
              <Ionicons name="location" size={12} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs ml-1">Ships from {product.store?.location || "Kano, Nigeria"}</Text>
            </View>

            {/* Chat Button (Only shows if owner_id exists) */}
            {product.store?.owner_id && (
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const data = await chatApi.startConversation(product.store.owner_id, product.id);

                    // Pass the conversation ID and the Store Name to the next screen
                    router.push({
                      pathname: "/chat/[userId]",
                      params: { userId: product.store.owner_id, name: product.store.name }
                    });
                  } catch (e: any) {
                    Alert.alert("Chat Error", e.message || "Could not start conversation");
                  }
                }}
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

          {/* Related Video */}
          {product.video_url && (
            <View className="mb-6">
              <Text className="text-gray-900 font-bold text-lg mb-3">Product Video</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/live')}
                className="w-full h-48 rounded-2xl overflow-hidden bg-black items-center justify-center relative"
              >
                <Image
                  source={{ uri: product.image }}
                  className="w-full h-full opacity-60"
                />
                <View className="absolute bg-white/20 p-4 rounded-full backdrop-blur-md">
                  <Ionicons name="play" size={32} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          )}

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
          <View className="flex-1">
            <Button
              title="Add to Cart"
              onPress={handleAddToCart}
              loading={addingToCart}
              icon={<Ionicons name="cart" size={20} color="white" />}
              className="shadow-lg shadow-green-200"
            />
          </View>
        </View>
      </View>
    </ScreenWrapper>
  );
}
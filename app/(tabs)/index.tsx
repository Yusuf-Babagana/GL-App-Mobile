import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function MarketScreen() {
  const router = useRouter();
  const { isSignedIn, userRole } = useAuth(); // Accessing global auth state
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [prodData, catData] = await Promise.all([
        marketAPI.getProducts(searchQuery, selectedCategory),
        marketAPI.getCategories()
      ]);
      setProducts(prodData.results || prodData);
      setCategories(catData.results || catData);
    } catch (e) {
      console.log("Fetch Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [searchQuery, selectedCategory]));

  const renderProduct = ({ item }: { item: any }) => {
    // Yusuf, we prioritize the new 'image' field we just created in the Serializer
    const rawPath = item.image || (item.images?.length > 0 ? item.images[0].image : null);

    const getImageUrl = (path: string) => {
      // Current Backend IP from your logs
      const BASE_IP = "172.20.10.7";

      if (!path || path === "undefined" || path === "null") {
        // This is the source of the headphones!
        return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=500';
      }

      // If it's a full Cloudinary URL
      if (path.startsWith('http')) return path;

      // If it's a local Django path
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      return `http://${BASE_IP}:8000/media/${cleanPath}`;
    };

    const finalUrl = getImageUrl(rawPath);

    // This log will now show the actual URL instead of 'undefined'
    console.log(`Product: ${item.name} | Image URL: ${finalUrl}`);

    // Function to handle the chat logic
    const handleChatPress = async () => {
      console.log("Chat pressed for item:", item.id);

      if (!isSignedIn) {
        Alert.alert("Login Required", "Please login to chat with sellers", [
          { text: "Cancel", style: "cancel" },
          { text: "Login", onPress: () => router.push("/(auth)/login") }
        ]);
        return;
      }

      if (!item.store || !item.store.owner_id) {
        Alert.alert("Error", "Store information is missing for this product.");
        return;
      }

      try {
        console.log("Starting conversation with owner:", item.store.owner_id);
        // We use marketAPI which calls the correct /chat/start/ endpoint with user_id & product_id
        const data = await marketAPI.startChat(item.store.owner_id, item.id);
        console.log("Conversation started:", data);

        router.push({
          pathname: "/chat/[userId]",
          params: { userId: item.store.owner_id, name: item.store.name }
        });
      } catch (e: any) {
        console.log("Error starting chat:", e);
        Alert.alert("Chat Error", e.message || "Failed to start chat. Check connection.");
      }
    };

    return (
      <TouchableOpacity
        onPress={() => router.push(`/product/${item.id}`)}
        className="w-[48%] mb-4 bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm"
      >
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: finalUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={500}
            cachePolicy="disk"
            // This prevents the "black box" look while loading
            placeholder={{ blurhash: "L6PZf6ay01ay~qj[00ay00ayj[ay" }}
            onError={() => console.log("Failed to load image:", finalUrl)}
          />
        </View>

        <View className="p-3">
          <Text className="text-slate-800 font-bold" numberOfLines={1}>{item.name}</Text>

          <View className="flex-row justify-between items-center mt-2">
            <View>
              <Text className="text-gray-400 text-[10px] uppercase font-bold">{item.store?.name || "Globalink"}</Text>
              <Text className="text-primary font-black">₦{Number(item.price).toLocaleString()}</Text>
            </View>

            {/* CHAT BUTTON LOGIC */}
            <View className="flex-row gap-2">
              {/* Only show Chat if the current user isn't the seller of this item */}
              {isSignedIn && userRole === 'seller' && item.store?.owner_id === item.id ? (
                <TouchableOpacity className="bg-blue-50 p-2 rounded-full">
                  <Ionicons name="create" size={16} color="#3B82F6" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleChatPress}
                  className="bg-blue-50 p-2 rounded-full"
                >
                  <Ionicons name="chatbubble-ellipses" size={18} color="#3B82F6" />
                </TouchableOpacity>
              )}

              {/* ADD TO CART / DETAILS BUTTON */}
              <TouchableOpacity
                onPress={() => router.push(`/product/${item.id}`)}
                className="bg-primary p-2 rounded-full shadow-sm shadow-primary/30"
              >
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenWrapper bg="bg-gray-50">
      {/* Header */}
      <View className="px-6 pt-2 pb-6 bg-white rounded-b-[32px] shadow-sm mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-gray-400 text-xs font-bold tracking-widest uppercase">Globalink</Text>
            <Text className="text-3xl font-bold text-gray-900">Discover</Text>
          </View>
          <TouchableOpacity className="bg-gray-50 p-2 rounded-full border border-gray-100">
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-gray-900 font-medium text-base"
            placeholder="Search products, stores..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Seller Dashboard Quick Link */}
      {isSignedIn && userRole === 'seller' && (
        <TouchableOpacity
          onPress={() => router.push("/seller/dashboard")}
          className="mx-6 mb-4 bg-primary/10 border border-primary/20 p-4 rounded-2xl flex-row items-center justify-between"
        >
          <View className="flex-row items-center">
            <View className="bg-primary p-2 rounded-xl mr-3">
              <Ionicons name="stats-chart" size={18} color="white" />
            </View>
            <View>
              <Text className="text-primary font-bold">Seller Mode Active</Text>
              <Text className="text-gray-500 text-xs">Tap to manage your products & orders</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#329629" />
        </TouchableOpacity>
      )}


      {/* Categories Horizontal Scroll */}
      <View className="mb-4">
        <FlatList
          horizontal
          data={[{ id: null, name: "All" }, ...categories]}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          keyExtractor={(item) => (item.id ?? 'all').toString()}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                className={`px-5 py-2.5 rounded-full border ${isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
              >
                <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#329629" size="large" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 24 }}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20">
              <Ionicons name="search-outline" size={48} color="#CBD5E1" />
              <Text className="text-gray-400 font-medium mt-4">No products found</Text>
            </View>
          }
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    height: 160,
    width: '100%',
    backgroundColor: '#F1F5F9', // Shows gray while loading
    position: 'relative',
    overflow: 'hidden',
  }
});
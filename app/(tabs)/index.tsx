import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function MarketScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [prodData, catData] = await Promise.all([
        marketAPI.getProducts(searchQuery), // Ensure your API accepts search query
        marketAPI.getCategories()
      ]);
      setProducts(prodData.results || prodData);
      setCategories(catData);
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => { fetchData(); }, [searchQuery])
  );

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory || p.category?.id === selectedCategory)
    : products;

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => router.push(`/product/${item.id}`)}
      className="flex-1 m-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <View className="h-40 bg-gray-100 w-full relative">
        <Image
          source={{ uri: item.image || item.images?.[0]?.image }}
          className="w-full h-full"
          contentFit="cover"
          transition={200}
        />
        {item.stock <= 0 && (
          <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-md">
            <Text className="text-white text-[10px] font-bold uppercase">Sold Out</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={1}>{item.name}</Text>
        <Text className="text-gray-500 text-xs mb-2" numberOfLines={1}>{item.store?.name || "Official Store"}</Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-[#1DB954] font-bold text-lg">₦{Number(item.price).toLocaleString()}</Text>
          <View className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center">
            <Ionicons name="add" size={20} color="black" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Header Section */}
      <View className="bg-gray-900 pt-12 pb-6 px-6 rounded-b-[32px] shadow-lg z-10">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Welcome Back</Text>
            <Text className="text-white text-3xl font-bold">Marketplace</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/cart")} className="bg-gray-800 p-3 rounded-full relative">
            <Ionicons name="cart-outline" size={24} color="white" />
            <View className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-gray-900" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-gray-800 rounded-2xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            className="flex-1 ml-3 text-white font-medium"
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <View className="mt-4">
        <FlatList
          data={[{ id: null, name: "All" }, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          keyExtractor={(item) => item.id?.toString() || 'all'}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item.id)}
              className={`mr-3 px-5 py-2.5 rounded-xl border ${selectedCategory === item.id ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-bold ${selectedCategory === item.id ? 'text-white' : 'text-gray-600'}`}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Product Grid */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons name="search" size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4 font-medium">No products found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
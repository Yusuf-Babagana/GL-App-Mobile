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
        marketAPI.getProducts(searchQuery),
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
      activeOpacity={0.9}
      className="flex-1 m-2 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <View className="h-44 bg-gray-100 w-full relative">
        <Image
          source={{ uri: item.image || item.images?.[0]?.image }}
          className="w-full h-full"
          contentFit="cover"
          transition={300}
        />
        {item.stock <= 0 && (
          <View className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-lg">
            <Text className="text-white text-[10px] font-bold uppercase">Sold Out</Text>
          </View>
        )}
      </View>

      <View className="p-4">
        <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1">{item.category?.name || "General"}</Text>
        <Text className="text-gray-900 font-bold text-sm mb-1" numberOfLines={1}>{item.name}</Text>

        <View className="flex-row justify-between items-center mt-2">
          <View>
            <Text className="text-gray-400 text-[10px]">Price</Text>
            <Text className="text-gray-900 font-black text-base">₦{Number(item.price).toLocaleString()}</Text>
          </View>
          <View className="w-9 h-9 bg-gray-900 rounded-2xl items-center justify-center shadow-md">
            <Ionicons name="add" size={20} color="white" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Set StatusBar to light-content because our header is dark */}
      <StatusBar barStyle="light-content" />

      {/* Modern Dark Header */}
      <View className="bg-gray-950 pt-14 pb-8 px-6 rounded-b-[40px] shadow-2xl">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Explore</Text>
            <Text className="text-white text-3xl font-black italic">Marketplace</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            className="bg-gray-800/50 w-12 h-12 rounded-2xl items-center justify-center border border-gray-700"
          >
            <Ionicons name="bag-handle-outline" size={24} color="white" />
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-[#1DB954] rounded-full border-2 border-gray-950 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">2</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Professional Search Bar */}
        <View className="flex-row items-center bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3">
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-white font-semibold"
            placeholder="Search premium products..."
            placeholderTextColor="#4B5563"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Enhanced Categories */}
      <View className="py-6">
        <FlatList
          data={[{ id: null, name: "All Items" }, ...categories]}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          keyExtractor={(item) => item.id?.toString() || 'all'}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.id)}
                className={`mr-3 px-6 py-3 rounded-2xl border ${isSelected ? 'bg-gray-900 border-gray-900 shadow-md' : 'bg-gray-50 border-gray-100'}`}
              >
                <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1DB954" />
          <Text className="text-gray-400 mt-4 font-bold uppercase tracking-widest text-[10px]">Loading Collection</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <View className="bg-gray-100 p-6 rounded-full">
                <Ionicons name="search-outline" size={40} color="#9CA3AF" />
              </View>
              <Text className="text-gray-900 mt-4 font-bold text-lg">No results found</Text>
              <Text className="text-gray-400 text-sm">Try a different search term</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
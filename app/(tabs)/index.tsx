import api from "@/lib/api"; // Direct API import
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Define interface locally
interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: { id: number; image: string }[];
  category: number;
  store_name: string;
  average_rating: number;
}

export default function ShopScreen() {
  // --- INLINE STATE & LOGIC ---
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching products...");
      const response = await api.get('/market/products/');
      console.log("Products fetched:", response.data.length);
      setProducts(response.data);
    } catch (err: any) {
      console.log("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  // ---------------------------

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">Marketplace</Text>
        <Ionicons name="search" size={24} color="black" />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchProducts} tintColor="#1DB954" />
        }
      >
        {/* Banner */}
        <View className="bg-green-50 m-4 p-6 rounded-2xl">
          <Text className="text-[#1DB954] font-bold text-lg">Welcome to Globalink</Text>
          <Text className="text-gray-600">Find everything you need, locally and globally.</Text>
        </View>

        {/* Product Grid */}
        <View className="px-4">
          <Text className="text-lg font-bold mb-4">Latest Products</Text>

          {products.length === 0 ? (
            <View className="items-center py-10">
              <Text className="text-gray-400">No products found.</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {products.map((product) => (
                <View key={product.id} className="w-[48%] mb-4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <View className="h-40 bg-gray-200">
                    {product.images?.[0]?.image ? (
                      <Image
                        source={{ uri: product.images[0].image }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="flex-1 justify-center items-center">
                        <Ionicons name="image-outline" size={32} color="gray" />
                      </View>
                    )}
                  </View>
                  <View className="p-3">
                    <Text numberOfLines={1} className="font-bold text-base">{product.name}</Text>
                    <Text className="text-[#1DB954] font-bold mt-1">₦{product.price.toLocaleString()}</Text>
                    <Text className="text-xs text-gray-500 mt-1">{product.store_name}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
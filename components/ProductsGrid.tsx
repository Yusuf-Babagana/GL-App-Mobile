import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from "react-native";

interface ProductsGridProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
}

const ProductsGrid = ({ products, isLoading, isError }: ProductsGridProps) => {
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();
  const { isAddingToCart, addToCart } = useCart();

  const renderProduct = ({ item: product }: { item: Product }) => (
    <TouchableOpacity
      className="bg-white rounded-[32px] overflow-hidden mb-5 border border-gray-50 shadow-sm"
      style={{ width: "48%" }}
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${product._id}`)}
    >
      <View className="relative">
        <Image
          source={{ uri: product.images[0] }}
          className="w-full h-48 bg-gray-100"
          resizeMode="cover"
        />
        <TouchableOpacity
          className="absolute top-3 right-3 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm"
          activeOpacity={0.7}
          onPress={() => toggleWishlist(product._id)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
        >
          <Ionicons
            name={isInWishlist(product._id) ? "heart" : "heart-outline"}
            size={18}
            color={isInWishlist(product._id) ? "#FF4B4B" : "#111827"}
          />
        </TouchableOpacity>
      </View>

      <View className="p-4">
        <Text className="text-gray-400 text-[10px] font-bold uppercase mb-1" numberOfLines={1}>{product.category}</Text>
        <Text className="text-gray-900 font-bold text-sm mb-2" numberOfLines={1}>
          {product.name}
        </Text>

        <View className="flex-row items-center mb-3">
          <Ionicons name="star" size={12} color="#FBBF24" />
          <Text className="text-gray-900 text-[11px] font-bold ml-1">
            {product.averageRating.toFixed(1)}
          </Text>
          <Text className="text-gray-400 text-[11px] ml-1">({product.totalReviews})</Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-gray-900 font-black text-base">₦{product.price.toLocaleString()}</Text>
          <TouchableOpacity
            className="bg-gray-900 rounded-xl w-8 h-8 items-center justify-center shadow-md"
            onPress={() => addToCart({ productId: product._id, quantity: 1 })}
          >
            <Ionicons name="add" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) return <ActivityIndicator className="py-10" color="#1DB954" />;
  if (isError) return <Text className="text-center py-10 text-red-500">Error Loading Collection</Text>;

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      ListEmptyComponent={<NoProductsFound />}
    />
  );
};

export default ProductsGrid;

function NoProductsFound() {
  return (
    <View className="py-20 items-center justify-center">
      <Ionicons name="search-outline" size={48} color={"#E5E7EB"} />
      <Text className="text-gray-900 font-bold text-lg mt-4">No Items Found</Text>
      <Text className="text-gray-400 text-sm">Try adjusting your filters</Text>
    </View>
  );
}
import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Heart, Star, Image as ImageIcon } from 'lucide-react-native';

interface Product {
  id: number;
  name?: string;
  title?: string;
  price: string;
  image?: string;
  images?: { image: string }[] | string[];
  video_ad_url?: string | null;
  video_url?: string | null;
  store?: { name: string } | string;
  shop_name?: string;
}

interface ProductCardProps {
  product: Product;
  onPress?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const price_number = Number(product.price) || 0;

  const imageSource = product.image || (product.images?.length > 0
    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].image)
    : null
  );
  const hasImage = Boolean(imageSource) && imageSource !== "null" && imageSource !== "undefined";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      className="w-[48%] mb-5 bg-white rounded-2xl overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
      }}
    >
      <View className="w-full h-40 relative bg-gray-50">
        {hasImage ? (
          <Image
            source={{ uri: imageSource }}
            className="w-full h-full"
            style={{ resizeMode: 'cover' }}
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <ImageIcon size={36} color="#D1D5DB" strokeWidth={1.5} />
            <Text className="text-gray-300 text-[10px] font-bold mt-1">No Image</Text>
          </View>
        )}
        <TouchableOpacity className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full shadow-sm">
          <Heart size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View className="p-3.5">
        <View className="flex-row items-center mb-2">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={10} color="#FBBF24" fill="#FBBF24" style={{ marginRight: 1 }} />
          ))}
          <Text className="text-gray-400 text-[9px] ml-1 font-medium">(0)</Text>
        </View>

        <View className="bg-green-50 rounded-full px-2 py-0.5 self-start mb-2">
          <Text className="text-green-700 text-[9px] font-bold uppercase tracking-wider" numberOfLines={1}>
            {product.store?.name || product.store || product.shop_name || "Globalink"}
          </Text>
        </View>

        <Text numberOfLines={1} className="text-gray-900 font-bold text-xs mb-1.5">
          {product.name || product.title}
        </Text>

        <Text className="text-primary font-black text-base">
          ₦{price_number.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

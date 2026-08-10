import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
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

const BASE_URL = "https://glappbackend.pythonanywhere.com";

// Product images can come back as a full URL (e.g. Cloudinary) or a
// relative path served from the backend's own /media/ directory.
const resolveImageUrl = (path?: string | null): string | undefined => {
  if (!path || path === "null" || path === "undefined") return undefined;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `${BASE_URL}/media/${cleanPath}`;
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const price_number = Number(product.price) || 0;

  const images = product.images ?? [];
  const firstImage = images.length > 0
    ? (typeof images[0] === 'string' ? images[0] : images[0].image)
    : null;
  const rawImage = product.image || firstImage;
  const imageSource = resolveImageUrl(rawImage);
  const hasImage = Boolean(imageSource);

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
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
            onError={(e) => console.log('[ProductCard] image failed to load:', imageSource, e.error)}
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <ImageIcon size={36} color="#D1D5DB" strokeWidth={1.5} />
            <Text className="text-gray-300 text-[10px] font-bold mt-1">No Image</Text>
          </View>
        )}
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Add to wishlist"
          accessibilityRole="button"
          className="absolute bottom-3 right-3 bg-white/90 p-2 rounded-full shadow-sm"
        >
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
            {(typeof product.store === 'string' ? product.store : product.store?.name) || product.shop_name || "Globalink"}
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

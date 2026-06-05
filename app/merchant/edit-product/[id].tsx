import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { ChevronLeft, Image as ImageIcon, Video } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { marketAPI } from '@/lib/marketApi';
import { uploadToCloudinary } from '@/lib/cloudinary';

const CATEGORIES = [
  { id: 1, name: 'Fashion' },
  { id: 2, name: 'Electronics' },
  { id: 3, name: 'Home & Kitchen' },
  { id: 4, name: 'Beauty' },
  { id: 5, name: 'Sports' },
  { id: 6, name: 'Books' },
  { id: 7, name: 'Other' },
];

export default function EditProduct() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState<number | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const productId = Array.isArray(id) ? Number(id[0]) : Number(id);

  useEffect(() => {
    if (!id || isNaN(productId)) {
      Alert.alert('Error', 'Missing product ID. Returning to dashboard.');
      router.replace('/merchant');
      return;
    }
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const product = await marketAPI.getProductById(productId);

      setName(product.name || '');
      setDescription(product.description || '');
      setPrice(String(product.price ?? ''));
      setStock(String(product.stock ?? ''));
      setCategory(product.category ?? null);

      const existingImage = product.image || (product.images?.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].image)
        : null
      );
      if (existingImage) setCurrentImage(existingImage);
      if (product.video_url) setCurrentVideo(product.video_url);
    } catch (err) {
      Alert.alert('Error', 'Could not load product details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      videoMaxDuration: 30,
    });
    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setVideoUrl(null);
    }
  };

  const handleSave = async () => {
    if (!id || isNaN(productId)) {
      Alert.alert('Error', 'Product ID is missing. Cannot update.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Validation', 'Please enter a product name.');
      return;
    }
    if (!price.trim() || isNaN(Number(price))) {
      Alert.alert('Validation', 'Please enter a valid price.');
      return;
    }
    if (!stock.trim() || isNaN(Number(stock))) {
      Alert.alert('Validation', 'Please enter a valid stock quantity.');
      return;
    }

    try {
      setSubmitting(true);

      let uploadedImage: string | null = null;
      if (imageUri) {
        uploadedImage = await uploadToCloudinary(imageUri, false);
      }

      let uploadedVideo: string | null = videoUrl;
      if (videoUri && !videoUrl) {
        uploadedVideo = await uploadToCloudinary(videoUri, true);
        setVideoUrl(uploadedVideo);
      }

      const payload: Record<string, any> = {
        name: name.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
      };

      if (description.trim()) payload.description = description.trim();
      if (category !== null) payload.category = category;
      if (uploadedImage) payload.image = uploadedImage;
      if (uploadedVideo) payload.video_url = uploadedVideo;

      await marketAPI.updateProduct(productId, payload);

      setImageUri(null);
      setCurrentImage(null);

      Alert.alert("Product Updated 🎉", "Your product details and image modifications have been synced successfully.");
      router.replace('/merchant');
    } catch (error: any) {
      const msg =
        (typeof error.response?.data === 'string' ? error.response.data.substring(0, 200) : null) ||
        error.response?.data?.message ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update product.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color="#16A34A" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {submitting && (
        <View className="absolute inset-0 z-50 bg-white/80 items-center justify-center">
          <ActivityIndicator size="large" color="#16A34A" />
          <Text className="text-gray-500 font-bold text-xs mt-3">
            Updating product...
          </Text>
        </View>
      )}

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} className="mb-4">
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>

        <Text className="text-2xl font-black text-slate-900 mb-2">Edit Product</Text>
        <Text className="text-gray-500 text-xs font-medium leading-4 mb-8">
          Update your product details below.
        </Text>

        <TouchableOpacity
          onPress={pickImage}
          className="bg-green-50 border-2 border-dashed border-green-100 rounded-3xl py-10 items-center justify-center mb-4"
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-32 h-32 rounded-2xl mb-2" />
          ) : currentImage ? (
            <Image source={{ uri: currentImage }} className="w-32 h-32 rounded-2xl mb-2" />
          ) : (
            <ImageIcon size={48} color="#9CA3AF" strokeWidth={1.5} />
          )}
          <Text className="text-gray-400 text-[11px] font-bold mt-2">Product Photo</Text>
          <View className="mt-4 border border-green-600 rounded-xl px-6 py-2">
            <Text className="text-green-600 font-black text-xs">{imageUri || currentImage ? 'Change Photo' : 'Choose Photo'}</Text>
          </View>
        </TouchableOpacity>

        {!videoUrl && !currentVideo && (
          <TouchableOpacity
            onPress={pickVideo}
            className="bg-purple-50 border-2 border-dashed border-purple-200 rounded-3xl py-6 items-center justify-center mb-8"
          >
            <Video size={36} color="#A855F7" strokeWidth={1.5} />
            <Text className="text-gray-400 text-[11px] font-bold mt-2">📹 Attach Video Ad</Text>
            <View className="mt-3 border border-purple-500 rounded-xl px-5 py-2">
              <Text className="text-purple-600 font-black text-xs">Choose Video (30s max)</Text>
            </View>
          </TouchableOpacity>
        )}

        {(videoUrl || currentVideo) && (
          <View className="flex-row items-center bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-8">
            <Video size={18} color="#A855F7" strokeWidth={1.5} />
            <Text className="text-purple-700 font-bold text-xs flex-1 ml-2" numberOfLines={1}>
              Video ad attached
            </Text>
            <TouchableOpacity
              onPress={() => { setVideoUri(null); setVideoUrl(null); setCurrentVideo(null); }}
            >
              <Text className="text-red-500 font-bold text-xs">Remove</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="mb-5">
          <Text className="text-gray-500 font-bold text-xs mb-2">Product Name</Text>
          <TextInput
            placeholder="e.g. Premium Leather Bag"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="mb-5">
          <Text className="text-gray-500 font-bold text-xs mb-2">Description</Text>
          <TextInput
            placeholder="Describe your product..."
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={{ minHeight: 100 }}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <View className="mb-5">
          <Text className="text-gray-500 font-bold text-xs mb-2">Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.id)}
                className={`mr-2 px-4 py-2.5 rounded-xl border ${
                  category === cat.id
                    ? 'bg-green-600 border-green-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    category === cat.id ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="mb-5">
          <Text className="text-gray-500 font-bold text-xs mb-2">Price (₦)</Text>
          <TextInput
            placeholder="0.00"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        <View className="mb-8">
          <Text className="text-gray-500 font-bold text-xs mb-2">Stock Quantity</Text>
          <TextInput
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
            keyboardType="numeric"
            value={stock}
            onChangeText={setStock}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSave}
          disabled={submitting}
          className={`py-5 rounded-2xl items-center mb-10 ${submitting ? 'bg-gray-300' : 'bg-green-600'}`}
        >
          <Text className="text-white text-lg font-black">
            {submitting ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

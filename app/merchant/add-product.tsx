import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ChevronLeft, Image as ImageIcon, CloudUpload, Video } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const CLOUDINARY_BASE = 'https://api.cloudinary.com/v1_1/dvj6cw5dq';
const UPLOAD_PRESET = 'gl_app_preset'; // Must be an unsigned preset in Cloudinary Dashboard

interface Category { id: number; name: string; }

const cloudinaryUpload = async (uri: string, resourceType: 'image' | 'video'): Promise<string> => {
  const normalisedUri = uri.includes('://') ? uri : `file://${uri}`;
  const mimeType = resourceType === 'video' ? 'video/mp4' : 'image/jpeg';
  const extension = resourceType === 'video' ? 'mp4' : 'jpg';

  const formData = new FormData();
  // @ts-ignore - React Native FormData accepts { uri, name, type } for file payloads
  formData.append('file', {
    uri: normalisedUri,
    name: `upload_${Date.now()}.${extension}`,
    type: mimeType,
  });
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('resource_type', resourceType);

  const response = await fetch(`${CLOUDINARY_BASE}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Upload failed');
  return data.secure_url;
};

export default function AddProduct() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get('https://glappbackend.pythonanywhere.com/api/market/categories/');
        const data = response.data;
        setCategories(Array.isArray(data) ? data : data?.results || []);
      } catch (err) {
  
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setCloudinaryUrl(null);
    }
  };

  const uploadImage = async () => {
    if (!imageUri) return;
    try {
      setUploadingImage(true);
      const url = await cloudinaryUpload(imageUri, 'image');
      setCloudinaryUrl(url);
      Alert.alert('Upload Complete', 'Image ready for submission.');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.response?.data?.error?.message || err.message || 'Could not upload image to Cloudinary.');
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadVideo = async () => {
    if (!videoUri) return;
    try {
      setUploadingVideo(true);
      const url = await cloudinaryUpload(videoUri, 'video');
      setVideoUrl(url);
      Alert.alert('Upload Complete', 'Video ready for submission.');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.response?.data?.error?.message || err.message || 'Could not upload video to Cloudinary.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      videoMaxDuration: 30,
    });
    if (!result.canceled) {
      setVideoUri(result.assets[0].uri);
      setVideoUrl(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    const token = await SecureStore.getItemAsync('accessToken');

    let videoUrlValue: string | null = videoUrl;
    if (videoUri && !videoUrl) {
      try {
        videoUrlValue = await cloudinaryUpload(videoUri, 'video');
        setVideoUrl(videoUrlValue);
      } catch {
        alert('Video upload failed. Try again.');
        setSubmitting(false);
        return;
      }
    }

    const image = cloudinaryUrl;

    const payload = {
      name: name || 'Untitled Product',
      description: description || '',
      price: parseFloat(String(price)) || 0,
      stock: parseInt(String(stock)) || 0,
      category: selectedCategoryId,
      image: image || null,
      video_url: videoUrlValue || null,
    };

    try {
      const response = await axios({
        method: 'POST',
        url: 'https://glappbackend.pythonanywhere.com/api/market/seller/products/add/',
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        timeout: 10000,
      });

      alert('Product Published!');
      router.replace('/merchant');
    } catch (error: any) {
      if (error.response) {
        alert(`Server Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        alert('Connection error: Is the server online?');
      } else {
        alert('Setup Error: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {(submitting || uploadingImage || uploadingVideo) && (
        <View className="absolute inset-0 z-50 bg-white/80 items-center justify-center">
          <ActivityIndicator size="large" color="#16A34A" />
          <Text className="text-gray-500 font-bold text-xs mt-3">
            {uploadingImage ? 'Uploading image to Cloudinary...' : uploadingVideo ? 'Uploading video to Cloudinary...' : 'Publishing your product...'}
          </Text>
        </View>
      )}

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} className="mb-4">
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>

        <Text className="text-2xl font-black text-slate-900 mb-2">Add Product</Text>
        <Text className="text-gray-500 text-xs font-medium leading-4 mb-8">
          Fill in the details below to list a new item in your store.
        </Text>

        <TouchableOpacity
          onPress={pickImage}
          className="bg-green-50 border-2 border-dashed border-green-100 rounded-3xl py-10 items-center justify-center mb-2"
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-32 h-32 rounded-2xl mb-2" />
          ) : (
            <ImageIcon size={48} color="#9CA3AF" strokeWidth={1.5} />
          )}
          <Text className="text-gray-400 text-[11px] font-bold mt-2">Upload Product Photo</Text>
          <View className="mt-4 border border-green-600 rounded-xl px-6 py-2">
            <Text className="text-green-600 font-black text-xs">Choose or Take Photo</Text>
          </View>
        </TouchableOpacity>

        {imageUri && !cloudinaryUrl && (
          <TouchableOpacity
            onPress={uploadImage}
            disabled={uploadingImage}
            className="flex-row items-center justify-center bg-green-600 rounded-xl py-3 mb-4"
          >
            <CloudUpload size={18} color="#FFFFFF" />
            <Text className="text-white font-black text-xs ml-2">
              {uploadingImage ? 'Uploading...' : 'Upload to Cloudinary'}
            </Text>
          </TouchableOpacity>
        )}

        {cloudinaryUrl && (
          <View className="flex-row items-center bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
            <Text className="text-green-700 font-bold text-xs flex-1" numberOfLines={1}>
              Image staged for publish
            </Text>
          </View>
        )}

        {!videoUrl && (
          <TouchableOpacity
            onPress={pickVideo}
            className="bg-purple-50 border-2 border-dashed border-purple-200 rounded-3xl py-6 items-center justify-center mb-2"
          >
            <Video size={36} color="#A855F7" strokeWidth={1.5} />
            <Text className="text-gray-400 text-[11px] font-bold mt-2">📹 Attach Video Ad</Text>
            <View className="mt-3 border border-purple-500 rounded-xl px-5 py-2">
              <Text className="text-purple-600 font-black text-xs">Choose Video (30s max)</Text>
            </View>
          </TouchableOpacity>
        )}

        {videoUri && !videoUrl && (
          <TouchableOpacity
            onPress={uploadVideo}
            disabled={uploadingVideo}
            className="flex-row items-center justify-center bg-purple-600 rounded-xl py-3 mb-8"
          >
            <CloudUpload size={18} color="#FFFFFF" />
            <Text className="text-white font-black text-xs ml-2">
              {uploadingVideo ? 'Uploading...' : 'Upload Video to Cloudinary'}
            </Text>
          </TouchableOpacity>
        )}

        {videoUrl && (
          <View className="flex-row items-center bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-8">
            <Video size={18} color="#A855F7" strokeWidth={1.5} />
            <Text className="text-purple-700 font-bold text-xs flex-1 ml-2" numberOfLines={1}>
              Video ad attached
            </Text>
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
          <View className="border border-gray-200 rounded-2xl overflow-hidden">
            <Picker
              selectedValue={selectedCategoryId}
              onValueChange={(itemValue) => setSelectedCategoryId(itemValue)}
            >
              {(categories || []).map((cat: Category) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
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
          onPress={handleSubmit}
          disabled={submitting}
          className={`py-5 rounded-2xl items-center mb-10 ${submitting ? 'bg-gray-300' : 'bg-green-600'}`}
        >
          <Text className="text-white text-lg font-black">
            {submitting ? 'Publishing...' : 'Publish Inventory'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { ChevronLeft, Image as ImageIcon, CloudUpload } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { marketAPI } from '@/lib/marketApi';
import { uploadToCloudinary } from '@/lib/cloudinary';

export default function EditStore() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    try {
      setLoading(true);
      const [detailRes, analyticsRes] = await Promise.all([
        marketAPI.getMyStore().catch(() => null),
        marketAPI.get('/market/merchant/analytics/').catch(() => null),
      ]);

      const store = detailRes || analyticsRes?.data || {};
      setName(store.name || store.shop_name || '');
      setDescription(store.description || '');
      if (store.logo || store.logo_url) {
        const logo = store.logo || store.logo_url;
        setCurrentLogo(logo);
      }
    } catch {
      Alert.alert('Error', 'Could not load store details.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
      setCloudinaryUrl(null);
    }
  };

  const uploadLogo = async () => {
    if (!logoUri) return;
    try {
      setUploadingLogo(true);
      const url = await uploadToCloudinary(logoUri, false);
      setCloudinaryUrl(url);
      Alert.alert('Upload Complete', 'Logo ready for save.');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message || 'Could not upload logo to Cloudinary.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Store name is required.');
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, any> = {
        name: name.trim(),
        description: description.trim(),
      };

      if (cloudinaryUrl) {
        payload.logo = cloudinaryUrl;
      }

      await marketAPI.updateStore(payload);
      Alert.alert('Saved', 'Store details updated successfully!');
      router.back();
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Failed to update store.';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
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
      {(saving || uploadingLogo) && (
        <View className="absolute inset-0 z-50 bg-white/80 items-center justify-center">
          <ActivityIndicator size="large" color="#16A34A" />
          <Text className="text-gray-500 font-bold text-xs mt-3">
            {uploadingLogo ? 'Uploading logo to Cloudinary...' : 'Saving store details...'}
          </Text>
        </View>
      )}

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} className="mb-4">
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>

        <Text className="text-2xl font-black text-slate-900 mb-2">Edit Store</Text>
        <Text className="text-gray-500 text-xs font-medium leading-4 mb-8">
          Update your store name, description, and logo.
        </Text>

        <TouchableOpacity
          onPress={pickLogo}
          className="bg-green-50 border-2 border-dashed border-green-100 rounded-3xl py-10 items-center justify-center mb-2"
        >
          {logoUri ? (
            <Image source={{ uri: logoUri }} className="w-32 h-32 rounded-2xl mb-2" />
          ) : currentLogo ? (
            <Image source={{ uri: currentLogo }} className="w-32 h-32 rounded-2xl mb-2" />
          ) : (
            <ImageIcon size={48} color="#9CA3AF" strokeWidth={1.5} />
          )}
          <Text className="text-gray-400 text-[11px] font-bold mt-2">Store Logo</Text>
          <View className="mt-4 border border-green-600 rounded-xl px-6 py-2">
            <Text className="text-green-600 font-black text-xs">Choose Photo</Text>
          </View>
        </TouchableOpacity>

        {logoUri && !cloudinaryUrl && (
          <TouchableOpacity
            onPress={uploadLogo}
            disabled={uploadingLogo}
            className="flex-row items-center justify-center bg-green-600 rounded-xl py-3 mb-8"
          >
            <CloudUpload size={18} color="#FFFFFF" />
            <Text className="text-white font-black text-xs ml-2">
              {uploadingLogo ? 'Uploading...' : 'Upload to Cloudinary'}
            </Text>
          </TouchableOpacity>
        )}

        {cloudinaryUrl && (
          <View className="flex-row items-center bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-8">
            <Text className="text-green-700 font-bold text-xs flex-1" numberOfLines={1}>
              New logo staged for save
            </Text>
          </View>
        )}

        <View className="mb-5">
          <Text className="text-gray-500 font-bold text-xs mb-2">Store Name</Text>
          <TextInput
            placeholder="Your store name"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="mb-8">
          <Text className="text-gray-500 font-bold text-xs mb-2">Description</Text>
          <TextInput
            placeholder="Describe your store..."
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

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSave}
          disabled={saving}
          className={`py-5 rounded-2xl items-center mb-10 ${saving ? 'bg-gray-300' : 'bg-green-600'}`}
        >
          <Text className="text-white text-lg font-black">
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

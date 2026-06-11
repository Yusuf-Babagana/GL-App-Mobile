import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useOnboarding } from '@/context/OnboardingContext';
import { marketAPI } from '../../lib/marketApi';

export default function ReviewSubmit() {
  const router = useRouter();
  const { onboardingData, setIsSubmitted } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);

  const handleFinalUploadSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Initialize multi-part FormData container
      const formData = new FormData();

      // Append Step 1 Text Context Metrics
      formData.append('owner_name', onboardingData.personal.name);
      formData.append('owner_email', onboardingData.personal.email);
      formData.append('owner_phone', onboardingData.personal.phone);
      formData.append('id_type', onboardingData.personal.idType);
      formData.append('id_number', onboardingData.personal.idNumber);

      // Append Step 2 Text Metrics
      formData.append('shop_name', onboardingData.shop.shopName);
      formData.append('shop_type', onboardingData.shop.shopType);
      formData.append('business_phone', onboardingData.shop.businessPhone);
      formData.append('shop_address', onboardingData.shop.shopAddress);
      formData.append('state', onboardingData.shop.state || 'Nigeria');
      formData.append('registered', onboardingData.shop.registered);
      formData.append('cac_number', onboardingData.shop.cacNumber || '');

      // --- 🆔 STEP 1: FIX NATIVE ID IMAGE BINARY STREAM PACKING ---
      if (onboardingData.personal.idImage) {
        const idUri = onboardingData.personal.idImage;
        
        // Ensure the file name is safely parsed out
        const idFilename = idUri.split('/').pop() || 'id_verification.jpg';
        
        // Extract file extension to dynamically match MIME type mappings
        const match = /\.(\w+)$/.exec(idFilename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        // We typecast as 'any' using an explicit React Native multi-part Form File footprint
        formData.append('id_image', {
          uri: idUri,
          name: idFilename,
          type: type,
        } as any);
      }

      // --- 🏪 STEP 2: FIX SHOP LOGO BINARY STREAM PACKING ---
      if (onboardingData.shop.logo) {
        const logoUri = onboardingData.shop.logo;
        const logoFilename = logoUri.split('/').pop() || 'shop_logo.jpg';
        const match = /\.(\w+)$/.exec(logoFilename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('logo', {
          uri: logoUri,
          name: logoFilename,
          type: type,
        } as any);
      }

      const res = await marketAPI.post('/market/store/global-onboard/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.status === 'exists') {
        router.replace('/merchant');
        return;
      }

      if (res.data.status === 'success') {
        setIsSubmitted(true);
        Alert.alert("Success 🎉", "Your application has been received! Access will open once the administrator activates your profile.", [
          { text: "Got It", onPress: () => router.replace('/merchant') }
        ]);
      }
    } catch (error: any) {
      const serverMsg = error.response?.data?.message || "File network transmission exception occurred.";
      Alert.alert("Submission Failed", serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-8 pt-12" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between mb-2">
          <View className="h-1 w-[32%] bg-green-600 rounded-full" />
          <View className="h-1 w-[32%] bg-green-600 rounded-full" />
          <View className="h-1 w-[32%] bg-green-600 rounded-full" />
        </View>
        <Text className="text-right text-gray-400 text-[10px] font-bold mb-6">Step 3</Text>

        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ChevronLeft size={24} color="#000000" />
        </TouchableOpacity>

        <Text className="text-2xl font-black text-black mb-1">Review Details</Text>
        <Text className="text-gray-400 text-xs font-semibold mb-6">Please confirm everything looks correct before submitting.</Text>

        {/* Informative Summary Board */}
        <View className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8 space-y-3">
          <Text className="text-gray-900 font-bold text-sm">🏪 Shop: {onboardingData?.shop?.shopName}</Text>
          <Text className="text-gray-500 font-semibold text-xs">👤 Applicant: {onboardingData?.personal?.name}</Text>
          <Text className="text-gray-500 font-semibold text-xs">📞 Contact: {onboardingData?.shop?.businessPhone}</Text>
          <Text className="text-gray-500 font-semibold text-xs">📍 Address: {onboardingData?.shop?.shopAddress}</Text>
          <Text className="text-gray-500 font-semibold text-xs">📜 Registered Business: {onboardingData?.shop?.registered?.toUpperCase()}</Text>
        </View>

        {submitting ? (
          <ActivityIndicator size="large" color="#16A34A" className="my-4" />
        ) : (
          <TouchableOpacity onPress={handleFinalUploadSubmit} className="bg-green-600 py-5 rounded-2xl items-center mb-12">
            <Text className="text-white text-lg font-black">Submit Application</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

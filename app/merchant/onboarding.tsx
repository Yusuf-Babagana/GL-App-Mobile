import React, { useState } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useOnboarding } from '@/context/OnboardingContext';
import Checkbox from 'expo-checkbox';

export default function MerchantOnboarding() {
  const router = useRouter();
  const { onboardingData, updateShop } = useOnboarding();
  const [shopName, setShopName] = useState(onboardingData.shop.name);
  const [isChecked, setChecked] = useState(false);

  const handleContinue = () => {
    updateShop({ name: shopName });
    router.push('/merchant/categories');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-8 pt-12">
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <ChevronLeft size={28} color="#000000" />
        </TouchableOpacity>

        {/* Header Text */}
        <Text className="text-3xl font-black text-black mb-2">Welcome to</Text>
        <Text className="text-2xl font-black text-black mb-8">GLAPP Market Place</Text>

        {/* 3D Illustration - Using your logic/local asset */}
        <View className="items-center justify-center my-10">
          <Image 
            source={require('@/assets/images/gl.jpeg')}
            style={{ width: 280, height: 280 }}
            resizeMode="contain"
          />
        </View>

        {/* "Lets Get Started" Section */}
        <View className="items-center mb-10">
          <Text className="text-2xl font-black text-black mb-4">Lets Get Started</Text>
          <Text className="text-gray-400 text-center text-sm leading-5 px-4 font-medium">
            Enjoy seamless payments and fast, reliable delivery straight to your door
          </Text>
        </View>

        {/* Shop Name Input */}
        <View className="mb-6">
          <TextInput
            placeholder="Enter your shop name"
            placeholderTextColor="#9CA3AF"
            value={shopName}
            onChangeText={setShopName}
            className="w-full bg-white border border-gray-200 rounded-2xl p-5 text-base font-bold text-black shadow-sm"
          />
        </View>

        {/* Terms & Conditions */}
        <View className="flex-row items-center mb-10 px-2">
          <Checkbox
            value={isChecked}
            onValueChange={setChecked}
            color={isChecked ? '#000000' : undefined}
            style={{ borderRadius: 4, width: 20, height: 20 }}
          />
          <Text className="ml-3 text-[12px] text-gray-500 font-bold flex-1 leading-4">
            I've read and agree with the{' '}
            <Text className="text-[#4ADE80] underline">Terms and Conditions</Text>
            {' '}and the{' '}
            <Text className="text-[#4ADE80] underline">Privacy Policy.</Text>
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          disabled={!isChecked || !shopName}
          onPress={handleContinue} // Next step: Category Selection
          style={{ 
            backgroundColor: (isChecked && shopName) ? '#E5E7EB' : '#F3F4F6', // Using the light gray from your image
            paddingVertical: 20,
            borderRadius: 20,
            alignItems: 'center',
            marginBottom: 40
          }}
        >
          <Text className={`text-lg font-black ${(isChecked && shopName) ? 'text-black' : 'text-gray-300'}`}>
            Continue
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

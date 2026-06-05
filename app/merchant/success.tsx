import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';

export default function MerchantSuccess() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white items-center justify-center px-10">
      {/* 🔵 Verified/Success Icon Container */}
      <View className="w-40 h-40 bg-green-50 rounded-full items-center justify-center mb-10">
        <View className="bg-green-600 p-6 rounded-3xl rotate-12">
            {/* The custom wavy verified check from your image */}
            <CheckCircle size={60} color="white" strokeWidth={3} />
        </View>
      </View>

      <Text className="text-3xl font-black text-black mb-6">Success!</Text>
      
      <Text className="text-gray-400 text-center text-sm font-medium leading-5 mb-2">
        Your information has been submitted.
      </Text>
      <Text className="text-gray-400 text-center text-sm font-medium leading-5 mb-14">
        we will review your submission and send feedback to your email
      </Text>

      {/* Continue Button */}
      <TouchableOpacity
        onPress={() => router.push('/')}
        className="bg-green-600 w-full py-5 rounded-2xl items-center"
      >
        <Text className="text-white font-black text-lg">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

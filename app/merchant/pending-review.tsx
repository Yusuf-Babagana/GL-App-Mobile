import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext'; // To get the user's real name
import { Handshake } from 'lucide-react-native';

export default function PendingReview() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View className="flex-1 bg-white items-center justify-center px-8">
      
      {/* 🤝 Handshake Illustration Container */}
      <View className="w-64 h-64 items-center justify-center mb-12">
        <View className="absolute w-40 h-40 bg-green-50 rounded-full opacity-60" />
        <Handshake size={120} color="#329629" strokeWidth={1.5} />
      </View>

      <View className="items-center mb-20">
        <Text className="text-4xl font-black text-black mb-2">Hello!</Text>
        <Text className="text-2xl font-bold text-gray-800 mb-8">
          {user?.first_name || 'Welcome'}
        </Text>
        
        <Text className="text-gray-400 text-center text-base font-medium leading-6 mb-2">
          Kindly exercise patience as we are
        </Text>
        <Text className="text-gray-400 text-center text-base font-medium leading-6 mb-10">
          reviewing your submission.
        </Text>

        <Text className="text-gray-500 text-center text-base font-black">
          Your seller profile will be ready soon.
        </Text>
      </View>

      {/* Primary Action Button */}
      <TouchableOpacity
        onPress={() => router.push('/')}
        className="bg-green-600 w-full py-5 rounded-2xl items-center shadow-lg shadow-green-200"
      >
        <Text className="text-white font-black text-lg">Go Back to Feeds</Text>
      </TouchableOpacity>
    </View>
  );
}

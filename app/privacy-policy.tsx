import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

const PRIVACY_URL = 'https://yusuf-babagana.github.io/glapp-privacy-policy/';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white border-b border-gray-100 px-6 pt-12 pb-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full active:bg-gray-50">
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Privacy Policy</Text>
      </View>

      <WebView
        source={{ uri: PRIVACY_URL }}
        startInLoadingState
        renderLoading={() => (
          <View className="absolute inset-0 items-center justify-center bg-white">
            <ActivityIndicator size="large" color="#329629" />
            <Text className="text-gray-500 mt-4">Loading privacy policy...</Text>
          </View>
        )}
      />
    </View>
  );
}

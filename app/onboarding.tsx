import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "expo-router";
import React from "react";
import { Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
    const { completeOnboarding } = useAuth();
    const router = useRouter();

    const handleFinish = async () => {
        await completeOnboarding();
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-10 justify-center items-center">
                <Image
                    source={require('@/assets/images/gl.jpeg')}
                    className="w-40 h-40 rounded-3xl mb-8"
                    resizeMode="contain"
                />
                <Text className="text-3xl font-black text-slate-900 text-center tracking-tight">
                    Welcome to GlApp
                </Text>
            </View>

            <View className="px-10 pb-10 pt-4">
                <Button
                    title="Get Started"
                    onPress={handleFinish}
                    size="lg"
                    className="shadow-xl shadow-primary/30"
                />
            </View>
        </SafeAreaView>
    );
}
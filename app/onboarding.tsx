import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const slides = [
    {
        id: "1",
        title: "Premium Marketplace",
        description: "Discover high-quality products from verified Globalink merchants in Kano and beyond.",
        icon: "cart",
        color: "#329629", // Globalink Primary Green
    },
    {
        id: "2",
        title: "Swift Logistics",
        description: "Our dedicated Globalink Riders ensure your orders reach your doorstep safely.",
        icon: "bicycle",
        color: "#1E293B", // Secondary Slate
    },
    {
        id: "3",
        title: "Globalink Merchant",
        description: "Open your own store, manage your inventory, and scale your business today.",
        icon: "storefront",
        color: "#F59E0B", // Accent Amber
    },
];

export default function OnboardingScreen() {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { completeOnboarding } = useAuth();
    const router = useRouter();

    const handleFinish = async () => {
        await completeOnboarding();
    };

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            handleFinish();
        }
    };

    const slide = slides[currentSlide];

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-10 justify-center items-center">

                {/* Modern Icon Container */}
                <View
                    style={{ backgroundColor: slide.color + '10' }}
                    className="w-44 h-44 rounded-[60px] items-center justify-center mb-12 shadow-sm"
                >
                    <Ionicons name={slide.icon as any} size={80} color={slide.color} />
                </View>

                <Text className="text-4xl font-black text-slate-900 text-center mb-4 tracking-tighter">
                    {slide.title}
                </Text>
                <Text className="text-slate-500 text-center text-lg leading-6 px-4 font-medium">
                    {slide.description}
                </Text>

                {/* Dynamic Progress Dots */}
                <View className="flex-row mt-12">
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            className={`h-1.5 rounded-full mx-1 transition-all duration-300 ${index === currentSlide ? "w-10 bg-primary" : "w-2 bg-slate-200"
                                }`}
                        />
                    ))}
                </View>
            </View>

            {/* Action Footer */}
            <View className="px-10 pb-10 pt-4">
                <Button
                    title={currentSlide === slides.length - 1 ? "Start Shopping" : "Continue"}
                    onPress={nextSlide}
                    size="lg"
                    className="shadow-xl shadow-primary/30"
                />

                {currentSlide < slides.length - 1 && (
                    <Button
                        title="Skip Tour"
                        onPress={handleFinish}
                        variant="ghost"
                        className="mt-4"
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
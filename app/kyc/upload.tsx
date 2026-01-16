import { marketAPI } from "@/lib/marketApi"; // Or wherever you put the submitKYC function
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function KYCUploadScreen() {
    const router = useRouter();
    const [idImage, setIdImage] = useState<string | null>(null);
    const [selfie, setSelfie] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const pickImage = async (setImage: (uri: string) => void) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!idImage || !selfie) {
            Alert.alert("Missing Documents", "Please upload both your ID and a Selfie.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            // @ts-ignore
            formData.append('id_document_image', {
                uri: idImage,
                name: 'id_card.jpg',
                type: 'image/jpeg',
            });
            // @ts-ignore
            formData.append('selfie_image', {
                uri: selfie,
                name: 'selfie.jpg',
                type: 'image/jpeg',
            });
            formData.append('id_document_type', 'national_id'); // Default for now

            // Call the API function we created in Step 2
            // Note: Make sure marketAPI includes submitKYC, or import api directly
            await marketAPI.submitKYC(formData);

            Alert.alert("Success", "Documents submitted! Admin will review shortly.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert("Upload Failed", e.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white px-6 pt-12">
            <TouchableOpacity onPress={() => router.back()} className="mb-6">
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text className="text-2xl font-bold mb-2">Verify Identity</Text>
            <Text className="text-gray-500 mb-8">To prevent fraud, we need to verify who you are. Please upload a clear photo of your ID and a selfie.</Text>

            {/* ID UPLOAD */}
            <Text className="font-bold mb-2">1. Government ID</Text>
            <TouchableOpacity
                onPress={() => pickImage(setIdImage)}
                className="h-48 bg-gray-100 rounded-2xl items-center justify-center mb-6 border-2 border-dashed border-gray-300 overflow-hidden"
            >
                {idImage ? (
                    <Image source={{ uri: idImage }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="items-center">
                        <Ionicons name="card-outline" size={32} color="gray" />
                        <Text className="text-gray-400 mt-2">Tap to upload ID</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* SELFIE UPLOAD */}
            <Text className="font-bold mb-2">2. Take a Selfie</Text>
            <TouchableOpacity
                onPress={() => pickImage(setSelfie)}
                className="h-48 bg-gray-100 rounded-2xl items-center justify-center mb-8 border-2 border-dashed border-gray-300 overflow-hidden"
            >
                {selfie ? (
                    <Image source={{ uri: selfie }} className="w-full h-full" resizeMode="cover" />
                ) : (
                    <View className="items-center">
                        <Ionicons name="camera-outline" size={32} color="gray" />
                        <Text className="text-gray-400 mt-2">Tap to upload Selfie</Text>
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#1DB954] py-4 rounded-xl items-center shadow-lg shadow-green-200 mb-10"
            >
                {isSubmitting ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold text-lg">Submit for Review</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SetupStoreScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleCreateStore = async () => {
        if (!name || !description) {
            Alert.alert("Error", "Please fill in your store name and description.");
            return;
        }

        setIsLoading(true);
        try {
            await marketAPI.createStore({ name, description, image });
            Alert.alert("Success", "Your store is live! You can now add products.");
            // Navigate to the Dashboard (we will build this next)
            router.replace("/seller/dashboard");
        } catch (error: any) {
            Alert.alert("Error", error.error || "Could not create store.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-6">
            <View className="py-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Open Your Store</Text>
            </View>

            <View className="mt-6">
                <Text className="font-bold text-gray-700 mb-2">Store Logo (Optional)</Text>
                <TouchableOpacity onPress={pickImage} className="w-24 h-24 bg-gray-100 rounded-xl items-center justify-center mb-6 border border-gray-300 border-dashed">
                    {image ? (
                        <Image source={{ uri: image }} className="w-full h-full rounded-xl" />
                    ) : (
                        <Ionicons name="camera" size={30} color="gray" />
                    )}
                </TouchableOpacity>

                <Text className="font-bold text-gray-700 mb-2">Store Name</Text>
                <TextInput
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4"
                    placeholder="e.g. Kano Textiles Ltd"
                    value={name}
                    onChangeText={setName}
                />

                <Text className="font-bold text-gray-700 mb-2">Description</Text>
                <TextInput
                    className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-32 mb-6"
                    placeholder="Tell buyers what you sell..."
                    multiline
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                />

                <TouchableOpacity
                    onPress={handleCreateStore}
                    disabled={isLoading}
                    className="bg-[#1DB954] py-4 rounded-xl items-center shadow-lg shadow-green-200"
                >
                    {isLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Create Store</Text>}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
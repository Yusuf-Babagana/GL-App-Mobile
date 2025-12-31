import SafeScreen from "@/components/SafeScreen";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function CreateStoreScreen() {
    const [form, setForm] = useState({ name: "", description: "" });
    const [logo, setLogo] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setLogo(result.assets[0].uri);
        }
    };

    const handleCreateStore = async () => {
        if (!form.name || !form.description) {
            return Alert.alert("Missing Fields", "Please enter a store name and description.");
        }

        setIsLoading(true);
        try {
            // 1. Prepare Form Data (Multipart for Image)
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("description", form.description);

            if (logo) {
                const filename = logo.split("/").pop();
                const match = /\.(\w+)$/.exec(filename || "");
                const type = match ? `image/${match[1]}` : `image`;

                // @ts-ignore
                formData.append("logo", { uri: logo, name: filename, type });
            }

            // 2. Send Request
            await api.post("/market/store/create/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            Alert.alert("Success", "Your store has been created!", [
                { text: "Go to Dashboard", onPress: () => router.replace("/seller/dashboard") }
            ]);

        } catch (error: any) {
            console.log("Create Store Error:", error.response?.data);
            Alert.alert("Error", "Failed to create store. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeScreen>
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Open Your Store</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                {/* Logo Upload */}
                <View className="items-center mb-8">
                    <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
                        {logo ? (
                            <Image source={{ uri: logo }} className="w-32 h-32 rounded-full border-2 border-gray-200" />
                        ) : (
                            <View className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center border-2 border-dashed border-gray-300">
                                <Ionicons name="camera" size={32} color="#9CA3AF" />
                                <Text className="text-xs text-gray-500 mt-1">Add Logo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Form */}
                <View className="gap-4">
                    <View>
                        <Text className="text-gray-700 font-medium mb-1 ml-1">Store Name</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-base"
                            placeholder="e.g. Ali's Electronics"
                            value={form.name}
                            onChangeText={(t) => setForm({ ...form, name: t })}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-1 ml-1">Description</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-base h-32"
                            placeholder="Tell us about your store..."
                            multiline
                            textAlignVertical="top"
                            value={form.description}
                            onChangeText={(t) => setForm({ ...form, description: t })}
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-[#1DB954] py-4 rounded-xl items-center mt-4"
                        onPress={handleCreateStore}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Create Store</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeScreen>
    );
}
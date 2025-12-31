import SafeScreen from "@/components/SafeScreen";
import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddProductScreen() {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "1", // Default category ID for now (Make sure ID 1 exists in backend or change logic)
    });
    const [images, setImages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Pick multiple images
    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 0.5,
        });

        if (!result.canceled) {
            setImages([...images, ...result.assets.map((asset) => asset.uri)]);
        }
    };

    const handleCreateProduct = async () => {
        if (!form.name || !form.price || !form.description || images.length === 0) {
            return Alert.alert("Missing Fields", "Please fill all fields and add at least one image.");
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("description", form.description);
            formData.append("price", form.price);
            formData.append("stock", form.stock || "1");
            formData.append("category", form.category);

            // Append images
            images.forEach((uri, index) => {
                const filename = uri.split("/").pop();
                const match = /\.(\w+)$/.exec(filename || "");
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                // @ts-ignore
                formData.append("uploaded_images", { uri, name: filename, type });
            });

            await api.post("/market/seller/products/create/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            Alert.alert("Success", "Product added successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (error: any) {
            console.log("Upload Error:", error.response?.data);
            Alert.alert("Error", "Failed to upload product.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeScreen>
            <View className="px-4 py-3 border-b border-gray-100 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4">Add New Product</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                {/* Image Picker */}
                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-2">Product Images</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={pickImages}
                            className="w-24 h-24 bg-gray-100 rounded-xl items-center justify-center border-2 border-dashed border-gray-300"
                        >
                            <Ionicons name="camera" size={30} color="#9CA3AF" />
                            <Text className="text-xs text-gray-500 mt-1">Add</Text>
                        </TouchableOpacity>

                        {images.map((uri, index) => (
                            <View key={index} className="relative">
                                <Image source={{ uri }} className="w-24 h-24 rounded-xl" />
                                <TouchableOpacity
                                    onPress={() => setImages(images.filter((_, i) => i !== index))}
                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                                >
                                    <Ionicons name="close" size={12} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Inputs */}
                <View className="gap-4 pb-10">
                    <View>
                        <Text className="text-gray-700 font-medium mb-1">Product Name</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                            placeholder="e.g. Wireless Headphones"
                            value={form.name}
                            onChangeText={(t) => setForm({ ...form, name: t })}
                        />
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-gray-700 font-medium mb-1">Price (₦)</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={form.price}
                                onChangeText={(t) => setForm({ ...form, price: t })}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-700 font-medium mb-1">Stock</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                                placeholder="Qty"
                                keyboardType="numeric"
                                value={form.stock}
                                onChangeText={(t) => setForm({ ...form, stock: t })}
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-1">Description</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-32"
                            placeholder="Describe your product..."
                            multiline
                            textAlignVertical="top"
                            value={form.description}
                            onChangeText={(t) => setForm({ ...form, description: t })}
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-[#1DB954] py-4 rounded-xl items-center mt-4"
                        onPress={handleCreateProduct}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Publish Product</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeScreen>
    );
}
import api from "@/lib/api";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddProductScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [stock, setStock] = useState("");
    const [category, setCategory] = useState<number | null>(null);
    const [image, setImage] = useState<string | null>(null);

    // Data State
    const [categories, setCategories] = useState<any[]>([]);

    // 1. Fetch Categories on Load
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get("/market/categories/");
                setCategories(res.data);
                if (res.data.length > 0) setCategory(res.data[0].id);
            } catch (e) {
                console.log("Could not fetch categories, defaulting to 1");
                setCategory(1);
            }
        };
        fetchCategories();
    }, []);

    // 2. Pick Image Function (Updated to remove deprecation warning)
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Use modern array syntax
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // 3. Updated Submit Function with Cloudinary and JSON payload
    const handleSubmit = async () => {
        if (!name || !price || !description || !stock || !image) {
            Alert.alert("Missing Fields", "Please fill all fields and add an image.");
            return;
        }

        setIsLoading(true);

        try {
            // STEP 1: Upload the local image to Cloudinary
            const cloudinaryUrl = await uploadToCloudinary(image);

            // STEP 2: Prepare the JSON payload
            // Using parseFloat and parseInt ensures correct data types for the backend
            const productData = {
                name,
                description,
                price: parseFloat(price),
                stock: parseInt(stock),
                currency: "NGN",
                category: category || 1,
                cloudinary_url: cloudinaryUrl, // The backend serializer extracts this
            };

            // STEP 3: Send to Backend as JSON 
            // We no longer use FormData or "Content-Type": "multipart/form-data"
            await api.post("/market/seller/products/create/", productData);

            Alert.alert("Success", "Product added successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);

        } catch (error: any) {
            console.log("Upload Error:", error.response?.data || error);
            const errorMsg = error.response?.data
                ? JSON.stringify(error.response.data)
                : "Failed to upload product. Check your connection.";
            Alert.alert("Error", errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 rounded-full mr-4">
                    <Ionicons name="arrow-back" size={20} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Add New Product</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6" showsVerticalScrollIndicator={false}>

                {/* Image Picker */}
                <TouchableOpacity
                    onPress={pickImage}
                    className="w-full h-48 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 items-center justify-center mb-6 overflow-hidden"
                >
                    {image ? (
                        <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <>
                            <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
                            <Text className="text-gray-400 mt-2 font-medium">Tap to upload image</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Form Fields */}
                <View className="gap-4 mb-10">
                    <View>
                        <Text className="text-gray-700 font-medium mb-1 ml-1">Product Name</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                            placeholder="e.g. iPhone 15 Pro"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-gray-700 font-medium mb-1 ml-1">Price (₦)</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                                placeholder="0.00"
                                keyboardType="numeric"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-700 font-medium mb-1 ml-1">Stock</Text>
                            <TextInput
                                className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                                placeholder="Qty"
                                keyboardType="numeric"
                                value={stock}
                                onChangeText={setStock}
                            />
                        </View>
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-1 ml-1">Description</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-32"
                            placeholder="Describe your product..."
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    {/* Category Selector */}
                    {categories.length > 0 && (
                        <View>
                            <Text className="text-gray-700 font-medium mb-2 ml-1">Category</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.id}
                                        onPress={() => setCategory(cat.id)}
                                        className={`px-4 py-2 rounded-full border ${category === cat.id ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                                    >
                                        <Text className={category === cat.id ? 'text-white' : 'text-gray-700'}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isLoading}
                        className="bg-[#1DB954] py-4 rounded-full items-center mt-4 shadow-lg shadow-green-200"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Create Listing</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
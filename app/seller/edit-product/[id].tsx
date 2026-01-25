import api from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";

export default function EditProductScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [form, setForm] = useState({ name: "", price: "", description: "", stock: "" });
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/market/products/${id}/`);
            setForm({
                name: res.data.name,
                price: res.data.price.toString(),
                description: res.data.description,
                stock: res.data.stock.toString(),
            });
            // Handle image preview
            const img = res.data.images?.[0]?.image;
            if (img) setImage(img.startsWith('http') ? img : `http://172.20.10.7:8000/media/${img}`);
            setLoading(false);
        } catch (e) {
            Alert.alert("Error", "Could not load product details.");
            router.back();
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            let cloudinaryUrl = image;

            // Logic: If the image is a local 'file://' URI, upload it to Cloudinary first
            if (image && image.startsWith('file://')) {
                // You would call your existing Cloudinary upload helper here
                // const cloudRes = await uploadToCloudinary(image);
                // cloudinaryUrl = cloudRes.secure_url;
            }

            await api.patch(`/market/seller/products/${id}/update/`, {
                ...form,
                // Send the new Cloudinary URL to the CharField 'image' in backend
                image: cloudinaryUrl
            });

            Alert.alert("Success", "Product updated!");
            router.replace("/(tabs)");
        } catch (e) {
            Alert.alert("Error", "Update failed. Ensure you are the owner.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" className="flex-1" />;

    return (
        <ScrollView className="flex-1 bg-white p-6">
            <Text className="text-2xl font-black mb-6">Edit Product</Text>

            <TouchableOpacity onPress={pickImage} className="w-full h-64 bg-gray-100 rounded-3xl overflow-hidden mb-6 items-center justify-center border-2 border-dashed border-gray-300">
                {image ? <Image source={{ uri: image }} className="w-full h-full" /> : <Ionicons name="camera" size={40} color="#9CA3AF" />}
            </TouchableOpacity>

            <TextInput className="bg-gray-50 p-4 rounded-2xl mb-4 font-semibold" placeholder="Product Name" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />
            <TextInput className="bg-gray-50 p-4 rounded-2xl mb-4 font-semibold" placeholder="Price (₦)" keyboardType="numeric" value={form.price} onChangeText={(t) => setForm({ ...form, price: t })} />
            <TextInput className="bg-gray-50 p-4 rounded-2xl mb-4 font-semibold h-32" placeholder="Description" multiline value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} />

            <TouchableOpacity
                onPress={handleUpdate}
                disabled={updating}
                className="bg-gray-900 p-5 rounded-2xl items-center shadow-lg"
            >
                <Text className="text-white font-bold text-lg">{updating ? "Saving Changes..." : "Update Product"}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
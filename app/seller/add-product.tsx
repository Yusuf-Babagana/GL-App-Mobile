import { uploadToCloudinary } from "@/lib/cloudinary";
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
// import { MediaType } from "expo-image-picker"; // Trying to use string literals instead for safety
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function AddProductScreen() {
    const router = useRouter();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        video: null as string | null,
        images: [] as string[],
        is_ad: false, // NEW: Controlled by the toggle
    });

    const pickImages = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "We need access to your gallery to upload photos.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'] as any, // Lowercase is standard
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                const selectedUris = result.assets.map(asset => asset.uri);
                setForm({ ...form, images: [...form.images, ...selectedUris] });
            }
        } catch (error) {
            Alert.alert("Error", "Could not open image picker");
        }
    };

    const pickVideo = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "We need access to your gallery to upload videos.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['videos'] as any, // Lowercase is standard
                allowsEditing: false,
                aspect: [9, 16],
                quality: 1,
            });

            if (!result.canceled) {
                setForm({ ...form, video: result.assets[0].uri, is_ad: true });
            }
        } catch (error) {
            Alert.alert("Error", "Could not open video picker: " + (error as any).message);
        }
    };

    const handleSubmit = async () => {
        if (!form.name || !form.price || !form.description || form.images.length === 0) {
            Alert.alert("Missing Info", "Please add a name, price, description, and at least one image.");
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(10); // Start

            // Step 1: Upload Images to Cloudinary
            const imageUrls = await Promise.all(
                form.images.map(uri => uploadToCloudinary(uri, false))
            );
            setUploadProgress(40); // Images done

            // Step 2: Upload Video to Cloudinary (If exists)
            let videoUrl = null;
            if (form.video) {
                setUploadProgress(50); // Starting video
                videoUrl = await uploadToCloudinary(form.video, true);
                setUploadProgress(90); // Video finished
            }

            // Step 3: Send URLs to your Django Backend
            const payload = {
                ...form,
                images: imageUrls, // Now an array of URLs, not files
                video_url: videoUrl,
                is_ad: !!videoUrl, // Automatically mark as ad if video exists
            };

            await marketAPI.addProduct(payload);

            setUploadProgress(100);
            Alert.alert("Globalink", "Product Launched Worldwide!");
            router.back();
        } catch (e: any) {
            Alert.alert("Upload Failed", e.message || "An error occurred");
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white px-6 pt-12">
            <View className="flex-row items-center justify-between mb-6">
                <Text className="text-3xl font-black text-slate-900">New Product</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="close-circle" size={32} color="#CBD5E1" />
                </TouchableOpacity>
            </View>

            {/* --- Ad Visibility Toggle --- */}
            {form.video && (
                <View className="bg-emerald-50 p-5 rounded-[32px] border border-emerald-100 flex-row items-center justify-between mb-8">
                    <View className="flex-1 pr-4">
                        <Text className="text-emerald-900 font-black text-base">Global Discovery</Text>
                        <Text className="text-emerald-600/70 text-xs font-medium">Show this video in the Live Ads feed to reach more customers.</Text>
                    </View>
                    <Switch
                        trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                        thumbColor="white"
                        onValueChange={(val) => setForm({ ...form, is_ad: val })}
                        value={form.is_ad}
                    />
                </View>
            )}

            {/* --- Media Pickers --- */}
            <Text className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-4">Media Assets</Text>
            <View className="flex-row mb-8">
                <TouchableOpacity
                    onPress={pickImages}
                    className="w-20 h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl items-center justify-center mr-4"
                >
                    <Ionicons name="images" size={24} color={form.images.length > 0 ? "#10B981" : "#94A3B8"} />
                    {/* Optional: Show count if images are selected */}
                    {form.images.length > 0 && (
                        <View className="absolute -top-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full items-center justify-center border-2 border-white">
                            <Text className="text-white text-[10px] font-black">{form.images.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={pickVideo}
                    className={`w-20 h-20 border-2 border-dashed rounded-3xl items-center justify-center ${form.video ? 'bg-slate-900 border-slate-900' : 'bg-slate-50 border-slate-200'}`}
                >
                    <Ionicons name="videocam" size={24} color={form.video ? "white" : "#94A3B8"} />
                </TouchableOpacity>
            </View>

            {/* --- Form Fields --- */}
            <TextInput
                placeholder="Product Title"
                className="bg-slate-50 p-5 rounded-2xl mb-4 font-bold"
                onChangeText={(t) => setForm(prev => ({ ...prev, name: t }))}
            />
            <TextInput
                placeholder="Price"
                keyboardType="numeric"
                className="bg-slate-50 p-5 rounded-2xl mb-4 font-bold"
                onChangeText={(t) => setForm(prev => ({ ...prev, price: t }))}
            />
            <TextInput
                placeholder="Description"
                multiline
                numberOfLines={4}
                className="bg-slate-50 p-5 rounded-2xl mb-10 font-medium"
                onChangeText={(t) => setForm(prev => ({ ...prev, description: t }))}
            />

            {/* Upload Progress Bar */}
            {isUploading && (
                <View className="mb-6 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-slate-900 font-black text-xs uppercase">Uploading Media...</Text>
                        <Text className="text-emerald-600 font-black text-xs">{uploadProgress}%</Text>
                    </View>
                    <View className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <View
                            style={{ width: `${uploadProgress}%` }}
                            className="h-full bg-emerald-500"
                        />
                    </View>
                </View>
            )}

            <TouchableOpacity
                onPress={handleSubmit}
                disabled={isUploading}
                className={`p-6 rounded-[28px] items-center shadow-xl mb-20 ${isUploading ? 'bg-slate-400' : 'bg-slate-900'}`}
            >
                {isUploading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg">Launch Product</Text>}
            </TouchableOpacity>
        </ScrollView>
    );
}
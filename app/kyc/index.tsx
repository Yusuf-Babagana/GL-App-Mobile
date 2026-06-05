import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import * as ImagePicker from 'expo-image-picker';
import { AlertCircle, Camera, Clock, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function KYCScreen() {
    const { user, fetchProfile, logout } = useAuth();
    const [idImage, setIdImage] = useState<string | null>(null);
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // --- STATE 1: PENDING REVIEW ---
    if (user?.kyc_status === 'pending') {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <View className="bg-orange-50 p-6 rounded-full mb-6">
                    <Clock size={80} color="#F97316" />
                </View>
                <Text className="text-2xl font-black text-gray-900 text-center">Verification in Progress</Text>
                <Text className="text-gray-500 text-center mt-4 leading-6">
                    Maa Shaa Allah! We've received your documents. Our team is reviewing your ID. This usually takes less than 24 hours.
                </Text>
                <TouchableOpacity
                    onPress={() => fetchProfile()}
                    className="mt-10 bg-gray-900 px-10 py-4 rounded-2xl"
                >
                    <Text className="text-white font-bold">Check Status</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={logout} className="mt-4">
                    <Text className="text-red-500 font-bold">Sign Out</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- STATE 2: REJECTED ---
    if (user?.kyc_status === 'rejected') {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <AlertCircle size={80} color="#EF4444" />
                <Text className="text-2xl font-black text-gray-900 mt-4">Verification Failed</Text>
                <Text className="text-gray-500 text-center mt-2">
                    Reason: {user.rejection_reason || "The ID image was not clear."}
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        // Reset local state to allow re-upload if needed, or just let them fall through to the form below logic if status was reset
                        // In this simplified view, we might need a way to 'acknowledge' to try again, usually backend resets status to 'unverified'
                        fetchProfile();
                    }}
                    className="mt-8 bg-primary px-10 py-4 rounded-2xl"
                >
                    <Text className="text-white font-bold">Refresh / Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={logout} className="mt-4">
                    <Text className="text-red-500 font-bold">Sign Out</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const pickImage = async (type: 'id' | 'selfie') => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            if (type === 'id') setIdImage(result.assets[0].uri);
            else setSelfieImage(result.assets[0].uri);
        }
    };

    const submitKYC = async () => {
        if (!idImage || !selfieImage) return Alert.alert("Required", "Please provide both ID and Selfie.");

        setUploading(true);
        const formData = new FormData();

        // Use the exact field names from your users/models.py
        // @ts-ignore
        formData.append('id_document_image', {
            uri: idImage,
            name: `id_${user?._id}.jpg`,
            type: 'image/jpeg',
        });

        // @ts-ignore
        formData.append('selfie_image', {
            uri: selfieImage,
            name: `selfie_${user?._id}.jpg`,
            type: 'image/jpeg',
        });

        formData.append('id_document_type', 'NIN'); // or from state

        try {
            const response = await api.post('/users/kyc/upload/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200 || response.status === 201) {
                Alert.alert("Success", "Documents uploaded! Waiting for approval.");
                await fetchProfile(); // Update the local user status to 'pending'
            }
        } catch (e: any) {
            Alert.alert("Error", "Upload failed. Check your connection or file size.");
        } finally {
            setUploading(false);
        }
    };

    // --- STATE 3: UNVERIFIED (The Upload Form) ---
    return (
        <ScrollView className="flex-1 bg-white p-6">
            <View className="items-center mt-10 mb-8">
                <ShieldCheck size={60} color={Colors.primary} />
                <Text className="text-2xl font-black mt-4">Account Verification</Text>
                <Text className="text-gray-500 text-center px-6 mt-2">
                    To ensure a safe marketplace, please verify your identity.
                </Text>
            </View>

            {/* ID Upload Slot */}
            <TouchableOpacity onPress={() => pickImage('id')} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl h-40 justify-center items-center mb-4 overflow-hidden">
                {idImage ? <Image source={{ uri: idImage }} className="w-full h-full" /> :
                    <View className="items-center"><Camera color="#9CA3AF" /><Text className="text-gray-400 mt-2">Upload Valid ID (NIN/Passport)</Text></View>}
            </TouchableOpacity>

            {/* Selfie Upload Slot */}
            <TouchableOpacity onPress={() => pickImage('selfie')} className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl h-40 justify-center items-center mb-4 overflow-hidden">
                {selfieImage ? <Image source={{ uri: selfieImage }} className="w-full h-full" /> :
                    <View className="items-center"><Camera color="#9CA3AF" /><Text className="text-gray-400 mt-2">Upload a Selfie</Text></View>}
            </TouchableOpacity>


            {/* Submit Button */}
            <TouchableOpacity
                onPress={submitKYC}
                disabled={uploading}
                className="bg-primary p-5 rounded-2xl items-center mt-6 mb-10"
            >
                <Text className="text-white font-black text-lg">{uploading ? "Uploading..." : "Submit for Approval"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => logout()} className="mb-10 w-full items-center">
                <Text className="text-gray-400 font-bold">Logout</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
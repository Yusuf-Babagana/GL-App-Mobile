import api from "@/lib/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SetupStoreScreen() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateStore = async () => {
        if (!name || !description) {
            Alert.alert("Error", "Please fill in your store name and description.");
            return;
        }

        setIsLoading(true);
        try {
            // Create the store logic
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);

            // We are skipping the logo for now as requested
            // If backend requires it, we might need to send a dummy or make it optional in backend

            await api.post("/market/store/create/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            Alert.alert("Success", "Your store is live!", [
                { text: "Go to Dashboard", onPress: () => router.replace("/seller/dashboard") }
            ]);
        } catch (error: any) {
            console.log("Store Create Error:", error.response?.data);
            const msg = error.response?.data?.name
                ? "A store with this name already exists."
                : "Failed to create store.";
            Alert.alert("Error", msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white px-6 justify-center">
            <View>
                <Text className="text-3xl font-bold text-gray-900 mb-2">Name your Shop</Text>
                <Text className="text-gray-500 mb-8">
                    Before you can sell, you need to set up your business profile.
                </Text>

                <View className="gap-4">
                    <View>
                        <Text className="text-gray-700 font-medium mb-1 ml-1">Store Name</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                            placeholder="e.g. Kano Electronics"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 font-medium mb-1 ml-1">Description</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-24"
                            placeholder="What do you sell?"
                            multiline
                            textAlignVertical="top"
                            value={description}
                            onChangeText={setDescription}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleCreateStore}
                        disabled={isLoading}
                        className="bg-[#1DB954] py-4 rounded-full items-center mt-4 shadow-lg shadow-green-200"
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Launch Store</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
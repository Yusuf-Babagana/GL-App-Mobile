import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, Modal, Text, TouchableOpacity, View } from "react-native";

export default function AdminKYCRequests() {
    const router = useRouter();
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null); // For modal preview

    const fetchRequests = async () => {
        try {
            const data = await marketAPI.getPendingKYC();
            setRequests(data);
        } catch (e) { console.log(e); }
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleAction = async (userId: number, action: 'approve' | 'reject') => {
        try {
            await marketAPI.adminKYCAction(userId, action);
            Alert.alert("Done", `User ${action}d successfully`);
            setSelectedUser(null); // Close modal
            fetchRequests(); // Refresh list
        } catch (e) {
            Alert.alert("Error", "Action failed");
        }
    };

    return (
        <View className="flex-1 bg-gray-900 px-4 pt-12">
            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-gray-800 p-2 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-bold">Pending KYC ({requests.length})</Text>
            </View>

            <FlatList
                data={requests}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => setSelectedUser(item)}
                        className="bg-gray-800 p-4 rounded-xl mb-3 flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mr-3">
                                <Text className="text-white font-bold">{item.email[0].toUpperCase()}</Text>
                            </View>
                            <View>
                                <Text className="text-white font-bold">{item.full_name}</Text>
                                <Text className="text-gray-400 text-xs">{item.email}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="gray" />
                    </TouchableOpacity>
                )}
            />

            {/* PREVIEW MODAL */}
            <Modal visible={!!selectedUser} animationType="slide" transparent>
                <View className="flex-1 bg-black/90 p-6 justify-center">
                    <TouchableOpacity onPress={() => setSelectedUser(null)} className="absolute top-12 right-6 z-10 p-2 bg-gray-800 rounded-full">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    {selectedUser && (
                        <View>
                            <Text className="text-white text-xl font-bold mb-4 text-center">{selectedUser.full_name}</Text>

                            <Text className="text-gray-400 mb-2">ID Document:</Text>
                            <Image source={{ uri: selectedUser.id_document_image }} className="w-full h-48 bg-gray-800 rounded-xl mb-6" contentFit="contain" />

                            <Text className="text-gray-400 mb-2">Selfie:</Text>
                            <Image source={{ uri: selectedUser.selfie_image }} className="w-full h-48 bg-gray-800 rounded-xl mb-8" contentFit="contain" />

                            <View className="flex-row gap-4">
                                <TouchableOpacity
                                    onPress={() => handleAction(selectedUser.id, 'reject')}
                                    className="flex-1 bg-red-600 py-4 rounded-xl items-center"
                                >
                                    <Text className="text-white font-bold">Reject</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleAction(selectedUser.id, 'approve')}
                                    className="flex-1 bg-green-600 py-4 rounded-xl items-center"
                                >
                                    <Text className="text-white font-bold">Approve</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </Modal>
        </View>
    );
}
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorState } from "@/components/ErrorState";

export default function AdminKYCRequests() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null); // For modal preview
    const [loadError, setLoadError] = useState(false);

    const fetchRequests = async () => {
        try {
            setLoadError(false);
            const data = await marketAPI.getPendingKYC();
            setRequests(data);
        } catch (e) {
            setLoadError(true);
        }
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
        <View className="flex-1 bg-gray-900 px-4" style={{ paddingTop: insets.top + 12 }}>
            <View className="flex-row items-center mb-6">
                <TouchableOpacity
                    onPress={() => router.back()}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel="Go back"
                    accessibilityRole="button"
                    className="mr-4 bg-gray-800 p-2 rounded-full"
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-2xl font-bold">Pending KYC ({requests.length})</Text>
            </View>

            {loadError ? (
                <ErrorState
                    title="Couldn't load requests"
                    description="Check your connection and try again."
                    onRetry={fetchRequests}
                />
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item, index) => item?.id?.toString() ?? `item-${index}`}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={7}
                    removeClippedSubviews
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedUser(item)}
                            accessibilityRole="button"
                            accessibilityLabel={`View KYC request from ${item.full_name || item.email}`}
                            className="bg-gray-800 p-4 rounded-xl mb-3 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-gray-700 rounded-full items-center justify-center mr-3">
                                    <Text className="text-white font-bold">{(item.email?.[0] || '?').toUpperCase()}</Text>
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
            )}

            {/* PREVIEW MODAL */}
            <Modal
                visible={!!selectedUser}
                animationType="slide"
                transparent
                onRequestClose={() => setSelectedUser(null)}
            >
                <View className="flex-1 bg-black/90 p-6 justify-center">
                    <TouchableOpacity
                        onPress={() => setSelectedUser(null)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityLabel="Close"
                        accessibilityRole="button"
                        className="absolute z-10 p-2 bg-gray-800 rounded-full"
                        style={{ top: insets.top + 12, right: 24 }}
                    >
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
                                    className="flex-1 bg-primary py-4 rounded-xl items-center"
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
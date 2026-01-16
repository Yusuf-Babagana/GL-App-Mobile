import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Modal, RefreshControl, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function RiderDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
    const [availableJobs, setAvailableJobs] = useState<any[]>([]);
    const [myJobs, setMyJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Delivery Logic State
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [pinModalVisible, setPinModalVisible] = useState(false);
    const [pin, setPin] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [available, active] = await Promise.all([
                marketAPI.getAvailableDeliveries(),
                marketAPI.getRiderActiveDeliveries()
            ]);
            setAvailableJobs(available.results || available);
            setMyJobs(active.results || active);
        } catch (e) {
            console.log(e);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => { fetchData(); }, [])
    );

    const handleAcceptJob = async (orderId: number) => {
        try {
            await marketAPI.acceptDelivery(orderId);
            Alert.alert("Success", "Job accepted! Head to the store.");
            fetchData();
            setActiveTab('active');
        } catch (e: any) {
            Alert.alert("Error", e.error || "Could not accept job.");
        }
    };

    const handlePickup = async (orderId: number) => {
        try {
            await marketAPI.riderUpdateStatus(orderId, 'picked_up');
            Alert.alert("Success", "Picked up! Head to the buyer.");
            fetchData();
        } catch (e: any) {
            Alert.alert("Error", e.error || "Update failed.");
        }
    };

    const handleDelivery = async () => {
        if (!pin || pin.length !== 4) {
            Alert.alert("Error", "Please enter the valid 4-digit PIN provided by the buyer.");
            return;
        }
        try {
            await marketAPI.riderUpdateStatus(selectedJob.id, 'delivered', pin);
            setPinModalVisible(false);
            setPin("");
            Alert.alert("Success", "Delivery Complete! Funds released to your wallet.");
            fetchData();
        } catch (e: any) {
            Alert.alert("Error", e.error || "Incorrect PIN or System Error.");
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#111827" />

            {/* Header */}
            <View className="bg-gray-900 pt-12 pb-6 px-6 rounded-b-[32px] shadow-lg z-10">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-orange-400 text-xs font-bold uppercase tracking-widest">Logistic Partner</Text>
                        <Text className="text-white text-3xl font-bold">Rider Hub</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.replace("/(tabs)/profile")} className="bg-gray-800 p-2 rounded-full">
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Tab Switcher */}
                <View className="flex-row bg-gray-800 p-1 rounded-xl mt-2">
                    <TouchableOpacity
                        onPress={() => setActiveTab('available')}
                        className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'available' ? 'bg-orange-500' : ''}`}
                    >
                        <Text className={`font-bold ${activeTab === 'available' ? 'text-white' : 'text-gray-400'}`}>New Jobs ({availableJobs.length})</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('active')}
                        className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'active' ? 'bg-orange-500' : ''}`}
                    >
                        <Text className={`font-bold ${activeTab === 'active' ? 'text-white' : 'text-gray-400'}`}>My Tasks ({myJobs.filter(j => j.delivery_status !== 'delivered').length})</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchData} tintColor="#F97316" />}
            >
                {activeTab === 'available' ? (
                    /* AVAILABLE JOBS LIST */
                    availableJobs.length === 0 ? (
                        <View className="items-center mt-20">
                            <Ionicons name="bicycle" size={64} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-4 font-bold text-lg">No jobs nearby</Text>
                        </View>
                    ) : (
                        availableJobs.map(job => (
                            <View key={job.id} className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="font-bold text-gray-900 text-lg">Pickup Request #{job.id}</Text>
                                    <Text className="text-green-600 font-bold">₦1,500 Earn</Text>
                                </View>
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="storefront" size={16} color="gray" />
                                    <Text className="text-gray-600 ml-2">{job.store?.name}</Text>
                                </View>
                                <View className="flex-row items-center mb-4">
                                    <Ionicons name="location" size={16} color="gray" />
                                    <Text className="text-gray-600 ml-2" numberOfLines={1}>{job.shipping_address_json?.address}, {job.shipping_address_json?.city}</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => handleAcceptJob(job.id)}
                                    className="bg-gray-900 py-3 rounded-xl items-center"
                                >
                                    <Text className="text-white font-bold">Accept Job</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )
                ) : (
                    /* ACTIVE DELIVERIES LIST */
                    myJobs.map(job => {
                        if (job.delivery_status === 'delivered') return null; // Hide finished jobs
                        return (
                            <View key={job.id} className="bg-white p-5 rounded-3xl mb-4 shadow-md border border-orange-100">
                                <View className="flex-row justify-between mb-4 border-b border-gray-100 pb-2">
                                    <Text className="font-bold text-gray-900 text-lg">Delivery #{job.id}</Text>
                                    <View className={`px-3 py-1 rounded-full ${job.delivery_status === 'picked_up' ? 'bg-blue-100' : 'bg-orange-100'}`}>
                                        <Text className={`text-[10px] font-bold uppercase ${job.delivery_status === 'picked_up' ? 'text-blue-700' : 'text-orange-700'}`}>
                                            {job.delivery_status.replace("_", " ")}
                                        </Text>
                                    </View>
                                </View>

                                {/* Status Actions */}
                                {job.delivery_status === 'ready_for_pickup' && (
                                    <View>
                                        <Text className="text-gray-500 mb-2">Go to store to pick up items.</Text>
                                        <Text className="font-bold text-lg mb-4">{job.store?.name}</Text>
                                        <TouchableOpacity
                                            onPress={() => handlePickup(job.id)}
                                            className="bg-blue-600 py-3 rounded-xl items-center"
                                        >
                                            <Text className="text-white font-bold">Confirm Pickup</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {job.delivery_status === 'picked_up' && (
                                    <View>
                                        <Text className="text-gray-500 mb-2">Deliver to Buyer:</Text>
                                        <Text className="font-bold text-lg">{job.shipping_address_json?.address}</Text>
                                        <Text className="font-bold text-gray-500 mb-4">{job.shipping_address_json?.city} • {job.shipping_address_json?.phone}</Text>

                                        <TouchableOpacity
                                            onPress={() => { setSelectedJob(job); setPinModalVisible(true); }}
                                            className="bg-green-600 py-3 rounded-xl items-center shadow-lg shadow-green-200"
                                        >
                                            <Text className="text-white font-bold">Complete Delivery</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* PIN Verification Modal */}
            <Modal visible={pinModalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-center px-6">
                    <View className="bg-white p-6 rounded-3xl">
                        <Text className="text-2xl font-bold text-center mb-2">Verify Delivery</Text>
                        <Text className="text-gray-500 text-center mb-6">Ask the buyer for the 4-digit PIN code.</Text>

                        <TextInput
                            className="bg-gray-100 text-center text-3xl font-bold tracking-[10px] py-4 rounded-xl mb-6"
                            placeholder="0000"
                            keyboardType="number-pad"
                            maxLength={4}
                            value={pin}
                            onChangeText={setPin}
                        />

                        <TouchableOpacity
                            onPress={handleDelivery}
                            className="bg-green-600 py-4 rounded-xl items-center mb-3"
                        >
                            <Text className="text-white font-bold text-lg">Confirm & Get Paid</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setPinModalVisible(false)} className="py-3 items-center">
                            <Text className="text-gray-500 font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </View>
    );
}
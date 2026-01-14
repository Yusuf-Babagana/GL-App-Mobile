import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WalletScreen() {
    const router = useRouter();
    const [wallet, setWallet] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Deposit Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [depositAmount, setDepositAmount] = useState("");
    const [isDepositing, setIsDepositing] = useState(false);

    const fetchWallet = async () => {
        try {
            const data = await marketAPI.getWallet();
            setWallet(data);
        } catch (e) {
            console.log("Wallet Error", e);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchWallet();
        }, [])
    );

    const handleDeposit = async () => {
        if (!depositAmount || Number(depositAmount) < 100) {
            Alert.alert("Error", "Minimum deposit is ₦100");
            return;
        }

        setIsDepositing(true);
        try {
            // 1. Get Payment Link
            const data = await marketAPI.initiateDeposit(Number(depositAmount));

            // 2. Open Paystack in Browser
            const result = await WebBrowser.openAuthSessionAsync(data.authorization_url, "https://your-app-scheme");

            // 3. User closed browser (or completed), let's verify
            // In a real app, we might wait for a deep link, but simpler to just ask user or check:
            setModalVisible(false);
            setIsDepositing(false);

            // Verify immediately
            Alert.alert("Processing", "Checking payment status...", [
                {
                    text: "Check Now", onPress: async () => {
                        try {
                            await marketAPI.verifyDeposit(data.reference);
                            Alert.alert("Success", "Wallet credited!");
                            fetchWallet();
                        } catch (e) {
                            Alert.alert("Info", "If you paid, the money will appear shortly.");
                        }
                    }
                }
            ]);

        } catch (e) {
            Alert.alert("Error", "Could not initiate payment.");
            setIsDepositing(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 py-4 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">My Wallet</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1">
                {/* Balance Card */}
                <View className="m-6 bg-gray-900 p-6 rounded-3xl shadow-xl">
                    <Text className="text-gray-400 text-sm uppercase font-bold mb-1">Available Balance</Text>
                    <Text className="text-white text-4xl font-bold mb-4">
                        ₦{wallet?.balance ? Number(wallet.balance).toLocaleString() : '0.00'}
                    </Text>

                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="flex-1 bg-[#1DB954] py-3 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold">Top Up</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 bg-gray-700 py-3 rounded-xl items-center">
                            <Text className="text-white font-bold">Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Transactions */}
                <Text className="mx-6 text-lg font-bold mb-4">History</Text>
                {wallet?.transactions?.map((txn: any) => (
                    <View key={txn.id} className="mx-6 mb-4 flex-row justify-between items-center p-4 bg-gray-50 rounded-xl">
                        <View>
                            <Text className="font-bold text-gray-900">{txn.description || "Transaction"}</Text>
                            <Text className="text-xs text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</Text>
                        </View>
                        <Text className={`font-bold ${txn.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.transaction_type === 'deposit' ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            {/* Deposit Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white p-6 rounded-t-3xl h-1/2">
                        <Text className="text-xl font-bold mb-4">Top Up Wallet</Text>
                        <Text className="text-gray-500 mb-2">Amount (NGN)</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-2xl font-bold mb-6"
                            keyboardType="numeric"
                            placeholder="5000"
                            value={depositAmount}
                            onChangeText={setDepositAmount}
                        />
                        <TouchableOpacity
                            onPress={handleDeposit}
                            disabled={isDepositing}
                            className="bg-black py-4 rounded-xl items-center"
                        >
                            {isDepositing ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Pay Securely</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="mt-4 items-center">
                            <Text className="text-gray-500">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoClipboard from 'expo-clipboard';
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Modal, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function WalletScreen() {
    const router = useRouter();
    // We consolidate everything into one object to match the Serializer
    const [walletData, setWalletData] = useState<any>({
        balance: "0.00",
        escrow_balance: "0.00",
        account_number: "",
        bank_name: "",
        transactions: []
    });

    const [isLoading, setIsLoading] = useState(true);

    const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [accNumber, setAccNumber] = useState("");
    const [selectedBank, setSelectedBank] = useState("035"); // Default e.g. Wema
    const [verifiedName, setVerifiedName] = useState("");
    const [recipientId, setRecipientId] = useState<number | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // 1. Logic to verify account while typing
    const handleVerifyAccount = async (text: string) => {
        setAccNumber(text);
        if (text.length === 10) {
            setIsVerifying(true);
            try {
                const res = await marketAPI.verifyBankAccount(text, selectedBank);
                setVerifiedName(res.account_name);
                // Assuming backend returns bank_account_id or similar. 
                // We'll store it to pass to initiateWithdrawal.
                // Based on standard patterns, let's assume it's in the response.
                // If the backend response key differs, we'll need to adjust.
                if (res.bank_account_id) {
                    setRecipientId(res.bank_account_id);
                }
            } catch (e) {
                setVerifiedName("Account not found");
                setRecipientId(null);
            } finally {
                setIsVerifying(false);
            }
        } else {
            setVerifiedName("");
            setRecipientId(null);
        }
    };

    const loadWalletData = async () => {
        setIsLoading(true);
        try {
            const data = await marketAPI.getWallet();
            // This sets the whole object at once
            setWalletData(data);
        } catch (e) {
            console.error("DEBUG: Wallet fetch failed", e);
        } finally {
        }
    };

    const copyToClipboard = async (text: string) => {
        // 1. Check if text is null, undefined, or empty
        if (!text) {
            Alert.alert("Wait", "Account details are still loading...");
            return;
        }

        try {
            await ExpoClipboard.setStringAsync(text);
            Alert.alert("Copied", "Account number copied to clipboard.");
        } catch (error) {
            console.error("Clipboard Error:", error);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || Number(withdrawAmount) < 500) {
            Alert.alert("Error", "Minimum withdrawal is ₦500");
            return;
        }

        if (!recipientId) {
            Alert.alert("Error", "Please verify a valid bank account first.");
            return;
        }

        try {
            await marketAPI.initiateWithdrawal(
                Number(withdrawAmount),
                recipientId
            );
            Alert.alert("Success", "Withdrawal request sent! Funds will arrive shortly.");
            setWithdrawModalVisible(false);
            loadWalletData(); // Refresh balances
        } catch (e: any) {
            Alert.alert("Withdrawal Failed", e.error || "Check your balance and try again.");
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadWalletData();
        }, [])
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 py-4 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">My Wallet</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

                {/* 1. MAIN BALANCE CARD */}
                <View className="m-6 bg-gray-900 p-6 rounded-3xl shadow-xl">
                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <Text className="text-gray-400 text-xs uppercase font-bold mb-1">Available to Spend</Text>
                            <Text className="text-white text-4xl font-bold">
                                ₦{Number(walletData?.balance || 0).toLocaleString()}
                            </Text>
                        </View>
                        <Ionicons name="wallet-outline" size={32} color="white" opacity={0.5} />
                    </View>

                    {/* ESCROW BALANCE DISPLAY */}
                    <View className="bg-gray-800/50 p-4 rounded-2xl mb-6 flex-row justify-between items-center">
                        <View>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold">Locked in Escrow</Text>
                            <Text className="text-orange-400 font-bold">₦{Number(walletData?.escrow_balance || 0).toLocaleString()}</Text>
                        </View>
                        <Ionicons name="lock-closed" size={16} color="#fb923c" />
                    </View>

                    <TouchableOpacity
                        onPress={() => setWithdrawModalVisible(true)}
                        className="w-full bg-white py-4 rounded-2xl items-center"
                    >
                        <Text className="text-black font-black">Withdraw Funds</Text>
                    </TouchableOpacity>
                </View>

                {/* 2. VIRTUAL ACCOUNT CARD (The new Monnify Top-up) */}
                <View className="mx-6 mb-8 bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <Text className="text-blue-900 font-bold mb-4 text-base">Deposit Funds</Text>
                    <Text className="text-blue-700 text-xs mb-4">
                        Transfer money to your unique bank account below to top up your Globalink wallet instantly.
                    </Text>

                    <View className="flex-row justify-between items-center bg-white p-4 rounded-2xl border border-blue-200">
                        <View>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold">Bank Name</Text>
                            <Text className="text-slate-900 font-bold">{walletData?.bank_name || "Generating..."}</Text>

                            <Text className="text-gray-400 text-[10px] uppercase font-bold mt-2">Account Number</Text>
                            <Text className="text-slate-900 text-xl font-black tracking-widest">
                                {walletData?.account_number || "0000000000"}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => copyToClipboard(walletData?.account_number)}
                            className="bg-blue-600 p-3 rounded-xl ml-2"
                        >
                            <Ionicons name="copy" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. TRANSACTIONS HISTORY */}
                <Text className="mx-6 text-lg font-bold mb-4">Recent Activity</Text>
                {walletData?.transactions?.map((txn: any) => (
                    <View key={txn.id} className="mx-6 mb-3 flex-row justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <View className="flex-row items-center">
                            <View className={`p-2 rounded-full mr-3 ${txn.transaction_type === 'deposit' ? 'bg-green-100' : 'bg-red-100'}`}>
                                <Ionicons
                                    name={txn.transaction_type === 'deposit' ? "arrow-down" : "arrow-up"}
                                    size={16}
                                    color={txn.transaction_type === 'deposit' ? "#16a34a" : "#dc2626"}
                                />
                            </View>
                            <View>
                                <Text className="font-bold text-gray-900 text-sm">{txn.description}</Text>
                                <Text className="text-[10px] text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</Text>
                            </View>
                        </View>
                        <Text className={`font-bold ${txn.transaction_type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.transaction_type === 'deposit' ? '+' : '-'}₦{Number(txn.amount).toLocaleString()}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            {/* ADD THE WITHDRAWAL MODAL */}
            <Modal visible={withdrawModalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white p-6 rounded-t-[40px] h-[75%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-black">Withdraw to Bank</Text>
                            <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#CBD5E1" />
                            </TouchableOpacity>
                        </View>

                        {/* Amount Input First for clarity */}
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Amount (₦)</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold mb-4 text-lg"
                            keyboardType="numeric"
                            value={withdrawAmount}
                            onChangeText={setWithdrawAmount}
                            placeholder="5000"
                        />

                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2">Account Number</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-2xl border border-gray-100 font-bold mb-2"
                            keyboardType="numeric"
                            maxLength={10}
                            placeholder="0123456789"
                            onChangeText={handleVerifyAccount}
                        />

                        <View className="h-10 justify-center">
                            {isVerifying ? (
                                <ActivityIndicator size="small" color="#329629" />
                            ) : (
                                <Text className={`font-bold ${verifiedName.includes("not found") ? 'text-red-500' : 'text-primary'}`}>
                                    {verifiedName}
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            className={`py-4 rounded-2xl items-center mt-4 ${!verifiedName || verifiedName.includes("not found") ? 'bg-gray-200' : 'bg-primary'}`}
                            disabled={!verifiedName || verifiedName.includes("not found")}
                            onPress={handleWithdraw}
                        >
                            <Text className="text-white font-bold text-lg">Confirm Withdrawal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
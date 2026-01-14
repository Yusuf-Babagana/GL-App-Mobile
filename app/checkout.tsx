import { useCart } from "@/context/CartContext";
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CheckoutScreen() {
    const router = useRouter();
    const { cartItems, cartTotal, refreshCart } = useCart();

    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");

    const [walletBalance, setWalletBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isBalanceLoading, setIsBalanceLoading] = useState(true);

    // 1. Fetch Wallet Balance on load
    useFocusEffect(
        useCallback(() => {
            const checkBalance = async () => {
                try {
                    const wallet = await marketAPI.getWallet();
                    setWalletBalance(Number(wallet.balance));
                } catch (e) {
                    console.log("Could not fetch balance");
                } finally {
                    setIsBalanceLoading(false);
                }
            };
            checkBalance();
        }, [])
    );

    const handlePlaceOrder = async () => {
        // 2. Validate Inputs
        if (!address || !phone || !city) {
            Alert.alert("Missing Info", "Please fill in all delivery details.");
            return;
        }

        // 3. Check Balance BEFORE calling API (User friendly check)
        if (walletBalance < cartTotal) {
            Alert.alert(
                "Insufficient Funds",
                `You need ₦${cartTotal.toLocaleString()} but you only have ₦${walletBalance.toLocaleString()}.`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Top Up Wallet", onPress: () => router.push("/wallet") }
                ]
            );
            return;
        }

        setIsLoading(true);

        try {
            // 4. Send Order via marketAPI
            const shippingData = { address, city, phone };

            await marketAPI.placeOrder(shippingData);

            // 5. Success! Clear Cart & Redirect
            await refreshCart();

            Alert.alert("Success", "Order placed! Funds held in Escrow.", [
                { text: "View Orders", onPress: () => router.replace("/orders") }
            ]);

        } catch (error: any) {
            console.log("Order Error:", error);

            // Handle Server-Side Insufficient Funds Error
            if (error.error === "Insufficient Funds") {
                Alert.alert("Insufficient Funds", "Please top up your wallet to proceed.", [
                    { text: "Top Up", onPress: () => router.push("/wallet") }
                ]);
            } else {
                Alert.alert("Error", error.error || "Failed to place order. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-xl font-bold">Checkout</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6">

                {/* Wallet Balance Checker */}
                <View className="bg-gray-900 p-4 rounded-xl mb-6 flex-row justify-between items-center shadow-md">
                    <View>
                        <Text className="text-gray-400 text-xs uppercase font-bold">Pay With Wallet</Text>
                        <Text className="text-white font-bold text-lg">
                            Balance: ₦{isBalanceLoading ? "..." : walletBalance.toLocaleString()}
                        </Text>
                    </View>
                    {walletBalance < cartTotal && (
                        <TouchableOpacity onPress={() => router.push("/wallet")} className="bg-white px-3 py-2 rounded-lg">
                            <Text className="font-bold text-black text-xs">Top Up</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Order Summary */}
                <View className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
                    <Text className="font-bold text-gray-900 mb-2">Order Summary</Text>
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-gray-500">Items ({cartItems.length})</Text>
                        <Text className="text-gray-900">₦{cartTotal.toLocaleString()}</Text>
                    </View>
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-gray-500">Delivery Fee</Text>
                        <Text className="text-[#1DB954]">Free (Beta)</Text>
                    </View>
                    <View className="h-[1px] bg-gray-200 my-2" />
                    <View className="flex-row justify-between">
                        <Text className="font-bold text-lg">Total To Pay</Text>
                        <Text className="font-bold text-lg text-[#1DB954]">₦{cartTotal.toLocaleString()}</Text>
                    </View>
                </View>

                {/* Shipping Form */}
                <Text className="font-bold text-lg mb-4">Delivery Details</Text>

                <View className="gap-4 mb-8">
                    <View>
                        <Text className="text-gray-600 mb-1 ml-1">Phone Number</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                            placeholder="080..."
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1 ml-1">City / State</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
                            placeholder="e.g. Kano"
                            value={city}
                            onChangeText={setCity}
                        />
                    </View>

                    <View>
                        <Text className="text-gray-600 mb-1 ml-1">Street Address</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl border border-gray-200 h-24"
                            placeholder="Full address..."
                            multiline
                            textAlignVertical="top"
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Footer Button */}
            <View className="p-6 border-t border-gray-100 bg-white">
                <TouchableOpacity
                    onPress={handlePlaceOrder}
                    disabled={isLoading}
                    className={`py-4 rounded-2xl items-center shadow-lg ${walletBalance < cartTotal ? 'bg-gray-400' : 'bg-[#1DB954] shadow-green-200'}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-bold text-lg">
                            {walletBalance < cartTotal ? "Insufficient Balance" : "Pay & Confirm Order"}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
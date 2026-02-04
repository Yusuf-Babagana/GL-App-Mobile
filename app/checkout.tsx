import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useCart } from "@/context/CartContext";
import { marketAPI } from "@/lib/marketApi"; // Import API
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function CheckoutScreen() {
    const router = useRouter();
    const { cartTotal, cartItems, refreshCart } = useCart();
    const [selectedPayment, setSelectedPayment] = useState<"card" | "transfer">("card");
    const [isProcessing, setIsProcessing] = useState(false);

    // Shipping Address State
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");

    const handlePayment = async () => {
        // 1. Validation
        if (!address.trim() || !city.trim() || !phone.trim()) {
            Alert.alert("Missing Details", "Please fill in all delivery information.");
            return;
        }

        setIsProcessing(true);

        try {
            // 2. Call API to create order
            await marketAPI.placeOrder({
                address,
                city,
                phone
            });

            // 3. Refresh Cart (empties it)
            await refreshCart();

            // 4. Success & Redirect
            Alert.alert("Order Placed", "Your order has been received successfully!", [
                { text: "View Orders", onPress: () => router.replace("/orders") }
                // Using replace to prevent going back to checkout
            ]);
        } catch (error: any) {
            console.log("Checkout Error:", error);

            if (error.error === "Insufficient Funds" && error.required) {
                Alert.alert(
                    "Insufficient Funds",
                    `You need ₦${Number(error.required).toLocaleString()} but your balance is ₦${Number(error.balance || 0).toLocaleString()}. Please fund your wallet.`,
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Fund Wallet", onPress: () => router.push("/wallet") }
                    ]
                );
            } else {
                Alert.alert("Checkout Failed", error.error || error.detail || "Something went wrong. Please try again.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <ScreenWrapper bg="bg-gray-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            >
                {/* Header */}
                <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Ionicons name="arrow-back" size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Checkout</Text>
                </View>

                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>

                    {/* Order Summary */}
                    <Text className="text-gray-900 font-bold text-lg mb-4">Order Summary</Text>
                    <Card className="mb-8">
                        {cartItems.map((item) => (
                            <View key={item.id} className="flex-row justify-between mb-2">
                                <Text className="text-gray-600 flex-1 mr-4" numberOfLines={1}>
                                    {item.quantity}x {item.product_name}
                                </Text>
                                <Text className="text-gray-900 font-medium">
                                    ₦{(Number(item.product_price) * item.quantity).toLocaleString()}
                                </Text>
                            </View>
                        ))}
                        <View className="h-[1px] bg-gray-100 my-3" />
                        <View className="flex-row justify-between">
                            <Text className="text-gray-900 font-bold text-lg">Total</Text>
                            <Text className="text-primary font-bold text-xl">
                                ₦{Number(cartTotal).toLocaleString()}
                            </Text>
                        </View>
                    </Card>

                    {/* Delivery Address Input */}
                    <Text className="text-gray-900 font-bold text-lg mb-4">Delivery Details</Text>
                    <View className="space-y-4 mb-8">
                        <View>
                            <Text className="text-gray-500 text-xs font-bold mb-1 ml-1 uppercase">Address</Text>
                            <TextInput
                                className="bg-white border border-gray-200 p-4 rounded-xl text-gray-900"
                                placeholder="No. 123, Street Name"
                                value={address}
                                onChangeText={setAddress}
                            />
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs font-bold mb-1 ml-1 uppercase">City / State</Text>
                                <TextInput
                                    className="bg-white border border-gray-200 p-4 rounded-xl text-gray-900"
                                    placeholder="Kano"
                                    value={city}
                                    onChangeText={setCity}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-500 text-xs font-bold mb-1 ml-1 uppercase">Phone</Text>
                                <TextInput
                                    className="bg-white border border-gray-200 p-4 rounded-xl text-gray-900"
                                    placeholder="080..."
                                    keyboardType="phone-pad"
                                    value={phone}
                                    onChangeText={setPhone}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <Text className="text-gray-900 font-bold text-lg mb-4">Payment Method</Text>
                    <View className="gap-4 mb-8">
                        <TouchableOpacity
                            onPress={() => setSelectedPayment("card")}
                            className={`p-4 rounded-xl border-2 flex-row items-center ${selectedPayment === "card" ? "bg-primary/5 border-primary" : "bg-white border-gray-100"}`}
                        >
                            <Ionicons name="card" size={24} color={selectedPayment === "card" ? "#329629" : "#9CA3AF"} />
                            <Text className={`font-bold ml-3 ${selectedPayment === "card" ? "text-primary" : "text-gray-900"}`}>Pay with Card</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setSelectedPayment("transfer")}
                            className={`p-4 rounded-xl border-2 flex-row items-center ${selectedPayment === "transfer" ? "bg-primary/5 border-primary" : "bg-white border-gray-100"}`}
                        >
                            <Ionicons name="wallet" size={24} color={selectedPayment === "transfer" ? "#329629" : "#9CA3AF"} />
                            <Text className={`font-bold ml-3 ${selectedPayment === "transfer" ? "text-primary" : "text-gray-900"}`}>Bank Transfer</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>

                {/* Footer */}
                <View className="p-6 bg-white border-t border-gray-100 pb-10">
                    <Button
                        title={isProcessing ? "Processing..." : `Pay ₦${Number(cartTotal).toLocaleString()}`}
                        onPress={handlePayment}
                        loading={isProcessing}
                        size="lg"
                        icon={!isProcessing ? <Ionicons name="lock-closed" size={18} color="white" /> : undefined}
                    />
                </View>
            </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}
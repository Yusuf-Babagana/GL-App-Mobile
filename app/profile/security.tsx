import { Colors } from "@/constants/Colors";
import { marketAPI } from "@/lib/marketApi";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator, Alert, SafeAreaView,
    ScrollView, Text, TextInput, TouchableOpacity, View
} from "react-native";

export default function SecurityScreen() {
    const router = useRouter();
    const [pin, setPin] = useState("");
    const [oldPin, setOldPin] = useState("");
    const [isChanging, setIsChanging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSavePin = async () => {
        if (pin.length !== 4) {
            return Alert.alert("Error", "PIN must be 4 digits");
        }
        if (isChanging && oldPin.length !== 4) {
            return Alert.alert("Error", "Please enter your current 4-digit PIN");
        }

        setIsLoading(true);
        try {
            await marketAPI.setTransactionPin(pin, isChanging ? oldPin : null);
            Alert.alert("Success", "Security PIN Updated successfully!");
            router.back();
        } catch (error: any) {
            Alert.alert("Failed", error.error || "Could not update PIN. Ensure your old PIN is correct.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100">
                <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text className="ml-4 text-xl font-black text-slate-900">Security Settings</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="items-center mb-8">
                    <View className="bg-primary-container p-4 rounded-full mb-4">
                        <Ionicons name="lock-closed" size={32} color={Colors.primary} />
                    </View>
                    <Text className="text-2xl font-black text-center text-slate-900">Transaction PIN</Text>
                    <Text className="text-gray-500 text-center mt-2 px-4">
                        Your transaction PIN is used to authorize withdrawals and sensitive activities.
                    </Text>
                </View>

                {/* Mode Toggle */}
                <View className="flex-row bg-gray-100 p-1 rounded-2xl mb-8">
                    <TouchableOpacity
                        onPress={() => setIsChanging(false)}
                        className={`flex-1 py-3 rounded-xl items-center ${!isChanging ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${!isChanging ? 'text-primary' : 'text-gray-500'}`}>New PIN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setIsChanging(true)}
                        className={`flex-1 py-3 rounded-xl items-center ${isChanging ? 'bg-white shadow-sm' : ''}`}
                    >
                        <Text className={`font-bold ${isChanging ? 'text-primary' : 'text-gray-500'}`}>Change PIN</Text>
                    </TouchableOpacity>
                </View>

                {isChanging && (
                    <View className="mb-6">
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Current PIN</Text>
                        <TextInput
                            className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-center text-3xl tracking-widest text-slate-900"
                            keyboardType="numeric"
                            maxLength={4}
                            secureTextEntry={true}
                            placeholder="****"
                            value={oldPin}
                            onChangeText={setOldPin}
                        />
                    </View>
                )}

                <View className="mb-10">
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-2 ml-1">
                        {isChanging ? "New 4-Digit PIN" : "Set 4-Digit PIN"}
                    </Text>
                    <TextInput
                        className="bg-gray-50 p-5 rounded-3xl border border-gray-100 font-bold text-center text-3xl tracking-widest text-primary"
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry={true}
                        placeholder="****"
                        value={pin}
                        onChangeText={setPin}
                    />
                </View>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleSavePin}
                    disabled={isLoading}
                    className={`py-5 rounded-2xl items-center ${isLoading ? 'bg-gray-300' : 'bg-primary'}`}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-black text-lg">
                            {isChanging ? "Update PIN" : "Setup PIN"}
                        </Text>
                    )}
                </TouchableOpacity>

                <View className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex-row items-center">
                    <Ionicons name="information-circle" size={20} color="#f97316" />
                    <Text className="text-orange-900 text-xs flex-1 ml-2 font-medium">
                        Never share your transaction PIN with anyone, including Globalink support.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

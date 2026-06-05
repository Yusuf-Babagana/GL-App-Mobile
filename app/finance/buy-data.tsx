import NetworkSelector, { NETWORKS } from '@/components/data/NetworkSelector';
import { useWallet } from '@/context/WalletContext';
import { fetchDataPlans } from '@/src/services/financeService';
import { marketAPI } from '@/lib/marketApi';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { CheckCircle, Smartphone } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function DataPurchaseScreen() {
    const router = useRouter();
    const { balance, refreshWallet } = useWallet();
    const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0].id);
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingPlans, setFetchingPlans] = useState(false);

    const walletBalance = Number(balance);

    const groupedPlans = useMemo(() => {
        if (!plans || plans.length === 0) return [];

        const groups = plans.reduce((acc: any[], plan: any) => {
            const name = (plan.name || plan.Name || "").toUpperCase();
            let type = "Direct/Gifting";

            if (name.includes("SME")) type = "SME";
            else if (name.includes("AWOOF") || name.includes("PROMO")) type = "Awoof";
            else if (name.includes("CG") || name.includes("CORPORATE")) type = "Corporate";

            const existingSection = acc.find(s => s.title === type);
            if (existingSection) {
                existingSection.data.push(plan);
            } else {
                acc.push({ title: type, data: [plan] });
            }
            return acc;
        }, []);

        // Sort so SME usually stays on top
        return groups.sort((a, b) => (a.title === "SME" ? -1 : 1));
    }, [plans]);

    useEffect(() => {
        const loadPlans = async () => {
            setPlans([]);
            setFetchingPlans(true);
            try {
                const fetched = await fetchDataPlans(selectedNetwork);
                if (fetched && fetched.length > 0) {
                    setPlans(fetched);
                    setSelectedPlan(fetched[0]);
                }
            } catch (err) {

            } finally {
                setFetchingPlans(false);
            }
        };

        loadPlans();
    }, [selectedNetwork]);

    const handlePurchase = async () => {
        if (!phoneNumber || phoneNumber.length < 11) {
            return Alert.alert("Invalid Phone", "Please enter a valid 11-digit number.");
        }
        if (!selectedPlan) return Alert.alert("Error", "Select a plan.");

        const planId = String(selectedPlan.variation_code || selectedPlan.ID);
        const planPrice = Number(selectedPlan.variation_amount || selectedPlan.Amount);

        if (walletBalance < planPrice) {
            return Alert.alert("Insufficient Balance", "Please top up your wallet.");
        }

        setLoading(true);
        try {
            const res = await marketAPI.purchaseData({
                service_id: selectedNetwork,
                variation_code: planId,
                phone: phoneNumber,
                amount: planPrice,
            });

            await refreshWallet();
            router.replace({
                pathname: '/market/receipt',
                params: {
                    orderId: res.order_id || 'N/A',
                    network: selectedNetwork,
                    planName: selectedPlan.name || selectedPlan.Name,
                    amount: String(planPrice),
                    phone: phoneNumber,
                    status: 'successful',
                },
            });
        } catch (err: any) {
            Alert.alert("Failed", err.toString());
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-white p-6" contentContainerStyle={{ paddingBottom: 120 }}>
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                    <Text className="text-2xl font-bold text-gray-800">Purchase Data</Text>
                </View>
                <View className="bg-gray-100 px-3 py-1 rounded-full">
                    <Text className="text-xs font-bold text-gray-600">₦{walletBalance.toLocaleString()}</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => router.push('/market/data-history')}
                className="bg-green-50 border-2 border-green-100 rounded-2xl p-4 mb-6 flex-row items-center"
                style={{ shadowColor: '#329629', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 }}
            >
                <View className="bg-white w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}>
                    <Text className="text-2xl">📋</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-base">Receipt History</Text>
                    <Text className="text-gray-500 text-xs mt-0.5">View or re-download your past receipts</Text>
                </View>
                <Text className="text-green-700 font-bold text-lg">→</Text>
            </TouchableOpacity>

            <NetworkSelector
                selectedNetwork={selectedNetwork}
                onSelectNetwork={setSelectedNetwork}
            />

            <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-500 mb-2 font-black uppercase tracking-widest">Phone Number</Text>
                <View className="flex-row items-center border-b border-gray-200 py-2">
                    <Smartphone size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-lg font-bold"
                        placeholder="08012345678"
                        keyboardType="numeric"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        maxLength={11}
                    />
                </View>
            </View>

            <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-widest font-black">Select Plan</Text>

                {fetchingPlans && plans.length === 0 ? (
                    <ActivityIndicator color="#4ADE80" className="py-10" />
                ) : groupedPlans.length === 0 ? (
                    <View className="w-full py-10 items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <Text className="text-gray-400 font-bold text-xs uppercase">No plans available</Text>
                    </View>
                ) : (
                    groupedPlans.map((section: any) => (
                        <View key={section.title} className="mb-6">
                            <View className="flex-row items-center mb-3">
                                <View className="bg-green-50 border border-green-100 px-3 py-1 rounded-full mr-2">
                                    <Text className="text-green-700 text-[10px] font-black uppercase tracking-widest">{section.title}</Text>
                                </View>
                                <View className="flex-1 h-px bg-gray-100" />
                            </View>

                            <View className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                {section.data.map((item: any, i: number) => {
                                    const isSelected = (selectedPlan?.variation_code === item.variation_code) || (selectedPlan?.ID === item.ID);
                                    const rawName = item.name || item.Name || '';
                                    const name = rawName.split('(')[0].trim();
                                    const price = Math.round(Number(item.variation_amount || item.Amount));

                                    return (
                                        <TouchableOpacity
                                            key={item.variation_code || item.ID || i}
                                            onPress={() => {
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                setSelectedPlan(item);
                                            }}
                                            style={{
                                                backgroundColor: isSelected ? 'rgba(74, 222, 128, 0.07)' : '#FFFFFF',
                                                padding: 16,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                borderBottomWidth: i === section.data.length - 1 ? 0 : 1,
                                                borderBottomColor: '#F1F5F9',
                                            }}
                                        >
                                            <View className="flex-1">
                                                <Text style={{ fontWeight: '700', color: isSelected ? '#15803d' : '#1F2937' }}>{name}</Text>
                                            </View>
                                            <Text style={{ fontWeight: '900', color: isSelected ? '#4ADE80' : '#111827' }}>₦{price.toLocaleString()}</Text>
                                            {isSelected && <View className="ml-2"><CheckCircle color="#4ADE80" size={18} /></View>}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    ))
                )}
            </View>

            <TouchableOpacity
                onPress={handlePurchase}
                disabled={loading || !selectedPlan}
                style={{ backgroundColor: (loading || !selectedPlan) ? '#E2E8F0' : '#4ADE80' }}
                className="w-full py-5 rounded-3xl items-center shadow-lg"
            >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Purchase Now</Text>}
            </TouchableOpacity>

        </ScrollView>
    );
}
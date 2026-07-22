import WalletOnboarding from '@/components/WalletOnboarding';
import { Colors } from '@/constants/Colors';
import { useWallet } from '@/context/WalletContext';
import { marketAPI } from '@/lib/marketApi';
import api from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight, Copy, Eye, EyeOff, History, Landmark, Plus, RefreshCcw, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useT as useTranslation } from '@/lib/useT';
import * as ExpoClipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SafeScreen from '../../components/SafeScreen';

export default function WalletScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isSetup, setIsSetup] = useState(false);
    const [wallet, setWallet] = useState<any>(null);
    const [showBalance, setShowBalance] = useState(true);
    const [newFundsBanner, setNewFundsBanner] = useState<number | null>(null);
    const { balance, updateBalance } = useWallet();

    const LAST_SEEN_TXN_KEY = 'last_seen_txn_id';

    const loadWalletData = async () => {
        try {
            const data = await marketAPI.getWallet();
            setWallet(data);
            updateBalance(data.balance);

            if (data.account_number && data.user_has_pin) {
                setIsSetup(true);
            } else {
                setIsSetup(false);
            }

            const txnRes = await api.get('/finance/transactions/', {
                params: { page: 1, page_size: 5 },
            });
            const txns: any[] = txnRes.data?.results || txnRes.data || [];
            const lastSeenId = await AsyncStorage.getItem(LAST_SEEN_TXN_KEY);
            const newTxns = txns.filter(
                (t: any) =>
                    ((t.transaction_type || t.type) === 'escrow_release' || (t.transaction_type || t.type) === 'deposit') &&
                    Number(t.id) > Number(lastSeenId || 0)
            );

            if (newTxns.length > 0) {
                const total = newTxns.reduce((s: number, t: any) => s + Math.abs(Number(t.amount)), 0);
                setNewFundsBanner(total);
            }
        } catch (error) {
            console.error("Wallet Load Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const dismissBanner = async () => {
        try {
            const txnRes = await api.get('/finance/transactions/', {
                params: { page: 1, page_size: 1 },
            });
            const txns: any[] = txnRes.data?.results || txnRes.data || [];
            const latestId = txns[0]?.id;
            if (latestId) {
                await AsyncStorage.setItem(LAST_SEEN_TXN_KEY, String(latestId));
            }
        } catch {}
        setNewFundsBanner(null);
    };

    useEffect(() => { loadWalletData(); }, []);

    const onRefresh = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setRefreshing(true);
        loadWalletData();
    };

    const copyToClipboard = async (text: string) => {
        if (!text) return;
        await ExpoClipboard.setStringAsync(text);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(t('copied'), t('copied_clipboard'));
    };

    if (loading) {
        return (
            <SafeScreen bg="bg-white">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4ADE80" />
                    <Text className="text-gray-400 mt-4 font-bold">{t('securing_wallet')}</Text>
                </View>
            </SafeScreen>
        );
    }

    if (!isSetup) {
        return (
            <SafeScreen bg="bg-white">
                <WalletOnboarding onComplete={loadWalletData} />
            </SafeScreen>
        );
    }

    return (
        <SafeScreen bg="bg-[#FBFBFE]">
            {/* Custom Header */}
            <View className="px-6 py-4 flex-row items-center justify-between">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-100"
                >
                    <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="text-lg font-black text-slate-900 tracking-tight">{t('gl_wallet')}</Text>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onRefresh={onRefresh}
                    className="w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-100"
                >
                    <RefreshCcw size={18} color={refreshing ? "#ccc" : "#1A1A1A"} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B00" />}
                showsVerticalScrollIndicator={false}
            >
                {/* New Funds Banner */}
                {newFundsBanner !== null && (
                    <View className="mb-4 bg-green-100 border border-green-300 rounded-3xl p-4 flex-row items-center">
                        <View className="bg-green-500 w-10 h-10 rounded-2xl items-center justify-center mr-3">
                            <ArrowDownLeft size={20} color="white" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-green-900 font-black text-sm">
                                ₦{newFundsBanner.toLocaleString()} {t('added_to_wallet') || 'released to your wallet'}
                            </Text>
                            <Text className="text-green-700 text-xs font-medium mt-0.5">{t('new_escrow_funds') || 'Funds from recent orders'}</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.7} onPress={dismissBanner} className="p-2">
                            <X size={20} color="#166534" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Unified Balance Card */}
                <View className="mt-2 mb-8 rounded-[40px] overflow-hidden border border-green-900/10">
                    <LinearGradient
                        colors={['#86efac', '#4ade80']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        className="p-8"
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <View className="flex-row items-center bg-green-900/10 px-3 py-1.5 rounded-full border border-green-900/10">
                                <View className="w-1.5 h-1.5 bg-green-700 rounded-full mr-2" />
                                <Text className="text-green-900/80 text-[10px] font-bold uppercase tracking-widest">{t('active_wallet')}</Text>
                            </View>
                            <TouchableOpacity activeOpacity={0.7} onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setShowBalance(!showBalance);
                            }}>
                                {showBalance ? <EyeOff size={20} color="rgba(20, 83, 45, 0.6)" /> : <Eye size={20} color="rgba(20, 83, 45, 0.6)" />}
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row gap-4 mb-6">
                            <View className="flex-1 bg-green-900/5 p-4 rounded-3xl border border-green-900/10">
                                <Text className="text-green-900/50 text-[9px] font-bold uppercase mb-1">{t('withdrawable_balance')}</Text>
                                <Text className="text-green-950 text-2xl font-black tracking-tight">
                                    {showBalance ? `₦${Number(wallet.available_balance ?? 0).toLocaleString()}` : '••••••'}
                                </Text>
                            </View>
                            <View className="flex-1 bg-green-900/5 p-4 rounded-3xl border border-green-900/10">
                                <Text className="text-green-900/50 text-[9px] font-bold uppercase mb-1">{t('in_transit_balance')}</Text>
                                <Text className="text-green-950 text-2xl font-black tracking-tight">
                                    {showBalance ? `₦${Number(wallet.locked_balance ?? 0).toLocaleString()}` : '••••••'}
                                </Text>
                                <Text className="text-green-900/40 text-[8px] font-bold uppercase mt-1">{t('pending_settlement')}</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-green-900/50 text-[9px] font-bold uppercase mb-1">{t('currency')}</Text>
                                <Text className="text-green-950/90 font-bold text-sm">{t('ngn_naira')}</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Quick Action Grid */}
                <View className="flex-row justify-between mb-8">
                    {[
                        { label: t('top_up'), icon: <Plus size={24} color="#4ADE80" />, bg: 'bg-green-50', route: '/wallet/deposit' },
                        { label: t('withdraw'), icon: <Landmark size={24} color="#1F2937" />, bg: 'bg-gray-100', route: '/wallet/withdraw' },
                        { label: t('history'), icon: <History size={24} color="#1F2937" />, bg: 'bg-gray-100', route: '/wallet/history' }
                    ].map((action, i) => (
                        <TouchableOpacity
                            key={i}
                            activeOpacity={0.7}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                typeof action.route === 'string' ? router.push(action.route as any) : action.route();
                            }}
                            className="items-center w-[30%]"
                        >
                            <View className={`${action.bg} w-16 h-16 rounded-3xl items-center justify-center mb-3 border border-gray-100`}>
                                {action.icon}
                            </View>
                            <Text className="text-slate-900 font-bold text-xs">{action.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Funding Account Detail */}
                <View className="mb-8 bg-white p-6 rounded-[35px] border border-gray-100">
                    <Text className="text-slate-900 font-black text-sm mb-4 uppercase tracking-widest text-center">{t('your_funding_account')}</Text>
                    
                    <View className="bg-gray-50 p-5 rounded-3xl items-center">
                        <Text className="text-[10px] text-gray-500 font-bold uppercase mb-1">{wallet.bank_name}</Text>
                        <View className="flex-row items-center">
                            <Text className="text-3xl font-black text-slate-900 mr-3 tracking-tighter">
                                {wallet.account_number}
                            </Text>
                            <TouchableOpacity 
                                activeOpacity={0.7}
                                onPress={() => copyToClipboard(wallet.account_number)}
                                className="bg-white w-10 h-10 rounded-2xl items-center justify-center border border-gray-100"
                            >
                                <Copy size={16} color="#4ADE80" />
                            </TouchableOpacity>
                        </View>
                        <Text className="mt-3 text-[10px] text-center text-gray-500 font-medium px-4">
                            {t('funds_arrive_instantly')}
                        </Text>

                        {/* Fee Notice */}
                        <View className="mt-4 p-3 bg-amber-50 rounded-2xl border border-amber-100 w-full">
                            <Text className="text-[10px] text-amber-700 text-center font-bold">
                                {t('service_fee')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Transaction History */}
                <View className="mb-4 flex-row justify-between items-center">
                    <Text className="text-lg font-black text-slate-900">{t('recent_activity')}</Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/wallet/history' as any)}>
                        <Text className="text-green-600 font-bold text-xs">{t('see_all')}</Text>
                    </TouchableOpacity>
                </View>

                {wallet.transactions?.length > 0 ? (
                    wallet.transactions.map((txn: any, i: number) => {
                        const isIncome = Number(txn.amount) >= 0;
                        return (
                            <View key={i} className="bg-white mb-3 p-4 rounded-3xl flex-row items-center justify-between border border-gray-100">
                                <View className="flex-row items-center">
                                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isIncome ? 'bg-green-50' : 'bg-red-50'}`}>
                                        {isIncome ? <ArrowDownLeft size={20} color="#10B981" /> : <ArrowUpRight size={20} color="#EF4444" />}
                                    </View>
                                    <View>
                                        <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>
                                            {txn.description || (isIncome ? t('deposit') : t('withdrawal'))}
                                        </Text>
                                        <Text className="text-gray-500 text-[10px] font-medium">
                                            {new Date(txn.created_at).toLocaleDateString()} • {txn.status || t('success_status')}
                                        </Text>
                                    </View>
                                </View>
                                <Text className={`font-black text-base ${isIncome ? 'text-green-600' : 'text-slate-900'}`}>
                                    {isIncome ? '+' : '-'}₦{Math.abs(Number(txn.amount)).toLocaleString()}
                                </Text>
                            </View>
                        );
                    })
                ) : (
                    <View className="py-12 items-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                        <View className="bg-white p-4 rounded-full mb-4 border border-gray-100">
                            <History size={32} color="#CBD5E1" />
                        </View>
                        <Text className="text-gray-500 font-bold text-sm">{t('no_recent_activity')}</Text>
                        <Text className="text-gray-400 text-[10px] mt-1">{t('transactions_here')}</Text>
                    </View>
                )}
            </ScrollView>
        </SafeScreen>
    );
}
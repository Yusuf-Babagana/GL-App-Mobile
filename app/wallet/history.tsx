import api from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ArrowDownLeft, ArrowUpRight, History as HistoryIcon } from 'lucide-react-native';
import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useT as useTranslation } from '@/lib/useT';
import SafeScreen from '../../components/SafeScreen';

const FILTERS = ['all', 'deposit', 'withdrawal', 'escrow_release'] as const;

export default function WalletHistoryScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]>('all');

    const fetchTxns = useCallback(async (pageNum: number, filter: string, append: boolean = false) => {
        try {
            const params: any = { page: pageNum, page_size: 20 };
            if (filter !== 'all') params.type = filter;
            const res = await api.get('/finance/transactions/', { params });
            const data = res.data;
            const results: any[] = data.results || data || [];
            if (append) {
                setTransactions(prev => [...prev, ...results]);
            } else {
                setTransactions(results);
            }
            setHasMore(!!data.next || results.length >= 20);
        } catch {
            // silent
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        setPage(1);
        fetchTxns(1, activeFilter);
    }, [activeFilter, fetchTxns]);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchTxns(1, activeFilter);
    };

    const loadMore = () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchTxns(nextPage, activeFilter, true);
    };

    return (
        <SafeScreen>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100 mr-4"
                >
                    <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text className="flex-1 text-lg font-black text-slate-900 tracking-tight">{t('history')}</Text>
            </View>

            {/* Filters */}
            <View className="flex-row px-6 py-3 gap-2">
                {FILTERS.map(f => {
                    const active = f === activeFilter;
                    return (
                        <TouchableOpacity
                            key={f}
                            activeOpacity={0.7}
                            onPress={() => setActiveFilter(f)}
                            className={`px-4 py-2 rounded-full border ${active ? 'bg-green-500 border-green-500' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-700'}`}>
                                {f === 'all' ? t('see_all') || 'All' :
                                 f === 'deposit' ? t('deposit') :
                                 f === 'withdrawal' ? t('withdrawal') :
                                 t('escrow_release') || 'Escrow'}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4ADE80" />
                </View>
            ) : (
                <FlatList
                    data={transactions}
                    keyExtractor={(item, i) => String(item.id || i)}
                    contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4ADE80" />}
                    showsVerticalScrollIndicator={false}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={loadingMore ? <ActivityIndicator className="py-4" color="#4ADE80" /> : null}
                    ListEmptyComponent={
                        <View className="py-16 items-center">
                            <View className="bg-gray-100 p-5 rounded-full mb-4">
                                <HistoryIcon size={36} color="#CBD5E1" />
                            </View>
                            <Text className="text-gray-500 font-bold text-sm">{t('no_recent_activity')}</Text>
                        </View>
                    }
                    renderItem={({ item: txn }) => {
                        const isIncome = Number(txn.amount) >= 0;
                        return (
                            <View className="bg-white mb-3 p-4 rounded-3xl flex-row items-center justify-between border border-gray-100">
                                <View className="flex-row items-center flex-1">
                                    <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isIncome ? 'bg-green-50' : 'bg-red-50'}`}>
                                        {isIncome ? <ArrowDownLeft size={20} color="#10B981" /> : <ArrowUpRight size={20} color="#EF4444" />}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold text-sm" numberOfLines={1}>
                                            {txn.description || (isIncome ? t('deposit') : t('withdrawal'))}
                                        </Text>
                                        <Text className="text-gray-500 text-[10px] font-medium">
                                            {new Date(txn.created_at).toLocaleDateString()} • {txn.status || t('success_status')}
                                        </Text>
                                    </View>
                                </View>
                                <Text className={`font-black text-base ml-3 ${isIncome ? 'text-green-600' : 'text-slate-900'}`}>
                                    {isIncome ? '+' : '-'}₦{Math.abs(Number(txn.amount)).toLocaleString()}
                                </Text>
                            </View>
                        );
                    }}
                />
            )}
        </SafeScreen>
    );
}

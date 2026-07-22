import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { ChevronLeft, Hash, Banknote, Lock, CheckCircle } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { marketAPI } from '@/lib/marketApi';
import * as Haptics from 'expo-haptics';

export default function MerchantWithdraw() {
  const router = useRouter();
  const [availableBalance, setAvailableBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [banks, setBanks] = useState<{ name: string; code: string }[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await marketAPI.get('/finance/wallet/');
        setAvailableBalance(Number(res.data.available_balance ?? res.data.balance ?? 0));
        setLockedBalance(Number(res.data.locked_balance ?? res.data.escrow_balance ?? 0));
      } catch {
        setAvailableBalance(0);
        setLockedBalance(0);
      } finally {
        setLoadingBalance(false);
      }
    };
    fetchBalance();
  }, []);

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const data = await marketAPI.getBanks();
        if (Array.isArray(data)) {
          setBanks(data);
        } else if (data.data && Array.isArray(data.data)) {
          setBanks(data.data);
        }
      } catch {
        console.error('Error loading banks');
      } finally {
        setLoadingBanks(false);
      }
    };
    loadBanks();
  }, []);

  useEffect(() => {
    setAccountName(null);
  }, [selectedBank, accountNumber]);

  const parsedAmount = useMemo(() => parseFloat(amount) || 0, [amount]);
  const exceedsBalance = parsedAmount > availableBalance;

  const verifyAccount = async () => {
    if (!selectedBank) {
      Alert.alert('Missing Info', 'Please select a bank first.');
      return;
    }
    if (accountNumber.length < 10) {
      Alert.alert('Invalid Account', 'Please enter a valid 10-digit account number.');
      return;
    }
    setVerifying(true);
    try {
      const name = await marketAPI.verifyBankAccount(accountNumber, selectedBank);
      setAccountName(name);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      console.error('Verification error:', error);
      Alert.alert(
        'Verification Failed',
        'Account Verification Failed: The account number could not be validated for the selected bank. Please double-check your credentials and try again.'
      );
      setAccountName(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!accountName) {
      Alert.alert('Verification Required', 'Please verify your account number first.');
      return;
    }
    if (isNaN(parsedAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (exceedsBalance) {
      Alert.alert('Insufficient Balance', 'Payout request exceeds your active withdrawable balance limit.');
      return;
    }
    if (pin.length < 4) {
      Alert.alert('Invalid PIN', 'Please enter your 4-digit transaction PIN.');
      return;
    }

    setWithdrawing(true);
    try {
      const bank = banks.find(b => b.code === selectedBank);
      const result = await marketAPI.initiateWithdrawal(parsedAmount, accountNumber, selectedBank, pin, bank?.name, accountName);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setAmount('');
      setPin('');
      setAccountNumber('');
      setAccountName(null);

      const successMsg = result.message || 'Withdrawal processed successfully.';
      const ref = result.ticket_id ? `\n\nTicket ID: ${result.ticket_id}` : '';
      Alert.alert('Success 👍', successMsg + ref, [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const data = error.response?.data;
      let msg = 'An error occurred during processing.';
      if (typeof data === 'string') {
        msg = data;
      } else if (data) {
        msg = data.detail || data.error || data.message || msg;
      } else if (error.message) {
        msg = error.message;
      }
      Alert.alert('Payout Failed', msg);
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View className="flex-row items-center px-5 py-4 bg-white border-b border-slate-100">
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} className="bg-slate-100 p-2 rounded-2xl mr-3">
          <ChevronLeft size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-black text-slate-900 tracking-tight mr-10">Withdraw Funds</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-emerald-50/70 border border-emerald-100/40 p-4 rounded-3xl">
            <Text className="text-emerald-600 text-[10px] font-black uppercase tracking-widest mb-1">Withdrawable Balance</Text>
            {loadingBalance ? (
              <ActivityIndicator size="small" color="#059669" />
            ) : (
              <Text className="text-emerald-950 text-xl font-black tracking-tight">₦{availableBalance.toLocaleString()}</Text>
            )}
          </View>
          <View className="flex-1 bg-amber-50/70 border border-amber-100/40 p-4 rounded-3xl">
            <Text className="text-amber-600 text-[10px] font-black uppercase tracking-widest mb-1">In-Transit</Text>
            {loadingBalance ? (
              <ActivityIndicator size="small" color="#D97706" />
            ) : (
              <Text className="text-amber-950 text-xl font-black tracking-tight">₦{lockedBalance.toLocaleString()}</Text>
            )}
          </View>
        </View>

        {exceedsBalance && (
          <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <Text className="text-red-700 font-bold text-sm">Payout request exceeds your active withdrawable balance limit.</Text>
          </View>
        )}

        <Text className="text-slate-900 font-bold mb-4 uppercase tracking-wider text-xs ml-1">1. Bank Details</Text>

        <View className="bg-white rounded-3xl p-5 border border-gray-100 mb-6">
          <Text className="text-gray-500 text-xs font-bold mb-2 ml-1">Select Bank</Text>
          <View className="bg-gray-50 border border-gray-200 rounded-2xl mb-4 overflow-hidden h-14 justify-center">
            {loadingBanks ? (
              <ActivityIndicator size="small" color="#10B981" />
            ) : (
              <Picker
                selectedValue={selectedBank}
                onValueChange={(itemValue) => setSelectedBank(itemValue)}
                style={{ height: 50, width: '100%' }}
              >
                <Picker.Item label="Choose a bank..." value="" color="#9CA3AF" />
                {banks.map((b) => (
                  <Picker.Item key={b.code} label={`${b.code} - ${b.name}`} value={b.code} color="#111827" />
                ))}
              </Picker>
            )}
          </View>

          <Text className="text-gray-500 text-xs font-bold mb-2 ml-1">Account Number</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 mb-2">
            <Hash size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-slate-900 font-bold text-base h-full"
              placeholder="e.g. 0123456789"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={10}
              value={accountNumber}
              onChangeText={setAccountNumber}
            />
          </View>

          {accountName ? (
            <View className="bg-green-50 border border-green-200 rounded-2xl p-4 mt-2 flex-row items-center">
              <View className="bg-green-100 p-2 rounded-full mr-3">
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-green-700 text-[10px] font-bold uppercase mb-1">Account Verified</Text>
                <Text className="text-green-950 font-black" numberOfLines={1}>{accountName}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={verifyAccount}
              disabled={verifying || !selectedBank || accountNumber.length < 10}
              className={`mt-2 rounded-xl py-3 items-center ${
                verifying || !selectedBank || accountNumber.length < 10
                ? 'bg-gray-100'
                : 'bg-gray-900'
              }`}
            >
              {verifying ? (
                <ActivityIndicator size="small" color="#111827" />
              ) : (
                <Text className={`font-bold ${
                  verifying || !selectedBank || accountNumber.length < 10
                  ? 'text-gray-400'
                  : 'text-white'
                }`}>Verify Account</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <Text className={`font-bold mb-4 uppercase tracking-wider text-xs ml-1 ${accountName ? 'text-slate-900' : 'text-gray-400'}`}>
          2. Withdrawal Details
        </Text>

        <View className={`bg-white rounded-3xl p-5 border border-gray-100 mb-8 ${accountName ? 'opacity-100' : 'opacity-50'}`}>
          <Text className="text-gray-500 text-xs font-bold mb-2 ml-1">Amount to Withdraw (₦)</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14 mb-4">
            <Banknote size={20} color="#9CA3AF" />
            <TextInput
              editable={!!accountName}
              className="flex-1 ml-3 text-slate-900 font-bold text-base h-full"
              placeholder="Enter amount to withdraw"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <Text className="text-gray-500 text-xs font-bold mb-2 ml-1">Transaction PIN</Text>
          <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 h-14">
            <Lock size={20} color="#9CA3AF" />
            <TextInput
              editable={!!accountName}
              className="flex-1 ml-3 text-slate-900 font-bold text-base h-full tracking-widest"
              placeholder="••••"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              secureTextEntry={true}
              maxLength={4}
              value={pin}
              onChangeText={setPin}
            />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleWithdraw}
          disabled={withdrawing || !accountName || amount === '' || pin.length < 4}
          className={`rounded-[25px] h-14 items-center justify-center ${
            withdrawing || !accountName || amount === '' || pin.length < 4
            ? 'bg-gray-300'
            : 'bg-emerald-600'
          }`}
        >
          {withdrawing ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" />
              <Text className="text-white font-black text-sm ml-2">Submitting Payout Request...</Text>
            </View>
          ) : (
            <Text className={`font-black text-lg ${
              !accountName || amount === '' || pin.length < 4 ? 'text-gray-500' : 'text-white'
            }`}>
              Send to Bank
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

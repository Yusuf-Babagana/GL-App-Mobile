import { apiRequest } from '@/src/services/apiClient';
import { fetchDataPlans } from '@/src/services/financeService';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const NETWORKS = [ 'MTN', 'Glo', '9mobile', 'Airtel' ];

interface Plan {
  ID: string;
  Name: string;
  Amount: string;
  Network: string;
}

export default function BuyDataScreen() {
  const router = useRouter();
  const [allPlans, setAllPlans] = useState<Plan[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingPlans(true);

    (async () => {
      try {
        const rawPlans = await fetchDataPlans();

        console.debug('[BuyData] rawPlans count:', rawPlans.length);
        if (rawPlans.length === 0) {
          console.debug('[BuyData] ⚠ zero plans returned');
          console.debug('[BuyData] rawPlans value:', JSON.stringify(rawPlans));
        }
        if (rawPlans.length > 0) {
          console.debug('[BuyData] first raw plan:', JSON.stringify(rawPlans[0]));
          console.debug('[BuyData] keys:', Object.keys(rawPlans[0]));
        }

        const plans: Plan[] = rawPlans.map((p: any) => ({
          ID:      String(p.variation_code || ''),
          Name:    String(p.name || ''),
          // variation_amount already includes the ₦50 markup from the backend
          Amount:  String(p.variation_amount || '0'),
          // backend uses Nellobyte's display label: 'MTN', 'Glo', 'Airtel', '9mobile'
          Network: String(p.provider || ''),
        }));

        console.debug('[BuyData] mapped plans count:', plans.length);
        if (plans.length > 0) {
          console.debug('[BuyData] first mapped plan:', JSON.stringify(plans[0]));
        }

        if (mounted) {
          setAllPlans(plans);
          const firstNetworkPlans = plans.filter(p => p.Network === NETWORKS[0]);
          if (firstNetworkPlans.length > 0) setSelectedPlan(firstNetworkPlans[0]);
        }
      } catch (err: any) {
        const msg = err instanceof Error ? err.message : String(err);
        console.debug('[BuyData] ✗ Failed to load plans:', msg);
        Alert.alert('Error', `Failed to load data plans.\n${msg}`);
      } finally {
        if (mounted) setLoadingPlans(false);
      }
    })();

    return () => { mounted = false; };
  }, []);

  const filteredPlans = allPlans.filter(p => p.Network === selectedNetwork);

  const handleBuy = async () => {
    if (!phoneNumber || phoneNumber.length < 11) {
      Alert.alert('Invalid Phone', 'Enter a valid 11-digit phone number.');
      return;
    }
    if (!selectedPlan) {
      Alert.alert('No Plan', 'Please select a data plan.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiRequest('/logistics/purchase-data/', {
        method: 'POST',
        body: JSON.stringify({
          serviceID: `${selectedNetwork.toLowerCase()}-data`,
          variation_code: selectedPlan.ID,
          amount: selectedPlan.Amount,
          phone: phoneNumber,
        }),
      });
      const orderId = response?.order_id || response?.orderid || response?.id || 'N/A';
      router.replace({
        pathname: '/market/receipt',
        params: {
          orderId,
          network: selectedNetwork,
          planName: selectedPlan.Name,
          amount: selectedPlan.Amount,
          phone: phoneNumber,
          status: 'successful',
        },
      });
    } catch (err: any) {
      const msg = err.message || 'Purchase failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 flex-1">Buy Data</Text>
      </View>

      <TouchableOpacity
        onPress={() => router.push('/market/data-history')}
        className="mx-6 mt-4 bg-green-50 border-2 border-green-100 rounded-2xl p-4 flex-row items-center"
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

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {loadingPlans ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator size="large" color="#329629" />
            <Text className="text-gray-500 mt-4">Loading data plans...</Text>
          </View>
        ) : (
          <>
            <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Mobile Network
            </Text>
            <View className="border border-gray-200 rounded-2xl overflow-hidden mb-6">
              <Picker
                selectedValue={selectedNetwork}
                onValueChange={(v) => {
                  setSelectedNetwork(v);
                  const plans = allPlans.filter(p => p.Network === v);
                  if (plans.length > 0) setSelectedPlan(plans[0]);
                }}
              >
                {NETWORKS.map(net => (
                  <Picker.Item key={net} label={net} value={net} />
                ))}
              </Picker>
            </View>

            <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Phone Number
            </Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-gray-900 font-semibold mb-6"
              placeholder="08012345678"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              maxLength={11}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              editable={!submitting}
            />

            <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">
              Data Plan
            </Text>
            <TouchableOpacity
              onPress={() => setShowPlanModal(true)}
              className="bg-gray-50 border border-gray-200 p-4 rounded-2xl flex-row items-center justify-between mb-8"
              activeOpacity={0.7}
            >
              <Text className={`font-semibold ${selectedPlan ? 'text-gray-900' : 'text-gray-400'}`}>
                {selectedPlan ? `${selectedPlan.Name} - ₦${Number(selectedPlan.Amount).toLocaleString()}` : 'Tap to choose a plan'}
              </Text>
              <Text className="text-gray-400 text-lg">→</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBuy}
              disabled={submitting || !selectedPlan || !phoneNumber}
              className={`py-5 rounded-2xl items-center ${submitting || !selectedPlan || !phoneNumber ? 'bg-gray-300' : 'bg-green-500'}`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Buy Data</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
      <Modal
        visible={showPlanModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPlanModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[80%]" style={{ minHeight: 300 }}>
            <View className="flex-row items-center justify-between px-6 py-5 border-b border-gray-100">
              <Text className="text-lg font-bold text-gray-900">
                {selectedNetwork} Data Plans
              </Text>
              <TouchableOpacity
                onPress={() => setShowPlanModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-gray-500 font-bold">✕</Text>
              </TouchableOpacity>
            </View>

            {filteredPlans.length === 0 ? (
              <View className="flex-1 items-center justify-center py-10">
                <Text className="text-gray-400">No plans available for {selectedNetwork}</Text>
              </View>
            ) : (
              <FlatList
                data={filteredPlans}
                keyExtractor={(item) => item.ID}
                contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedPlan(item);
                      setShowPlanModal(false);
                    }}
                    className={`flex-row items-center p-4 rounded-2xl mb-2 border ${
                      selectedPlan?.ID === item.ID
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-100'
                    }`}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: selectedPlan?.ID === item.ID ? 0.08 : 0.03,
                      shadowRadius: 4,
                      elevation: selectedPlan?.ID === item.ID ? 2 : 0,
                    }}
                    activeOpacity={0.7}
                  >
                    <View className="w-10 h-10 rounded-xl bg-green-100 items-center justify-center mr-4">
                      <Text className="text-lg">📶</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold text-sm" numberOfLines={2}>
                        {item.Name}
                      </Text>
                      <Text className="text-gray-400 text-xs mt-0.5">
                        {item.Network}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-green-700 font-bold text-base">
                        ₦{Number(item.Amount).toLocaleString()}
                      </Text>
                      {selectedPlan?.ID === item.ID && (
                        <Text className="text-green-600 text-xs font-semibold mt-0.5">Selected</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

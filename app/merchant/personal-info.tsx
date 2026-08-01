// app/merchant/personal-info.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Select } from '@/components/ui/Select';
import { useOnboarding } from '@/context/OnboardingContext';

export default function PersonalInformation() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { onboardingData, updatePersonal } = useOnboarding();

  const [form, setForm] = useState({
    name: onboardingData?.personal?.name || '',
    email: onboardingData?.personal?.email || '',
    phone: onboardingData?.personal?.phone || '',
    idType: onboardingData?.personal?.idType || '',
    idNumber: onboardingData?.personal?.idNumber || '',
  });

  const idTypes = [
    { label: 'National ID', value: 'national_id' },
    { label: "Driver's License", value: 'drivers_license' },
    { label: 'Passport', value: 'passport' },
  ];

  const handleNext = () => {
    if (!form.name || !form.email || !form.idType) {
      alert("Please fulfill critical fields before moving to Step 2.");
      return;
    }
    updatePersonal(form);
    router.push('/merchant/shop-info');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-8" contentContainerStyle={{ paddingTop: insets.top + 12 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between mb-2">
          <View className="h-1 w-[32%] bg-green-600 rounded-full" />
          <View className="h-1 w-[32%] bg-gray-200 rounded-full" />
          <View className="h-1 w-[32%] bg-gray-200 rounded-full" />
        </View>
        <Text className="text-right text-gray-400 text-[10px] font-bold mb-6">Step 1</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          className="mb-4"
        >
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>

        <Text className="text-2xl font-black text-slate-900 mb-2">Personal Information</Text>
        <Text className="text-gray-500 text-xs font-medium leading-4 mb-8">
          Kindly fill the below form to help you set up your GLAPP Shop.
        </Text>

        <View className="mb-6">
          <Text className="text-gray-500 font-bold text-xs mb-2">Full Name</Text>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
            value={form.name}
            onChangeText={(val) => setForm({...form, name: val})}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-500 font-bold text-xs mb-2">Email</Text>
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(val) => setForm({...form, email: val})}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-500 font-bold text-xs mb-2">Phone Number</Text>
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(val) => setForm({...form, phone: val})}
          />
        </View>

        <Select
          label="Select ID Type"
          placeholder="Choose your identification..."
          options={idTypes}
          value={form.idType}
          onValueChange={(value) => setForm({ ...form, idType: value })}
        />

        <View className="mb-8 mt-4">
          <Text className="text-gray-500 font-bold text-xs mb-2">ID Document Number</Text>
          <TextInput
            placeholder="ID Number"
            placeholderTextColor="#9CA3AF"
            className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
            value={form.idNumber}
            onChangeText={(val) => setForm({...form, idNumber: val})}
          />
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={handleNext} className="bg-green-600 py-5 rounded-2xl items-center mb-10 mt-4">
          <Text className="text-white text-lg font-black">Next</Text>
        </TouchableOpacity>
      </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

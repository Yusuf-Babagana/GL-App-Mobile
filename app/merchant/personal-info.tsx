// app/merchant/personal-info.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Select } from '@/components/ui/Select';
import { useOnboarding } from '@/context/OnboardingContext';

export default function PersonalInformation() {
  const router = useRouter();
  const { onboardingData, updatePersonal } = useOnboarding();
  
  const [form, setForm] = useState({
    name: onboardingData?.personal?.name || '',
    email: onboardingData?.personal?.email || '',
    phone: onboardingData?.personal?.phone || '',
    idType: onboardingData?.personal?.idType || '',
    idNumber: onboardingData?.personal?.idNumber || '',
    idImage: onboardingData?.personal?.idImage || null as string | null
  });

  const idTypes = [
    { label: 'National ID', value: 'national_id' },
    { label: "Driver's License", value: 'drivers_license' },
    { label: 'Passport', value: 'passport' },
  ];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setForm({ ...form, idImage: result.assets[0].uri });
    }
  };

  const handleNext = () => {
    if (!form.name || !form.email || !form.idType) {
      alert("Please fulfill critical fields before moving to Step 2.");
      return;
    }
    updatePersonal(form);
    router.push('/merchant/shop-info');
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-8 pt-12" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between mb-2">
          <View className="h-1 w-[32%] bg-green-600 rounded-full" />
          <View className="h-1 w-[32%] bg-gray-200 rounded-full" />
          <View className="h-1 w-[32%] bg-gray-200 rounded-full" />
        </View>
        <Text className="text-right text-gray-400 text-[10px] font-bold mb-6">Step 1</Text>

        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} className="mb-4">
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

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={pickImage}
          className="bg-green-50 border-2 border-dashed border-green-100 rounded-3xl py-10 items-center justify-center mb-10"
        >
          {form.idImage ? (
             <Image source={{ uri: form.idImage }} className="w-20 h-20 rounded-lg mb-2" />
          ) : (
             <ImageIcon size={48} color="#9CA3AF" strokeWidth={1.5} />
          )}
          <Text className="text-gray-500 text-[11px] font-bold mt-2">Upload National ID or Driver's License</Text>
          <View className="mt-4 border border-green-600 rounded-xl px-6 py-2">
            <Text className="text-green-600 font-black text-xs">Upload Or Snap Photo</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} onPress={handleNext} className="bg-green-600 py-5 rounded-2xl items-center mb-10">
          <Text className="text-white text-lg font-black">Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

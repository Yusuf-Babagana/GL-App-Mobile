// app/merchant/shop-info.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { ChevronLeft, Edit2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { RadioButton } from 'react-native-paper';
import { Select } from '@/components/ui/Select';
import { useOnboarding } from '@/context/OnboardingContext';

export default function ShopInformation() {
  const router = useRouter();
  const { onboardingData, updateShop } = useOnboarding();
  
  const [isRegistered, setIsRegistered] = useState(onboardingData?.shop?.registered || 'no');
  const [logo, setLogo] = useState<string | null>(onboardingData?.shop?.logo || null);
  
  const [form, setForm] = useState({
    shopName: onboardingData?.shop?.shopName || '',
    shopType: onboardingData?.shop?.shopType || '',
    businessPhone: onboardingData?.shop?.businessPhone || '',
    shopAddress: onboardingData?.shop?.shopAddress || '',
    state: onboardingData?.shop?.state || '',
    cacNumber: onboardingData?.shop?.cacNumber || '',
  });

  const shopTypes = [
    { label: 'Retailer', value: 'retailer' },
    { label: 'Wholesaler', value: 'wholesaler' },
    { label: 'Manufacturer', value: 'manufacturer' },
    { label: 'Service Provider', value: 'service_provider' },
  ];

  const pickLogo = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!form.shopName || !form.shopType) {
      alert("Please fill in Shop Name and Type parameters.");
      return;
    }
    updateShop({ ...form, registered: isRegistered, logo: logo });
    router.push('/merchant/review-submit');
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1 px-8 pt-12" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between mb-2">
          <View className="h-1 w-[32%] bg-green-600 rounded-full" />
          <View className="h-1 w-[32%] bg-green-600 rounded-full" />
          <View className="h-1 w-[32%] bg-gray-200 rounded-full" />
        </View>
        <Text className="text-right text-gray-400 text-[10px] font-bold mb-6">Step 2</Text>

        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} className="mb-4">
          <ChevronLeft size={24} color="#1E293B" />
        </TouchableOpacity>

        <Text className="text-2xl font-black text-slate-900 mb-2">Shop Information</Text>
        <Text className="text-gray-500 text-xs font-medium leading-4 mb-6">
          Kindly fill the below form to help you set up your GLAPP Shop.
        </Text>

        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickLogo} className="relative">
            <View className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 items-center justify-center overflow-hidden">
              {logo ? (
                <Image source={{ uri: logo }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                   <View className="w-10 h-10 bg-gray-200 rounded-full mb-1" />
                   <View className="w-14 h-6 bg-gray-200 rounded-t-lg" />
                </View>
              )}
            </View>
            <View className="absolute bottom-[-5] right-[-5] bg-green-600 p-1.5 rounded-full border-2 border-white">
              <Edit2 size={12} color="white" />
            </View>
          </TouchableOpacity>
          <Text className="text-gray-500 text-[11px] font-bold mt-3">Upload Shop Logo</Text>
        </View>

        <View className="space-y-5">
          <View>
            <Text className="text-gray-500 font-bold text-xs mb-2">Enter Shop Name</Text>
            <TextInput 
              placeholder="Shop Name" 
              placeholderTextColor="#9CA3AF" 
              className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
              value={form.shopName}
              onChangeText={(val) => setForm({...form, shopName: val})}
            />
          </View>

          <Select
            label="Shop Type"
            placeholder="Select shop type"
            options={shopTypes}
            value={form.shopType}
            onValueChange={(value) => setForm({ ...form, shopType: value })}
          />

          <View className="mt-4">
            <Text className="text-gray-500 font-bold text-xs mb-2">Business Phone Number</Text>
            <TextInput 
              placeholder="Phone Number" 
              placeholderTextColor="#9CA3AF" 
              keyboardType="phone-pad" 
              className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
              value={form.businessPhone}
              onChangeText={(val) => setForm({...form, businessPhone: val})}
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-500 font-bold text-xs mb-2">Shop Address</Text>
            <TextInput 
              placeholder="Shop Address" 
              placeholderTextColor="#9CA3AF"
              multiline 
              numberOfLines={3} 
              className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900 h-24" 
              style={{ textAlignVertical: 'top' }}
              value={form.shopAddress}
              onChangeText={(val) => setForm({...form, shopAddress: val})}
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-500 font-bold text-xs mb-2">Country</Text>
            <View className="border border-gray-200 rounded-2xl p-4 flex-row items-center justify-between">
               <View className="flex-row items-center">
                  <View className="w-6 h-4 bg-green-700 mr-2" />
                  <Text className="text-slate-900 font-bold text-sm">Nigeria</Text>
               </View>
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-gray-500 font-bold text-xs mb-2">State</Text>
            <TextInput 
              placeholder="Enter your state" 
              placeholderTextColor="#9CA3AF" 
              className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
              value={form.state}
              onChangeText={(val) => setForm({...form, state: val})}
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-500 font-bold text-xs mb-1">Business Registration</Text>
            <Text className="text-gray-400 text-[11px] font-medium mb-3">Is your business registered?</Text>
            
            <View className="flex-row items-center gap-6">
              <View className="flex-row items-center">
                <RadioButton
                  value="yes"
                  status={isRegistered === 'yes' ? 'checked' : 'unchecked'}
                  onPress={() => setIsRegistered('yes')}
                  color="#2563EB"
                />
                <Text className="text-slate-900 font-bold text-sm">Yes</Text>
              </View>
              <View className="flex-row items-center">
                <RadioButton
                  value="no"
                  status={isRegistered === 'no' ? 'checked' : 'unchecked'}
                  onPress={() => setIsRegistered('no')}
                  color="#2563EB"
                />
                <Text className="text-slate-900 font-bold text-sm">No</Text>
              </View>
            </View>
          </View>

          {isRegistered === 'yes' && (
            <View className="mt-4">
              <Text className="text-gray-500 font-bold text-xs mb-2">Business Registration Number (CAC)</Text>
              <TextInput 
                placeholder="BN 00000" 
                placeholderTextColor="#9CA3AF" 
                className="border border-gray-200 rounded-2xl p-4 text-sm font-bold text-slate-900"
                value={form.cacNumber}
                onChangeText={(val) => setForm({...form, cacNumber: val})}
              />
            </View>
          )}
        </View>

        <TouchableOpacity activeOpacity={0.7} onPress={handleNext} className="bg-green-600 w-full py-5 rounded-2xl items-center mt-10 mb-10">
          <Text className="text-white font-black text-lg">Next</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

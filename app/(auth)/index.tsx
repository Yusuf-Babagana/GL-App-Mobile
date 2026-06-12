import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { Briefcase, Globe, ShieldCheck, ShoppingCart } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useT as useTranslation } from '@/lib/useT';

const AuthScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <View className="px-8 pt-16 pb-10 justify-center items-center">
        {/* LOGO AREA */}
        <View className="bg-primary-container p-4 rounded-full mb-4">
          <Globe size={60} color={Colors.primary} />
        </View>

        <Text className="text-3xl font-black text-gray-900 mb-2">{t('welcome_globalink')}</Text>
        <Text className="text-center text-gray-500 text-base leading-6 px-4">
          {t('globalink_desc')}
        </Text>

        <View className="w-full mt-8 gap-y-4">
          <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <ShoppingCart size={24} color={Colors.primary} />
            <Text className="ml-4 font-bold text-gray-700">{t('buy_sell_anywhere')}</Text>
          </View>
          <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <Briefcase size={24} color="#2563eb" />
            <Text className="ml-4 font-bold text-gray-700">{t('find_jobs_globally')}</Text>
          </View>
          <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <ShieldCheck size={24} color="#f59e0b" />
            <Text className="ml-4 font-bold text-gray-700">{t('pay_easily')}</Text>
          </View>
        </View>

        <View className="mt-10 w-full">
          <Text className="text-center text-gray-400 font-bold uppercase text-xs tracking-widest mb-4">{t('choose_language')}</Text>
          <View className="flex-row justify-between gap-x-2">
            <TouchableOpacity className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center">
              <Text className="font-bold text-gray-800">{t('english')}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center">
              <Text className="font-bold text-gray-800">{t('hausa')}</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center">
              <Text className="font-bold text-gray-800">{t('arabic')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="w-full bg-primary py-4 rounded-2xl mt-10 shadow-lg shadow-green-200"
        >
          <Text className="text-white text-center font-black text-lg">{t('join_globalink')}</Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-400 text-xs mt-6">
          {t('connect_world')}
        </Text>
      </View>
    </ScrollView>
  );
};

export default AuthScreen;
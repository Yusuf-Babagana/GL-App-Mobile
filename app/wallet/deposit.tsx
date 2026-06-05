import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { Info, Sparkles } from "lucide-react-native";
import SafeScreen from "../../components/SafeScreen";

export default function DepositScreen() {
    const router = useRouter();

    return (
        <SafeScreen bg="bg-white">
            <View className="flex-1 px-8 pt-8 items-center justify-center">
                <View className="w-20 h-20 bg-green-50 rounded-[30px] items-center justify-center mb-8 border border-green-100 shadow-sm">
                    <Sparkles size={40} color="#4ADE80" />
                </View>

                <Text className="text-3xl font-black text-gray-900 mb-2 text-center">Instant Top-up</Text>
                <Text className="text-gray-400 text-center font-medium leading-5 mb-10 px-4">
                    Your personal wallet is now powered by instant virtual accounts. No manual notification required.
                </Text>

                <View className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 w-full mb-10">
                    <View className="flex-row items-center mb-4">
                        <View className="bg-green-400 w-2 h-2 rounded-full mr-2" />
                        <Text className="text-[10px] font-black uppercase text-gray-400 tracking-widest">How it works</Text>
                    </View>
                    <Text className="text-gray-900 font-bold leading-6">
                        Simply copy your account number from the dashboard and transfer any amount. Your balance updates <Text className="text-green-500">within seconds</Text>.
                    </Text>
                </View>
                
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.8}
                    className="bg-gray-900 py-5 rounded-[25px] w-full items-center shadow-lg shadow-gray-200"
                >
                    <Text className="text-white font-black uppercase tracking-tighter">View My Account Number</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => router.back()}
                    className="mt-6"
                >
                    <Text className="text-gray-400 font-bold text-xs underline">Go Back</Text>
                </TouchableOpacity>
            </View>
        </SafeScreen>
    );
}
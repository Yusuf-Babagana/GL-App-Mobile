import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { ShieldCheck, Clock } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';

export default function KYCBanner() {
    const { user } = useAuth();
    const router = useRouter();

    if (user?.kyc_status === 'verified') return null;

    if (user?.kyc_status === 'pending') {
        return (
            <TouchableOpacity
                onPress={() => router.push('/kyc')}
                className="mx-5 mb-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 flex-row items-center"
                activeOpacity={0.7}
            >
                <View className="bg-orange-100 w-9 h-9 rounded-xl items-center justify-center mr-3">
                    <Clock size={18} color="#D97706" />
                </View>
                <View className="flex-1">
                    <Text className="text-orange-800 font-bold text-sm">KYC Under Review</Text>
                    <Text className="text-orange-600 text-xs mt-0.5">Your documents are being reviewed</Text>
                </View>
            </TouchableOpacity>
        );
    }

    if (user?.kyc_status === 'unverified') {
        return (
            <TouchableOpacity
                onPress={() => router.push('/kyc')}
                className="mx-5 mb-3 bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex-row items-center"
                activeOpacity={0.7}
            >
                <View className="bg-blue-100 w-9 h-9 rounded-xl items-center justify-center mr-3">
                    <ShieldCheck size={18} color="#2563EB" />
                </View>
                <View className="flex-1">
                    <Text className="text-blue-800 font-bold text-sm">Verify Your Identity</Text>
                    <Text className="text-blue-600 text-xs mt-0.5">Unlock full features — upload your ID</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return null;
}

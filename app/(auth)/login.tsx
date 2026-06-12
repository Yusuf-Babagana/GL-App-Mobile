import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { getToken, setToken } from "@/src/services/apiClient";
import { debug } from "@/src/services/debug";
import { toUserFriendlyError } from "@/lib/errorMapper";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useT as useTranslation } from '@/lib/useT';

const API_HOST = 'https://glappbackend.pythonanywhere.com/api';

export default function LoginScreen() {
    const { t } = useTranslation();
    const { setSession } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return Alert.alert(t('error'), t('fill_all_fields'));
        setIsLoading(true);
        try {
            const res = await fetch(`${API_HOST}/users/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || t('invalid_credentials'));

            const jwt = data.token || data.access || data.key || data.accessToken;
            if (!jwt) {
                debug.auth.loginResponse(Object.keys(data).join(','), false);
                throw new Error(t('no_token'));
            }
            debug.auth.loginResponse(Object.keys(data).join(','), true);
            debug._raw('[login] token type:', typeof jwt, 'len:', String(jwt).length);

            await setToken(jwt);
            debug.auth.tokenStored('auth_token', true);

            const stored = await getToken();
            debug._raw('[login] verify getToken():', stored ? stored.slice(0, 10) + '…' : 'NULL');

            await setSession(jwt, data.user);
        } catch (error: any) {
            Alert.alert(t('authentication_failed'), toUserFriendlyError(error, t));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper className="px-6 justify-center bg-white">
            <View className="items-center mb-10">
                <View className="bg-primary/10 w-20 h-20 rounded-3xl items-center justify-center mb-6" style={{ shadowColor: '#329629', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 }}>
                    <Ionicons name="globe-outline" size={40} color="#329629" />
                </View>
                <Text className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{t('welcome_back')}</Text>
                <Text className="text-gray-400 font-medium text-base">{t('sign_in_account')}</Text>
            </View>

            <View className="mb-4">
                <Input
                    label={t('email_address')}
                    placeholder={t('email_placeholder')}
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
                <View className="mb-2">
                    <Text className="text-gray-700 font-bold text-xs mb-2 uppercase tracking-widest">{t('password')}</Text>
                    <View className="flex-row items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-5">
                        <TextInput
                            className="flex-1 py-4 text-gray-900 text-base font-semibold"
                            placeholder={t('password_placeholder')}
                            placeholderTextColor="#A0AEC0"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPassword(p => !p)} className="p-2">
                            <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity className="self-end mb-6">
                    <Text className="text-primary font-bold text-sm">{t('forgot_password')}</Text>
                </TouchableOpacity>

                <Button
                    title={t('sign_in')}
                    onPress={handleLogin}
                    loading={isLoading}
                    size="lg"
                />

                <TouchableOpacity
                    onPress={() => router.replace('/(tabs)')}
                    className="items-center mt-4 py-2"
                    activeOpacity={0.7}
                >
                    <Text className="text-gray-400 font-medium">{t('skip_browse')}</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row justify-center mt-4">
                <Text className="text-gray-400 font-medium">{t('no_account')} </Text>
                <Link href="/(auth)/register" asChild>
                    <TouchableOpacity activeOpacity={0.7}>
                        <Text className="text-primary font-bold">{t('sign_up')}</Text>
                    </TouchableOpacity>
                </Link>
            </View>
        </ScreenWrapper>
    );
}

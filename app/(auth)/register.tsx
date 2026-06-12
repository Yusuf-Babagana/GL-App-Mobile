import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { useAuth } from "@/context/AuthContext";
import { setToken } from "@/src/services/apiClient";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "@/services/auth";
import { toUserFriendlyError } from "@/lib/errorMapper";
import { Link } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useT as useTranslation } from '@/lib/useT';

export default function RegisterScreen() {
    const { t } = useTranslation();
    const { setSession } = useAuth();
    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone_number: "",
        password: "",
        confirm_password: "",
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegister = async () => {
        if (!form.full_name || !form.email || !form.password) {
            return Alert.alert(t('missing_fields'), t('fill_required'));
        }
        if (form.password !== form.confirm_password) {
            return Alert.alert(t('password_mismatch'), t('passwords_no_match'));
        }

        setIsLoading(true);
        try {
            await authService.register({
                username: form.email.trim().toLowerCase().split('@')[0],
                full_name: form.full_name.trim(),
                email: form.email.trim().toLowerCase(),
                phone_number: form.phone_number.trim(),
                password: form.password,
                password2: form.confirm_password,
            });

            const loginResponse = await authService.login({
                email: form.email.trim().toLowerCase(),
                password: form.password
            });

            const tokenToSave = loginResponse.access || loginResponse.token || loginResponse.key || loginResponse.accessToken;
            if (!tokenToSave) {
                throw new Error('No token returned from server.');
            }
            const userProfileToSave = loginResponse.user;

            await setToken(tokenToSave);
            await setSession(tokenToSave, userProfileToSave);

            Alert.alert(t('success'), t('account_ready'));

        } catch (error: any) {
            console.log('[REGISTER] error:', error);
            const errorMessage = toUserFriendlyError(error, t);
            Alert.alert(t('registration_error'), errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper bg="bg-white">
            <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }}>
                <View className="mb-8 items-center">
                    <View className="bg-primary/10 w-20 h-20 rounded-3xl items-center justify-center mb-6" style={{ shadowColor: '#329629', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 }}>
                        <Ionicons name="person-add" size={36} color="#329629" />
                    </View>
                    <Text className="text-3xl font-black text-gray-900 mb-1 text-center tracking-tight">{t('create_account')}</Text>
                    <Text className="text-gray-400 font-medium text-base text-center">{t('join_community')}</Text>
                </View>

                <View>
                    <Input
                        label={t('full_name')}
                        placeholder={t('full_name_placeholder')}
                        value={form.full_name}
                        onChangeText={(val) => setForm({ ...form, full_name: val })}
                    />
                    <Input
                        label={t('email_address')}
                        placeholder={t('email_placeholder')}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={form.email}
                        onChangeText={(val) => setForm({ ...form, email: val })}
                    />
                    <Input
                        label={t('phone_number')}
                        placeholder={t('phone_placeholder')}
                        keyboardType="phone-pad"
                        value={form.phone_number}
                        onChangeText={(val) => setForm({ ...form, phone_number: val })}
                    />
                    <View className="mb-5">
                        <Text className="text-gray-700 font-bold text-xs mb-2 uppercase tracking-widest">{t('password')}</Text>
                        <View className="flex-row items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-5">
                            <TextInput
                                className="flex-1 py-4 text-gray-900 text-base font-semibold"
                                placeholder={t('password_placeholder_create')}
                                placeholderTextColor="#A0AEC0"
                                secureTextEntry={!showPassword}
                                value={form.password}
                                onChangeText={(val) => setForm({ ...form, password: val })}
                            />
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowPassword(p => !p)} className="p-2">
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className="mb-6">
                        <Text className="text-gray-700 font-bold text-xs mb-2 uppercase tracking-widest">{t('confirm_password')}</Text>
                        <View className="flex-row items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-5">
                            <TextInput
                                className="flex-1 py-4 text-gray-900 text-base font-semibold"
                                placeholder={t('confirm_password_placeholder')}
                                placeholderTextColor="#A0AEC0"
                                secureTextEntry={!showConfirmPassword}
                                value={form.confirm_password}
                                onChangeText={(val) => setForm({ ...form, confirm_password: val })}
                            />
                            <TouchableOpacity activeOpacity={0.7} onPress={() => setShowConfirmPassword(p => !p)} className="p-2">
                                <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={22} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Button
                        title={t('create_account')}
                        onPress={handleRegister}
                        loading={isLoading}
                        size="lg"
                    />
                </View>

                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-400 font-medium">{t('have_account')} </Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity activeOpacity={0.7}><Text className="text-primary font-bold">{t('sign_in')}</Text></TouchableOpacity>
                    </Link>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}
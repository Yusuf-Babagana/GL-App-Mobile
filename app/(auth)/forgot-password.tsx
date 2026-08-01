import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ScreenWrapper } from "@/components/ui/ScreenWrapper";
import { marketAPI } from "@/lib/marketApi";
import { toUserFriendlyError } from "@/lib/errorMapper";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useT as useTranslation } from '@/lib/useT';

export default function ForgotPasswordScreen() {
    const { t } = useTranslation();
    const router = useRouter();

    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendCode = async () => {
        if (!email.trim()) return Alert.alert(t('error'), t('fill_all_fields'));
        setIsLoading(true);
        try {
            await marketAPI.requestPasswordReset(email.trim().toLowerCase());
            Alert.alert(t('forgot_password_title'), t('code_sent_message'));
            setStep('reset');
        } catch (error: any) {
            Alert.alert(t('error'), toUserFriendlyError(error, t));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp.trim() || !newPassword || !confirmPassword) {
            return Alert.alert(t('error'), t('fill_all_fields'));
        }
        if (newPassword !== confirmPassword) {
            return Alert.alert(t('error'), t('passwords_no_match'));
        }
        if (newPassword.length < 8) {
            return Alert.alert(t('error'), t('password_too_short'));
        }

        setIsLoading(true);
        try {
            await marketAPI.confirmPasswordReset(email.trim().toLowerCase(), otp.trim(), newPassword);
            Alert.alert(t('forgot_password_title'), t('password_reset_success'), [
                { text: 'OK', onPress: () => router.replace('/(auth)/login') },
            ]);
        } catch (error: any) {
            Alert.alert(t('error'), toUserFriendlyError(error, t));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenWrapper className="bg-white">
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
            <View className="items-center mb-10">
                <View className="bg-primary/10 w-20 h-20 rounded-3xl items-center justify-center mb-6" style={{ shadowColor: '#329629', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 4 }}>
                    <Ionicons name="lock-closed-outline" size={40} color="#329629" />
                </View>
                <Text className="text-3xl font-black text-gray-900 mb-1 tracking-tight">{t('forgot_password_title')}</Text>
                <Text className="text-gray-400 font-medium text-base text-center">
                    {step === 'email' ? t('forgot_password_subtitle') : t('enter_code_subtitle')}
                </Text>
            </View>

            {step === 'email' ? (
                <View className="mb-4">
                    <Input
                        label={t('email_address')}
                        placeholder={t('email_placeholder')}
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />

                    <Button
                        title={t('send_reset_code')}
                        onPress={handleSendCode}
                        loading={isLoading}
                        size="lg"
                    />
                </View>
            ) : (
                <View className="mb-4">
                    <Input
                        label={t('otp_code')}
                        placeholder="000000"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={setOtp}
                    />

                    <View className="mb-2">
                        <Text className="text-gray-700 font-bold text-xs mb-2 uppercase tracking-widest">{t('new_password')}</Text>
                        <View className="flex-row items-center bg-gray-50 border-2 border-gray-100 rounded-2xl px-5">
                            <TextInput
                                className="flex-1 py-4 text-gray-900 text-base font-semibold"
                                placeholder={t('new_password_placeholder')}
                                placeholderTextColor="#A0AEC0"
                                secureTextEntry={!showPassword}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => setShowPassword(p => !p)}
                                accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                                accessibilityRole="button"
                                className="p-2"
                            >
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Input
                        label={t('confirm_password')}
                        placeholder={t('confirm_password_placeholder')}
                        secureTextEntry={!showPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <Button
                        title={t('reset_password')}
                        onPress={handleResetPassword}
                        loading={isLoading}
                        size="lg"
                    />

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={handleSendCode}
                        disabled={isLoading}
                        className="items-center mt-4 py-2"
                    >
                        <Text className="text-primary font-bold text-sm">{t('resend_code')}</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                onPress={() => router.replace('/(auth)/login')}
                className="items-center mt-4 py-2"
                activeOpacity={0.7}
            >
                <Text className="text-gray-400 font-medium">{t('back_to_login')}</Text>
            </TouchableOpacity>
        </ScrollView>
        </KeyboardAvoidingView>
        </ScreenWrapper>
    );
}

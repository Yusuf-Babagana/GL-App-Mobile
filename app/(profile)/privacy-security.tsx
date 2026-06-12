import SafeScreen from "@/components/SafeScreen";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Linking, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useT as useTranslation } from '@/lib/useT';
import { apiRequest } from "@/src/services/apiClient";

type SecurityOption = {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: "navigation" | "toggle";
  value?: boolean;
};

function PrivacyAndSecurityScreen() {
  const { t } = useTranslation();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [shareData, setShareData] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const securitySettings: SecurityOption[] = [
    {
      id: "password",
      icon: "lock-closed-outline",
      title: t('change_password'),
      description: t('change_password_desc'),
      type: "navigation",
    },
    {
      id: "two-factor",
      icon: "shield-checkmark-outline",
      title: t('two_factor'),
      description: t('two_factor_desc'),
      type: "toggle",
      value: twoFactorEnabled,
    },
    {
      id: "biometric",
      icon: "finger-print-outline",
      title: t('biometric'),
      description: t('biometric_desc'),
      type: "toggle",
      value: biometricEnabled,
    },
  ];

  const privacySettings: SecurityOption[] = [
    {
      id: "push",
      icon: "notifications-outline",
      title: t('push_notifications'),
      description: t('push_notifications_desc'),
      type: "toggle",
      value: pushNotifications,
    },
    {
      id: "email",
      icon: "mail-outline",
      title: t('email_notifications'),
      description: t('email_notifications_desc'),
      type: "toggle",
      value: emailNotifications,
    },
    {
      id: "marketing",
      icon: "megaphone-outline",
      title: t('marketing_emails'),
      description: t('marketing_emails_desc'),
      type: "toggle",
      value: marketingEmails,
    },
    {
      id: "data",
      icon: "analytics-outline",
      title: t('share_usage_data'),
      description: t('share_usage_data_desc'),
      type: "toggle",
      value: shareData,
    },
  ];

  const accountSettings = [
    {
      id: "activity",
      icon: "time-outline",
      title: t('account_activity'),
      description: t('account_activity_desc'),
    },
    {
      id: "devices",
      icon: "phone-portrait-outline",
      title: t('connected_devices'),
      description: t('connected_devices_desc'),
    },
    {
      id: "data-download",
      icon: "download-outline",
      title: t('download_data'),
      description: t('download_data_desc'),
    },
    {
      id: "privacy-policy",
      icon: "document-text-outline",
      title: t('privacy_policy_title') || t('privacy_policy'),
      description: t('privacy_policy_desc'),
    },
    {
      id: "terms",
      icon: "newspaper-outline",
      title: t('terms_service'),
      description: t('terms_service_desc'),
    },
  ];

  const handleToggle = (id: string, value: boolean) => {
    switch (id) {
      case "two-factor":
        setTwoFactorEnabled(value);
        break;
      case "biometric":
        setBiometricEnabled(value);
        break;
      case "push":
        setPushNotifications(value);
        break;
      case "email":
        setEmailNotifications(value);
        break;
      case "marketing":
        setMarketingEmails(value);
        break;
      case "data":
        setShareData(value);
        break;
    }
  };

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="px-6 pb-5 border-b border-surface flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">{t('privacy_security_title') || t('privacy_security')}</Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View className="px-6 pt-6">
          <Text className="text-text-primary text-lg font-bold mb-4">{t('security')}</Text>

          {securitySettings.map((setting) => (
            <TouchableOpacity
              key={setting.id}
              className="bg-surface rounded-2xl p-4 mb-3"
              activeOpacity={setting.type === "toggle" ? 1 : 0.7}
            >
              <View className="flex-row items-center">
                <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-4">
                  <Ionicons name={setting.icon as any} size={24} color="#1DB954" />
                </View>

                <View className="flex-1">
                  <Text className="text-text-primary font-bold text-base mb-1">
                    {setting.title}
                  </Text>
                  <Text className="text-text-secondary text-sm">{setting.description}</Text>
                </View>

                {setting.type === "toggle" ? (
                  <Switch
                    value={setting.value}
                    onValueChange={(value) => handleToggle(setting.id, value)}
                    thumbColor="#FFFFFF"
                    trackColor={{ false: "#2A2A2A", true: "#1DB954" }}

                    // ios_backgroundColor={"purple"}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Privacy Section */}
        <View className="px-6 pt-4">
          <Text className="text-text-primary text-lg font-bold mb-4">{t('privacy')}</Text>

          {privacySettings.map((setting) => (
            <View key={setting.id}>
              <View className="bg-surface rounded-2xl p-4 mb-3">
                <View className="flex-row items-center">
                  <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-4">
                    <Ionicons name={setting.icon as any} size={24} color="#1DB954" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-text-primary font-bold text-base mb-1">
                      {setting.title}
                    </Text>
                    <Text className="text-text-secondary text-sm">{setting.description}</Text>
                  </View>
                  <Switch
                    value={setting.value}
                    onValueChange={(value) => handleToggle(setting.id, value)}
                    trackColor={{ false: "#2A2A2A", true: "#1DB954" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ACCOUNT SECTION */}
        <View className="px-6 pt-4">
          <Text className="text-text-primary text-lg font-bold mb-4">{t('account')}</Text>

          {accountSettings.map((setting) => (
            <TouchableOpacity
              key={setting.id}
              className="bg-surface rounded-2xl p-4 mb-3"
              activeOpacity={0.7}
              onPress={() => {
                if (setting.id === 'privacy-policy') {
                  router.push('/privacy-policy');
                } else if (setting.id === 'terms') {
                  Linking.openURL('https://yusuf-babagana.github.io/glapp-privacy-policy/');
                }
              }}
            >
              <View className="flex-row items-center">
                <View className="bg-primary/20 rounded-full w-12 h-12 items-center justify-center mr-4">
                  <Ionicons name={setting.icon as any} size={24} color="#1DB954" />
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary font-bold text-base mb-1">
                    {setting.title}
                  </Text>
                  <Text className="text-text-secondary text-sm">{setting.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* DELETE ACC BTN */}
        <View className="px-6 pt-4">
          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center justify-between border-2 border-red-500/20"
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert(
                t('delete_account_title'),
                t('delete_account_msg'),
                [
                  { text: t('cancel'), style: 'cancel' },
                  {
                    text: t('request_deletion'),
                    style: 'destructive',
                    onPress: async () => {
                      setDeleting(true);
                      try {
                        await apiRequest('/users/request-deletion/', { method: 'POST' });
                        Alert.alert(t('deletion_submitted'), t('deletion_email'));
                      } catch (e: any) {
                        Alert.alert(t('error'), e.message || t('transaction_failed'));
                      } finally {
                        setDeleting(false);
                      }
                    },
                  },
                ],
              );
            }}
            disabled={deleting}
          >
            <View className="flex-row items-center">
              <View className="bg-red-500/20 rounded-full w-12 h-12 items-center justify-center mr-4">
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </View>
              <View>
                <Text className="text-red-500 font-bold text-base mb-1">{t('delete_account_title')}</Text>
                <Text className="text-text-secondary text-sm">{t('permanently_delete')}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* INFO ALERT */}
        <View className="px-6 pt-6 pb-4">
          <View className="bg-primary/10 rounded-2xl p-4 flex-row">
            <Ionicons name="information-circle-outline" size={24} color="#1DB954" />
            <Text className="text-text-secondary text-sm ml-3 flex-1">
              {t('privacy_serious')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

export default PrivacyAndSecurityScreen;

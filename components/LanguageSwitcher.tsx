import React from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'light' }: Props) {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        const isRtl = lang === 'ar';
        if (I18nManager.isRTL !== isRtl) {
            I18nManager.allowRTL(isRtl);
            I18nManager.forceRTL(isRtl);
        }
    };

    const currentLang = i18n.language;
    const activeStyle = variant === 'dark' ? 'text-green-900' : 'text-white';
    const inactiveStyle = variant === 'dark' ? 'text-gray-400' : 'text-white/50';
    const pipeStyle = variant === 'dark' ? 'text-gray-300' : 'text-white/30';

    return (
        <View className="flex-row items-center justify-start">
            <TouchableOpacity onPress={() => changeLanguage('en')} activeOpacity={0.6} className="px-3 py-2">
                <Text className={`text-xs font-bold ${currentLang === 'en' ? activeStyle : inactiveStyle}`}>EN</Text>
            </TouchableOpacity>
            <Text className={`${pipeStyle} text-xs`}>|</Text>
            <TouchableOpacity onPress={() => changeLanguage('ha')} activeOpacity={0.6} className="px-3 py-2">
                <Text className={`text-xs font-bold ${currentLang === 'ha' ? activeStyle : inactiveStyle}`}>HA</Text>
            </TouchableOpacity>
            <Text className={`${pipeStyle} text-xs`}>|</Text>
            <TouchableOpacity onPress={() => changeLanguage('ar')} activeOpacity={0.6} className="px-3 py-2">
                <Text className={`text-xs font-bold ${currentLang === 'ar' ? activeStyle : inactiveStyle}`}>AR</Text>
            </TouchableOpacity>
        </View>
    );
}

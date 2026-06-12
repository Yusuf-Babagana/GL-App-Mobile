import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nManager, Text, TouchableOpacity, View } from 'react-native';
import { changeAppLanguage } from '@/lib/i18n';

interface Props {
    variant?: 'light' | 'dark';
}

export default function LanguageSwitcher({ variant = 'light' }: Props) {
    const { i18n } = useTranslation();
    const [lang, setLang] = useState<string>('en');

    useEffect(() => {
        const current = i18n.language?.split('-')[0] || 'en';
        setLang(current);
        const handle = (lng: string) => {
            setLang(lng?.split('-')[0] || 'en');
        };
        i18n.on('languageChanged', handle);
        return () => {
            i18n.off('languageChanged', handle);
        };
    }, [i18n]);

    const pick = useCallback((lng: string) => {
        changeAppLanguage(lng);
        if (lng === 'ar') {
            I18nManager.allowRTL(true);
            I18nManager.forceRTL(true);
        } else {
            I18nManager.allowRTL(false);
            I18nManager.forceRTL(false);
        }
    }, []);

    const activeStyle = variant === 'dark' ? 'text-green-900' : 'text-white';
    const inactiveStyle = variant === 'dark' ? 'text-gray-400' : 'text-white/50';
    const pipeStyle = variant === 'dark' ? 'text-gray-300' : 'text-white/30';

    return (
        <View className="flex-row items-center justify-start">
            <TouchableOpacity onPress={() => pick('en')} activeOpacity={0.6} className="px-3 py-2">
                <Text className={`text-xs font-bold ${lang === 'en' ? activeStyle : inactiveStyle}`}>EN</Text>
            </TouchableOpacity>
            <Text className={`${pipeStyle} text-xs`}>|</Text>
            <TouchableOpacity onPress={() => pick('ha')} activeOpacity={0.6} className="px-3 py-2">
                <Text className={`text-xs font-bold ${lang === 'ha' ? activeStyle : inactiveStyle}`}>HA</Text>
            </TouchableOpacity>
            <Text className={`${pipeStyle} text-xs`}>|</Text>
            <TouchableOpacity onPress={() => pick('ar')} activeOpacity={0.6} className="px-3 py-2">
                <Text className={`text-xs font-bold ${lang === 'ar' ? activeStyle : inactiveStyle}`}>AR</Text>
            </TouchableOpacity>
        </View>
    );
}

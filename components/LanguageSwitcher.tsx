import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

export default function LanguageSwitcher() {
    const { i18n, t } = useTranslation();

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const currentLang = i18n.language;

    return (
        <View className="my-4">
            <Text className="text-gray-500 mb-2 font-bold ml-1 uppercase text-xs">
                {t('select_language')}
            </Text>
            <View className="flex-row gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">

                {/* English */}
                <TouchableOpacity
                    onPress={() => changeLanguage('en')}
                    className={`flex-1 py-3 rounded-lg items-center ${currentLang === 'en' ? 'bg-[#1DB954]' : 'bg-transparent'}`}
                >
                    <Text className={`font-bold ${currentLang === 'en' ? 'text-white' : 'text-gray-600'}`}>
                        English
                    </Text>
                </TouchableOpacity>

                {/* Hausa */}
                <TouchableOpacity
                    onPress={() => changeLanguage('ha')}
                    className={`flex-1 py-3 rounded-lg items-center ${currentLang === 'ha' ? 'bg-[#1DB954]' : 'bg-transparent'}`}
                >
                    <Text className={`font-bold ${currentLang === 'ha' ? 'text-white' : 'text-gray-600'}`}>
                        Hausa
                    </Text>
                </TouchableOpacity>

                {/* Arabic */}
                <TouchableOpacity
                    onPress={() => changeLanguage('ar')}
                    className={`flex-1 py-3 rounded-lg items-center ${currentLang === 'ar' ? 'bg-[#1DB954]' : 'bg-transparent'}`}
                >
                    <Text className={`font-bold ${currentLang === 'ar' ? 'text-white' : 'text-gray-600'}`}>
                        العربية
                    </Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}
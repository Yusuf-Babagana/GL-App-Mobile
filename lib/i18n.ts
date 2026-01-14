import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// THE DICTIONARY
const resources = {
    en: {
        translation: {
            welcome: "Welcome to Globalink",
            marketplace: "Marketplace",
            jobs: "Online Jobs",
            delivery: "Delivery",
            payments: "Payments",
            profile: "Profile",
            language: "Language",
            select_language: "Select Language",
            latest_arrivals: "Latest Arrivals",
            search_placeholder: "Search for laptops, phones...",
            seller_dashboard: "Seller Dashboard",
        },
    },
    ha: {
        translation: {
            welcome: "Barka da zuwa Globalink",
            marketplace: "Kasuwa",
            jobs: "Ayyukan Kan Layi",
            delivery: "Isarwa",
            payments: "Biya",
            profile: "Bayanan Akaunti",
            language: "Harshe",
            select_language: "Zaɓi Harshe",
            latest_arrivals: "Sabbin Kaya",
            search_placeholder: "Nemi kwamfutar tafi-da-gidanka, wayoyi...",
            seller_dashboard: "Filin Mai Siyarwa",
        },
    },
    ar: {
        translation: {
            welcome: "مرحبًا بكم في Globalink",
            marketplace: "السوق",
            jobs: "وظائف عبر الإنترنت",
            delivery: "توصيل",
            payments: "المدفوعات",
            profile: "الملف الشخصي",
            language: "اللغة",
            select_language: "اختار اللغة",
            latest_arrivals: "أحدث الوافدين",
            search_placeholder: "ابحث عن أجهزة الكمبيوتر المحمولة والهواتف ...",
            seller_dashboard: "لوحة تحكم البائع",
        },
    },
};

const STORE_LANGUAGE_KEY = 'settings.lang';

const languageDetector = {
    type: 'languageDetector',
    async: true,
    init: () => { },
    detect: async function (callback: (lang: string) => void) {
        try {
            // 1. Check if user selected a language before
            const savedLanguage = await AsyncStorage.getItem(STORE_LANGUAGE_KEY);
            if (savedLanguage) {
                return callback(savedLanguage);
            }
        } catch (error) {
            console.log('Error reading language', error);
        }
        // 2. Fallback to phone's default language
        const bestLanguage = Localization.getLocales()[0]?.languageCode || 'en';
        callback(bestLanguage);
    },
    cacheUserLanguage: async function (language: string) {
        try {
            await AsyncStorage.setItem(STORE_LANGUAGE_KEY, language);
        } catch (error) {
            console.log('Error saving language', error);
        }
    },
};

i18n
    .use(initReactI18next)
    // @ts-ignore
    .use(languageDetector)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        react: {
            useSuspense: false
        }
    });

export default i18n;
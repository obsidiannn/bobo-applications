import i18n from "i18next";
import { initReactI18next } from 'react-i18next';
import zhHansCN from "./zh-Hans-CN";
import zhHantTW from "./zh-Hant-TW";
import zhHantHK from "./zh-Hant-HK";
import zhHantMO from "./zh-Hant-MO";
import enGB from "./en-GB";
import enUS from "./en-US";

export const supportedLanguages = () => {
    return [
        { label: '繁體中文(台湾)', value: 'zh-Hant-TW' },
        { label: '繁體中文(香港)', value: 'zh-Hant-HK' },
        { label: '繁體中文(澳门)', value: 'zh-Hant-MO' },
        { label: '简体中文(中国)', value: 'zh-Hans-CN' },
        { label: '英语(美国)', value: 'en-US' },
        { label: '英语(英国)', value: 'en-GB' },
    ]
}
const resources = {
    'zh': zhHansCN,
    'zh-Hant-TW': zhHantTW,
    'zh-Hant-HK': zhHantHK,
    'zh-Hant-MO': zhHantMO,
    'zh-Hant': zhHantTW,
    'zh-Hans': zhHansCN,
    'zh-Hans-CN': zhHansCN,
    'en-US': enUS,
    'en-GB': enGB,
}

i18n
    .use(initReactI18next)
    .init({
        compatibilityJSON: 'v3',
        resources,
        lng: 'zh-Hant-TW',
        supportedLngs: ['zh','zh-Hant-MO', 'zh-Hant-HK','zh-Hant','zh-Hans', 'zh-Hant-TW', 'zh-Hans-CN', 'zh-Hant-CN', 'en-US', 'en-GB'],
        fallbackLng: 'zh-Hant-TW',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
    })
export default i18n
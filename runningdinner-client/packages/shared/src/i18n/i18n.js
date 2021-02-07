import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import Admin_en from './translations/en/AdminMessages_lang_en.json';
import Admin_de from './translations/de/AdminMessages_lang_de.json';
import Common_en from './translations/en/CommonMessages_lang_en.json';
import Common_de from './translations/de/CommonMessages_lang_de.json';

const languageDetectionOptions = {
  order: ['querystring', 'cookie'],
  lookupCookie: 'NG_TRANSLATE_LANG_KEY',
  lookupQuerystring: 'lang'
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      detection: languageDetectionOptions,
      resources: {
        en: {
          common: Common_en,
          admin: Admin_en
        },
        de: {
          common: Common_de,
          admin: Admin_de
        }
      },
      fallbackLng: "de",
      debug: true,
      // lng: "de",
      whitelist: ['de', 'en'],

      // have a common namespace used around the full app
      defaultNS: "common",

      keySeparator: false, // we use content as keys

      interpolation: {
        escapeValue: false
      }
    });

export default i18n;

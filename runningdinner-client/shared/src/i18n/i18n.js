import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import Admin_en from './translations/en/AdminMessages_lang_en.json';
import Admin_de from './translations/de/AdminMessages_lang_de.json';
import Common_en from './translations/en/CommonMessages_lang_en.json';
import Common_de from './translations/de/CommonMessages_lang_de.json';
import Wizard_de from "./translations/de/WizardMessages_lang_de";
import Wizard_en from "./translations/en/WizardMessages_lang_en";
import SelfAdmin_de from "./translations/de/SelfAdminMessages_lang_de";
import SelfAdmin_en from "./translations/en/SelfAdminMessages_lang_en";
import Landing_de from "./translations/de/LandingMessages_lang_de";
import Landing_en from "./translations/en/LandingMessages_lang_en";

const languageDetectionOptions = {
  order: ['querystring', 'cookie'],
  lookupCookie: 'NG_TRANSLATE_LANG_KEY',
  lookupQuerystring: 'lang'
};

export function setupI18n() {
  i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        detection: languageDetectionOptions,
        resources: {
          en: {
            common: Common_en,
            admin: Admin_en,
            wizard: Wizard_en,
            selfadmin: SelfAdmin_en,
            landing: Landing_en
          },
          de: {
            common: Common_de,
            admin: Admin_de,
            wizard: Wizard_de,
            selfadmin: SelfAdmin_de,
            landing: Landing_de
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
}

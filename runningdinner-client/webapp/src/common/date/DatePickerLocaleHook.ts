import deLocale from "date-fns/locale/de";
import enLocale from "date-fns/locale/en-US";
import {useTranslation} from "react-i18next";

const localeMap: Record<string, any> = {
  "en": {
    translationBundle: enLocale,
    dateFormat: "yyyy-MM-dd"
  },
  "de": {
    translationBundle: deLocale,
    dateFormat: "dd.MM.yyyy"
  }
};

export default function useDatePickerLocale() {

  const {i18n} = useTranslation();

  const language = (i18n.language || "de").toLowerCase();
  const locale = localeMap[language]?.translationBundle || deLocale;

  const dateFormat = localeMap[language]?.dateFormat || "dd.MM.yyyy";

  return {
    locale,
    dateFormat
  };
}

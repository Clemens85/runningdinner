import deLocale from "date-fns/locale/de";
import enLocale from "date-fns/locale/en-US";
import {useTranslation} from "react-i18next";

const localeMap: Record<string, any> = {
  "en": enLocale,
  "de": deLocale
};

export default function useDatePickerLocale() {

  const {i18n} = useTranslation();

  const language = (i18n.language || "de").toLowerCase();
  const locale = localeMap[language] || deLocale;
  return locale;
}

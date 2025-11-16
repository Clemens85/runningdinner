import React from 'react';
import { useTranslation } from 'react-i18next';

export function LanguageChangeHandler() {
  const { i18n } = useTranslation();

  React.useEffect(() => {
    console.log('Initializing LanguageChangeHandler');
    updateI18nCookie(i18n.language || 'de');
    i18n.on('languageChanged', updateI18nCookie);
  }, [i18n]);

  return null;
}

function updateI18nCookie(changedLanguage: string) {
  document.cookie = `NG_TRANSLATE_LANG_KEY=${changedLanguage}; path=/`;
}

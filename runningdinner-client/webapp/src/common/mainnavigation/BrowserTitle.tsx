import { useTranslation } from 'react-i18next';

export interface BrowserTitleProps {
  titleI18nKey: string;
  namespaces: string | string[];
}

export function BrowserTitle({ titleI18nKey, namespaces }: BrowserTitleProps) {
  const { t } = useTranslation(namespaces);
  return <title>{t(titleI18nKey)}</title>;
}

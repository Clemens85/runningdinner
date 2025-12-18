import { useTranslation } from 'react-i18next';
import { SuperSEO } from 'react-super-seo';

export interface BrowserTitleProps {
  titleI18nKey: string;
  namespaces: string | string[];
}

export function BrowserTitle({ titleI18nKey, namespaces }: BrowserTitleProps) {
  const { t } = useTranslation(namespaces);
  return <SuperSEO title={t(titleI18nKey)} />;
}

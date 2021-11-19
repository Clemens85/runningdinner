import {useTranslation} from "react-i18next";
import {Helmet} from "react-helmet-async";
import React from "react";

export interface BrowserTitleProps {
  titleI18nKey: string;
  namespaces: string | string[];
}

export function BrowserTitle({titleI18nKey, namespaces}: BrowserTitleProps) {

  const {t} = useTranslation(namespaces);

  return (
    <Helmet>
      <title>{t(titleI18nKey)}</title>
    </Helmet>
  );
}
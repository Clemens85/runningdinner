import React from 'react';
import { useTranslation } from 'react-i18next';

export function TeamNr({ teamNumber }) {
  const { t } = useTranslation('admin');
  return <>{t('team', { teamNumber: teamNumber })}</>;
}

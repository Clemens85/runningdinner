import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Paragraph from '../common/theme/typography/Paragraph';

export function RegistrationPaymentProgressBackdrop() {
  const { t } = useTranslation('landing');

  return (
    <Backdrop open={true} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: '#ffffff' }}>
      <CircularProgress color="inherit" />
      <Paragraph>&nbsp; {t('landing:payment_processing')}</Paragraph>
    </Backdrop>
  );
}

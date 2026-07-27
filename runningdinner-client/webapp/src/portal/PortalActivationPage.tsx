import { Alert, Container } from '@mui/material';
import { storePortalToken } from '@runningdinner/shared';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { MY_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';

export function PortalActivationPage() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const { portalToken } = useParams<{ portalToken: string }>();

  // Side-effect only: store the token and navigate away when it is present.
  // No setState needed because the error condition is derived directly from the URL param below.
  useEffect(() => {
    if (!portalToken) {
      return;
    }
    storePortalToken(portalToken);
    navigate(MY_EVENTS_PATH, { replace: true });
  }, [portalToken, navigate]);

  if (!portalToken) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{t('portal_activation_error')}</Alert>
      </Container>
    );
  }

  return null;
}

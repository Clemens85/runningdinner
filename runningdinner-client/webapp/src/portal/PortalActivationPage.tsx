import { Alert, Container } from '@mui/material';
import { storePortalToken } from '@runningdinner/shared';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { MY_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';

export function PortalActivationPage() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const { portalToken } = useParams<{ portalToken: string }>();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!portalToken) {
      setError(true);
      return;
    }
    storePortalToken(portalToken);
    navigate(MY_EVENTS_PATH, { replace: true });
  }, [portalToken, navigate]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{t('portal_activation_error')}</Alert>
      </Container>
    );
  }

  return null;
}

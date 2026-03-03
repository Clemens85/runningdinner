import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material';
import { mergeCredentials, resolvePortalToken } from '@runningdinner/shared';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { MY_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';

export function PortalActivationPage() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const { portalToken } = useParams<{ portalToken: string }>();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!portalToken) {
      setError(true);
      return;
    }

    const confirmPublicDinnerId = searchParams.get('confirmPublicDinnerId') ?? undefined;
    const confirmParticipantId = searchParams.get('confirmParticipantId') ?? undefined;
    const confirmAdminId = searchParams.get('confirmAdminId') ?? undefined;

    resolvePortalToken(portalToken, { confirmPublicDinnerId, confirmParticipantId, confirmAdminId })
      .then((response) => {
        mergeCredentials(response.credentials);
        navigate(`${MY_EVENTS_PATH}`, { replace: true });
      })
      .catch(() => {
        setError(true);
      });
  }, [portalToken, searchParams, navigate]);

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">{t('portal_activation_error')}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>{t('portal_activation_loading')}</Typography>
      </Box>
    </Container>
  );
}

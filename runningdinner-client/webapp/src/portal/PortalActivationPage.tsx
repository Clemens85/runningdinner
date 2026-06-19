import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material';
import { confirmPortalEvent, validatePortalToken, storePortalToken } from '@runningdinner/shared';
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

    const hasConfirmParams = confirmPublicDinnerId || confirmParticipantId || confirmAdminId;

    // Step 1: validate the token via GET (no side effects — safe against email scanner prefetching).
    // Step 2: if confirmation params are present, POST them separately so only a real browser
    //         page load (not a link-preview bot) can trigger participant/organizer confirmation.
    validatePortalToken(portalToken)
      .then(() => {
        if (hasConfirmParams) {
          return confirmPortalEvent(portalToken, { confirmPublicDinnerId, confirmParticipantId, confirmAdminId });
        }
      })
      .then(() => {
        storePortalToken(portalToken);
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

import { CircularProgress, Container } from '@mui/material';
import { activateSubscribedParticipant } from '@runningdinner/shared';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { MY_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';

/**
 * Handles the legacy activation URL `/running-dinner-events/:publicDinnerId/:participantId/activate`.
 * Performs idempotent participant activation and then redirects to the portal landing page (/my-events).
 * Backward-compatibility entry point for users who receive old-style activation emails.
 * TODO: Check out if this works as expected (I want also to show acknowledged info in the portal 
 * in case of successful activation)
 */
export function LegacyActivationRedirectPage() {
  const navigate = useNavigate();
  const params = useParams<Record<string, string>>();
  const publicDinnerId = params.publicDinnerId || '';
  const participantId = params.participantId || '';

  const { isSuccess, isError } = useQuery({
    queryKey: ['legacyActivation', publicDinnerId, participantId],
    queryFn: () => activateSubscribedParticipant(publicDinnerId, participantId),
    enabled: !!(publicDinnerId && participantId),
    retry: 1,
  });

  useEffect(() => {
    if (isSuccess || isError) {
      // Whether activation succeeded or failed (e.g., already activated), redirect to the portal.
      navigate(`${MY_EVENTS_PATH}`, { replace: true });
    }
  }, [isSuccess, isError, navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress />
    </Container>
  );
}

import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material';
import { useMyEvents } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

import { AccessRecoveryForm } from './AccessRecoveryForm';
import { ForgetMeButton } from './ForgetMeButton';
import { MyEventsEntryList } from './MyEventsEntryList';
import { PageTitle } from '../common/theme/typography/Tags';

export function MyEventsPage() {
  const { t } = useTranslation('portal');
  const { data, isPending, isError } = useMyEvents();

  const events = data?.events ?? [];
  const hasEvents = events.length > 0;

  return (
    <>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <PageTitle>{t('my_events_title')}</PageTitle>

        <Container maxWidth="sm">
          {isPending && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {!isPending && isError && (
            <Alert severity="error">{t('my_events_error')}</Alert>
          )}

          {!isPending && !isError && hasEvents && (
            <>
              <MyEventsEntryList events={events} />
              <Box sx={{ mt: 3 }}>
                <ForgetMeButton />
              </Box>
            </>
          )}

          {!isPending && !isError && !hasEvents && (
            <Box>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {t('my_events_empty')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t('my_events_empty_hint')}
              </Typography>
              <AccessRecoveryForm />
            </Box>
          )}
          </Container>
      </Container>
    </>
  );
}

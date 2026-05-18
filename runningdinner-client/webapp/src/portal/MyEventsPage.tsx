import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Alert, Box, CircularProgress, Collapse, Container, Divider, Typography } from '@mui/material';
import { useMyEvents } from '@runningdinner/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AccessRecoveryForm } from './AccessRecoveryForm';
import { ForgetMeButton } from './ForgetMeButton';
import { MyEventsEntryList } from './MyEventsEntryList';
import { PageTitle } from '../common/theme/typography/Tags';

export function MyEventsPage() {
  const { t } = useTranslation('portal');
  const { data, isPending, isError } = useMyEvents();
  const [showAccessForm, setShowAccessForm] = useState(false);

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

          {!isPending && isError && <Alert severity="error">{t('my_events_error')}</Alert>}

          {!isPending && !isError && hasEvents && (
            <>
              <MyEventsEntryList events={events} />
              <Divider sx={{ my: 3 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box
                  component="button"
                  onClick={() => setShowAccessForm((prev) => !prev)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'primary.main',
                    typography: 'body2',
                    fontWeight: 500,
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {t('access_recovery_missing_event_link')}
                  {showAccessForm ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </Box>
                <ForgetMeButton iconOnly />
              </Box>
              <Collapse in={showAccessForm}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('access_recovery_missing_event_hint')}
                  </Typography>
                  <AccessRecoveryForm />
                </Box>
              </Collapse>
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

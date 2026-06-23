import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Alert, Box, Collapse, Container, Divider, Typography } from '@mui/material';
import { isQuerySucceeded, PortalEventEntry, useMyEvents } from '@runningdinner/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FetchProgressBar } from '../common/FetchProgressBar';
import { PageTitle } from '../common/theme/typography/Tags';
import { AccessRecoveryForm } from './AccessRecoveryForm';
import { ForgetMeButton } from './ForgetMeButton';
import { MyEventsEntryList } from './MyEventsEntryList';

type MyEventsViewProps = {
  events: PortalEventEntry[];
};

function MyEventsView({ events }: MyEventsViewProps) {
  const { t } = useTranslation('portal');
  const [showAccessForm, setShowAccessForm] = useState(false);

  return (
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
  );
}

function FirstUsageInfo() {
  const { t } = useTranslation('portal');
  return (
    <Box>
      <Alert severity="info" variant="outlined" sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          {t('my_events_empty')}
        </Typography>
        <Typography variant="body2">{t('my_events_empty_intro')}</Typography>
      </Alert>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        {t('my_events_empty_how_to_get_access')}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t('my_events_empty_how_to_hint')}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <AccessRecoveryForm />
      </Box>
    </Box>
  );
}

export function MyEventsPage() {
  const { t } = useTranslation('portal');
  const myEventsQuery = useMyEvents();
  const events = myEventsQuery.data?.events ?? [];

  if (!isQuerySucceeded(myEventsQuery)) {
    return (
      <Container maxWidth={false} sx={{ py: 4 }}>
        <PageTitle>{t('my_events_title')}</PageTitle>
        <FetchProgressBar {...myEventsQuery} />
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <PageTitle>{t('my_events_title')}</PageTitle>
      <Container maxWidth="md">{events.length > 0 ? <MyEventsView events={events} /> : <FirstUsageInfo />}</Container>
    </Container>
  );
}

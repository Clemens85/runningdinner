import { Box, Button, Grid, Stack, Typography } from '@mui/material';
import {
  formatLocalDate,
  isStringEmpty,
  isStringNotEmpty,
  PortalCredential,
  PortalEventEntry,
  useParticipantMessages,
  useParticipantSelfServiceInfo,
  usePortalEventEntry,
} from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';
import { Location, useLocation, useNavigate, useParams } from 'react-router-dom';

import { FetchProgressBar } from '../../common/FetchProgressBar.tsx';
import { MY_EVENTS_PATH } from '../../common/mainnavigation/NavigationPaths.ts';
import { PageTitle } from '../../common/theme/typography/Tags';
import { DinnerRouteSection } from './DinnerRouteSection.tsx';
import { MessagesSection } from './MessagesSection.tsx';
import { MyTeamSection } from './MyTeamSection.tsx';

type ParticipantSelfServiceViewProps = {
  event: PortalEventEntry;
  credential: PortalCredential;
};

function ParticipantSelfServiceView({ event, credential }: ParticipantSelfServiceViewProps) {
  const { selfAdminId, participantId, portalToken } = credential;
  const { data: participantInfo, isLoading: isTeamInfoLoading } = useParticipantSelfServiceInfo(selfAdminId!, participantId!, portalToken);
  const { data: messages, isLoading: isMessagesLoading } = useParticipantMessages(selfAdminId!, participantId!, portalToken);

  const eventDateFormatted = formatLocalDate(event.eventDate);

  return (
    <>
      {/* Event header */}
      <Box sx={{ mb: 3 }}>
        <PageTitle sx={{ mb: 0.5 }}>{event.eventName}</PageTitle>
        <Typography variant="body2" color="text.secondary">
          {event.city}
          {isStringNotEmpty(eventDateFormatted) ? ` · ${eventDateFormatted}` : ''}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Left column: Team + Dinner Route */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2}>
            <MyTeamSection participantInfo={participantInfo} isLoading={isTeamInfoLoading} />
            <DinnerRouteSection participantInfo={participantInfo} isLoading={isTeamInfoLoading} />
          </Stack>
        </Grid>

        {/* Right column: Messages */}
        <Grid size={{ xs: 12, md: 6 }}>
          <MessagesSection messages={messages} isLoading={isMessagesLoading} />
        </Grid>
      </Grid>
    </>
  );
}

function getPortalEventEntryFromRouterState(location: Location): PortalEventEntry | null {
  const state = location.state as { event: PortalEventEntry } | null;
  return state?.event ?? null;
}

export function ParticipantSelfServicePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation('portal');

  const { selfAdminId = '', participantId = '' } = useParams<{ selfAdminId: string; participantId: string }>();

  const { event, portalToken, isLoading: isLoadingEvent } = usePortalEventEntry(selfAdminId, participantId, getPortalEventEntryFromRouterState(location));

  // If we arrive here without URL params (shouldn't happen normally), go back to list
  if (!selfAdminId || !participantId) {
    navigate(MY_EVENTS_PATH, { replace: true });
    return null;
  }

  if (isLoadingEvent) {
    return <FetchProgressBar isPending={isLoadingEvent} error={undefined} />;
  }
  if (!event || isStringEmpty(portalToken)) {
    return null;
  }

  const credential: PortalCredential = {
    selfAdminId,
    participantId,
    portalToken: portalToken!,
    role: 'PARTICIPANT',
  };

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ mb: 2 }}>
        <Button size="small" variant="text" onClick={() => navigate(MY_EVENTS_PATH)} sx={{ textTransform: 'none', pl: 0 }}>
          ← {t('participant_event_back')}
        </Button>
      </Box>
      <ParticipantSelfServiceView event={event} credential={credential} />
    </Box>
  );
}

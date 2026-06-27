import EmailIcon from '@mui/icons-material/Email';
import { Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { formatLocalDate, isStringEmpty, isStringNotEmpty, PortalCredential, PortalEventEntry, useParticipantSelfServiceInfo, usePortalEventEntry } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';
import { Location, useLocation, useNavigate, useParams } from 'react-router-dom';

import { FetchProgressBar } from '../../common/FetchProgressBar.tsx';
import { MY_EVENTS_PATH } from '../../common/mainnavigation/NavigationPaths.ts';
import { PageTitle } from '../../common/theme/typography/Tags';
import { DinnerRouteSection } from './DinnerRouteSection.tsx';
import { MyTeamSection } from './MyTeamSection.tsx';

// ---------------------------------------------------------------------------
// Section: Messages
// ---------------------------------------------------------------------------

type MessageType = 'PARTICIPANT' | 'TEAM' | 'DINNER_ROUTE';

interface MessageTypeBadgeProps {
  type: MessageType;
}

function MessageTypeBadge({ type }: MessageTypeBadgeProps) {
  const { t } = useTranslation('portal');
  const labelMap: Record<MessageType, string> = {
    PARTICIPANT: t('participant_event_msg_type_participant'),
    TEAM: t('participant_event_msg_type_team'),
    DINNER_ROUTE: t('participant_event_msg_type_dinnerroute'),
  };
  const colorMap: Record<MessageType, 'default' | 'primary' | 'secondary'> = {
    PARTICIPANT: 'default',
    TEAM: 'primary',
    DINNER_ROUTE: 'secondary',
  };
  return <Chip label={labelMap[type]} color={colorMap[type]} size="small" />;
}

function MessagesSection() {
  const { t } = useTranslation('portal');
  // TODO: wire up real message data from backend (participant-portal messages API)
  const messages: unknown[] = [];

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <EmailIcon color="primary" />
          <Typography variant="h6">{t('participant_event_section_messages')}</Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('participant_event_messages_intro')}
        </Typography>

        {messages.length === 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
              <MessageTypeBadge type="PARTICIPANT" />
              <MessageTypeBadge type="TEAM" />
              <MessageTypeBadge type="DINNER_ROUTE" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t('participant_event_messages_empty')}
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}

type ParticipantSelfServiceViewProps = {
  event: PortalEventEntry;
  credential: PortalCredential;
};

function ParticipantSelfServiceView({ event, credential }: ParticipantSelfServiceViewProps) {
  const { selfAdminId, participantId, portalToken } = credential;
  const { data: participantInfo, isLoading: isTeamInfoLoading } = useParticipantSelfServiceInfo(selfAdminId!, participantId!, portalToken);

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
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            <MyTeamSection participantInfo={participantInfo} isLoading={isTeamInfoLoading} />
            <DinnerRouteSection participantInfo={participantInfo} isLoading={isTeamInfoLoading} />
          </Stack>
        </Grid>

        {/* Right column: Messages */}
        <Grid size={{ xs: 12, md: 5 }}>
          <MessagesSection />
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

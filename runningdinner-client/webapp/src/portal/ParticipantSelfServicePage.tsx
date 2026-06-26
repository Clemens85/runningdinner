import DirectionsIcon from '@mui/icons-material/Directions';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, Stack, Typography } from '@mui/material';
import { formatLocalDate, isStringNotEmpty, PortalEventEntry, PortalParticipantInfo, useParticipantSelfServiceInfo } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { MY_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';
import { PageTitle } from '../common/theme/typography/Tags';

// ---------------------------------------------------------------------------
// Self-service URL helpers — need selfAdminId + participantId from URL params
// ---------------------------------------------------------------------------

function buildDinnerRouteUrl(selfAdminId: string, participantId: string, teamId: string | null): string | null {
  if (!teamId) {
    return null;
  }
  return `/self/${selfAdminId}/dinnerroute/${participantId}/${teamId}`;
}

function buildChangeTeamHostUrl(selfAdminId: string, participantId: string, teamId: string | null): string | null {
  if (!teamId) {
    return null;
  }
  return `/self/${selfAdminId}/teamhost/${participantId}/${teamId}`;
}

// ---------------------------------------------------------------------------
// Section: My Team
// ---------------------------------------------------------------------------

interface MyTeamSectionProps {
  selfAdminId: string;
  participantId: string;
  participantInfo: PortalParticipantInfo | undefined;
  isLoading: boolean;
}

function MyTeamSection({ selfAdminId, participantId, participantInfo, isLoading }: MyTeamSectionProps) {
  const { t } = useTranslation('portal');
  const changeTeamHostUrl = participantInfo ? buildChangeTeamHostUrl(selfAdminId, participantId, participantInfo.teamId) : null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <GroupIcon color="primary" />
          <Typography variant="h6">{t('participant_event_section_team')}</Typography>
          {isLoading && <CircularProgress size={16} sx={{ ml: 'auto' }} />}
        </Stack>

        {!participantInfo?.teamId && (
          <Alert severity="info" icon={false}>
            {t('participant_event_team_pending')}
          </Alert>
        )}

        {changeTeamHostUrl ? (
          <Button variant="outlined" component={Link} to={changeTeamHostUrl} size="small" sx={{ mt: 1 }}>
            {t('participant_event_change_teamhost')}
          </Button>
        ) : (
          participantInfo?.teamId &&
          !participantInfo.changeTeamHostAvailable && (
            <Alert severity="info" icon={false} sx={{ mt: 1 }}>
              {t('participant_event_changeteamhost_pending')}
            </Alert>
          )
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section: Dinner Route
// ---------------------------------------------------------------------------

interface DinnerRouteSectionProps {
  selfAdminId: string;
  participantId: string;
  participantInfo: PortalParticipantInfo | undefined;
  isLoading: boolean;
}

function DinnerRouteSection({ selfAdminId, participantId, participantInfo, isLoading }: DinnerRouteSectionProps) {
  const { t } = useTranslation('portal');
  const dinnerRouteUrl = participantInfo ? buildDinnerRouteUrl(selfAdminId, participantId, participantInfo.teamId) : null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <DirectionsIcon color="primary" />
          <Typography variant="h6">{t('participant_event_section_dinnerroute')}</Typography>
          {isLoading && <CircularProgress size={16} sx={{ ml: 'auto' }} />}
        </Stack>

        {dinnerRouteUrl && participantInfo?.dinnerRouteAvailable ? (
          <Button variant="contained" component={Link} to={dinnerRouteUrl} size="small">
            {t('participant_event_view_dinnerroute')}
          </Button>
        ) : (
          <Alert severity="info" icon={false}>
            {t('participant_event_dinnerroute_pending')}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

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

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

interface ParticipantEventPageState {
  event: PortalEventEntry;
}

export function ParticipantSelfServicePage() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const location = useLocation();
  const { selfAdminId = '', participantId = '' } = useParams<{ selfAdminId: string; participantId: string }>();

  const state = location.state as ParticipantEventPageState | null;
  const event = state?.event ?? null;

  // portalToken lives on the credentials that were passed via navigation state
  const portalToken = event?.credentials?.PARTICIPANT?.portalToken ?? null;

  const { data: participantInfo, isLoading } = useParticipantSelfServiceInfo(selfAdminId, participantId, portalToken);

  // If we arrive here without URL params (shouldn't happen normally), go back to list
  if (!selfAdminId || !participantId) {
    navigate(MY_EVENTS_PATH, { replace: true });
    return null;
  }

  const eventDateFormatted = event ? formatLocalDate(event.eventDate) : null;

  return (
    <Box sx={{ py: 4 }}>
      {/* Back link */}
      <Box sx={{ mb: 2 }}>
        <Button size="small" variant="text" onClick={() => navigate(-1)} sx={{ textTransform: 'none', pl: 0 }}>
          ← {t('participant_event_back')}
        </Button>
      </Box>

      {/* Event header — comes from navigation state; gracefully absent on hard refresh */}
      {event && (
        <Box sx={{ mb: 3 }}>
          <PageTitle sx={{ mb: 0.5 }}>{event.eventName}</PageTitle>
          <Typography variant="body2" color="text.secondary">
            {event.city}
            {isStringNotEmpty(eventDateFormatted) ? ` · ${eventDateFormatted}` : ''}
          </Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        {/* Left column: Team + Dinner Route */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Stack spacing={2}>
            <MyTeamSection selfAdminId={selfAdminId} participantId={participantId} participantInfo={participantInfo} isLoading={isLoading} />
            <DinnerRouteSection selfAdminId={selfAdminId} participantId={participantId} participantInfo={participantInfo} isLoading={isLoading} />
          </Stack>
        </Grid>

        {/* Right column: Messages */}
        <Grid size={{ xs: 12, md: 5 }}>
          <MessagesSection />
        </Grid>
      </Grid>
    </Box>
  );
}

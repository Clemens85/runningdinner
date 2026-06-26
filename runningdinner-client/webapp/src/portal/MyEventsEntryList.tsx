import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, Card, CardActions, CardContent, Chip, Divider, Grid, Typography } from '@mui/material';
import { formatLocalDate, isStringEmpty, PortalEventEntry } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface MyEventsEntryListProps {
  events: PortalEventEntry[];
}

function EventRoleChip({ roles }: PortalEventEntry) {
  const { t } = useTranslation('portal');
  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {roles.map((role) => {
        const isOrganizer = role === 'ORGANIZER';
        const label = isOrganizer ? t('role_organizer') : t('role_participant');
        return <Chip key={role} label={label} size="small" color={isOrganizer ? 'primary' : 'default'} sx={{ flexShrink: 0, mt: 0.25 }} />;
      })}
    </Box>
  );
}

function EventInfo({ city, eventDate }: PortalEventEntry) {
  const eventDateFormatted = formatLocalDate(eventDate);
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
      {city}
      {eventDate ? ` · ${eventDateFormatted}` : ''}
    </Typography>
  );
}

function ManageEventButton({ credentials, roles }: PortalEventEntry) {
  const { t } = useTranslation('portal');
  const adminUrl = credentials?.ORGANIZER?.adminUrl;
  if (isStringEmpty(adminUrl) || !roles.includes('ORGANIZER')) {
    return null;
  }
  return (
    <Button size="small" variant="text" color="primary" href={adminUrl!} target="_blank" rel="noopener noreferrer" startIcon={<SettingsIcon fontSize="inherit" />}>
      {t('manage_event')}
    </Button>
  );
}

function OpenPublicEventPageButton({ publicUrl }: PortalEventEntry) {
  const { t } = useTranslation('portal');
  if (isStringEmpty(publicUrl)) {
    return null;
  }
  return (
    <Button size="small" variant="outlined" color="primary" href={publicUrl!} target="_blank" rel="noopener noreferrer" endIcon={<OpenInNewIcon fontSize="inherit" />}>
      {t('view_event_page')}
    </Button>
  );
}

interface MyParticipationButtonProps {
  event: PortalEventEntry;
}

function MyParticipationButton({ event }: MyParticipationButtonProps) {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const participantCred = event.credentials?.PARTICIPANT;
  if (!event.roles.includes('PARTICIPANT') || !participantCred) {
    return null;
  }
  const { selfAdminId, participantId } = participantCred;
  return (
    <Button
      size="small"
      variant="contained"
      color="primary"
      startIcon={<PersonIcon fontSize="inherit" />}
      onClick={() => navigate(`event/${selfAdminId}/${participantId}`, { state: { event } })}
    >
      {t('view_participation')}
    </Button>
  );
}

export function MyEventsEntryList({ events }: MyEventsEntryListProps) {
  return (
    <Grid container spacing={2}>
      {events.map((event, index) => (
        <Grid key={index} size={{ xs: 12 }}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, gap: { sm: 1 } }}>
                <Typography variant="h6" sx={{ lineHeight: 1.3, flex: { sm: 1 }, minWidth: 0 }}>
                  {event.eventName}
                </Typography>
                <Box sx={{ mt: { xs: 0.75, sm: 0 }, flexShrink: 0 }}>
                  <EventRoleChip {...event} />
                </Box>
              </Box>
              <EventInfo {...event} />
            </CardContent>

            <Divider />

            <CardActions sx={{ px: 2, py: 1.5, gap: 1, flexWrap: 'wrap' }}>
              <MyParticipationButton event={event} />
              <OpenPublicEventPageButton {...event} />
              <ManageEventButton {...event} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

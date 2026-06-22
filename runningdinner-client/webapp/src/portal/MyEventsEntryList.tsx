import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, Card, CardActions, CardContent, Chip, Divider, Grid, Typography } from '@mui/material';
import { formatLocalDate, isStringEmpty, PortalEventEntry } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

interface MyEventsEntryListProps {
  events: PortalEventEntry[];
}

function EventRoleChip({ role }: PortalEventEntry) {
  const { t } = useTranslation('portal');
  const isOrganizer = role === 'ORGANIZER';
  const label = isOrganizer ? t('role_organizer') : t('role_participant');
  return <Chip label={label} size="small" color={isOrganizer ? 'primary' : 'default'} sx={{ flexShrink: 0, mt: 0.25 }} />;
}

function EventInfo({ city, eventDate }: PortalEventEntry) {
  const eventDateFromatted = formatLocalDate(eventDate);
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
      {city}
      {eventDate ? ` · ${eventDateFromatted}` : ''}
    </Typography>
  );
}

function ManageEventButton({ adminUrl, role }: PortalEventEntry) {
  const { t } = useTranslation('portal');
  if (isStringEmpty(adminUrl) || role !== 'ORGANIZER') {
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

export function MyEventsEntryList({ events }: MyEventsEntryListProps) {
  return (
    <Grid container spacing={2}>
      {events.map((event, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6 }}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                  {event.eventName}
                </Typography>
                <EventRoleChip {...event} />
              </Box>
              <EventInfo {...event} />
            </CardContent>

            <Divider />

            <CardActions sx={{ px: 2, py: 1.5, gap: 1, flexWrap: 'wrap' }}>
              <OpenPublicEventPageButton {...event} />
              <ManageEventButton {...event} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

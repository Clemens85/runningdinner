import { Box, Card, CardContent, Chip, Grid, Link, Typography } from '@mui/material';
import { PortalEventEntry } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

interface MyEventsEntryListProps {
  events: PortalEventEntry[];
}

export function MyEventsEntryList({ events }: MyEventsEntryListProps) {
  const { t } = useTranslation('portal');

  return (
    <Grid container spacing={2}>
      {events.map((event, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6 }}>
          <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="h6" gutterBottom>
                {event.eventName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {event.city}
                {event.eventDate ? ` · ${new Date(event.eventDate).toLocaleDateString()}` : ''}
              </Typography>
              <Chip
                label={event.role === 'ORGANIZER' ? t('role_organizer') : t('role_participant')}
                size="small"
                color={event.role === 'ORGANIZER' ? 'primary' : 'default'}
                sx={{ mt: 0.5 }}
              />
              {event.role === 'ORGANIZER' && event.adminUrl && (
                <Box sx={{ mt: 1.5 }}>
                  <Link href={event.adminUrl} underline="hover" color="primary" variant="body2">
                    {t('manage_event')}
                  </Link>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

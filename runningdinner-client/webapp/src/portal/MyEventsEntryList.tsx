import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box, Button, Card, CardActions, CardContent, Chip, Divider, Grid, Typography } from '@mui/material';
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
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="h6" sx={{ lineHeight: 1.3 }}>
                  {event.eventName}
                </Typography>
                <Chip
                  label={event.role === 'ORGANIZER' ? t('role_organizer') : t('role_participant')}
                  size="small"
                  color={event.role === 'ORGANIZER' ? 'primary' : 'default'}
                  sx={{ flexShrink: 0, mt: 0.25 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {event.city}
                {event.eventDate ? ` · ${new Date(event.eventDate).toLocaleDateString()}` : ''}
              </Typography>
            </CardContent>

            <Divider />

            <CardActions sx={{ px: 2, py: 1.5, gap: 1, flexWrap: 'wrap' }}>
              {event.publicUrl && (
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  href={event.publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<OpenInNewIcon fontSize="inherit" />}
                >
                  {t('view_event_page')}
                </Button>
              )}
              {event.role === 'ORGANIZER' && event.adminUrl && (
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  href={event.adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<SettingsIcon fontSize="inherit" />}
                >
                  {t('manage_event')}
                </Button>
              )}
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

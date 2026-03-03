import { Alert, Chip, Link, List, ListItem, ListItemText, Typography } from '@mui/material';
import { PortalEventEntry } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

interface MyEventsEntryListProps {
  events: PortalEventEntry[];
}

export function MyEventsEntryList({ events }: MyEventsEntryListProps) {
  const { t } = useTranslation('portal');

  return (
    <List disablePadding>
      {events.map((event, index) => (
        <ListItem
          key={index}
          divider={index < events.length - 1}
          alignItems="flex-start"
          sx={{ py: 2, px: 0 }}
        >
          <ListItemText
            primary={
              <Typography variant="h6" component="span">
                {event.eventName}
              </Typography>
            }
            secondaryTypographyProps={{ component: 'div' } as any}
            secondary={
              <>
                <Typography variant="body2" color="text.secondary">
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
                  <Link
                    href={event.adminUrl}
                    sx={{ display: 'block', mt: 0.5 }}
                    underline="hover"
                    color="primary"
                  >
                    {t('manage_event')}
                  </Link>
                )}
              </>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}

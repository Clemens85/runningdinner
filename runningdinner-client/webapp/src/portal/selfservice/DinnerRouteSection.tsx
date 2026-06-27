import DirectionsIcon from '@mui/icons-material/Directions';
import { Alert, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material';
import { PortalParticipantInfo } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface DinnerRouteSectionProps {
  selfAdminId: string;
  participantId: string;
  participantInfo: PortalParticipantInfo | undefined;
  isLoading: boolean;
}

export function DinnerRouteSection({ selfAdminId: _selfAdminId, participantId: _participantId, participantInfo, isLoading }: DinnerRouteSectionProps) {
  const { t } = useTranslation('portal');
  // TODO: provide own logic for dinner route URL
  const dinnerRouteUrl = null;

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

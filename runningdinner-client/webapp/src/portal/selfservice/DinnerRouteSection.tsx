import DirectionsIcon from '@mui/icons-material/Directions';
import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { isStringNotEmpty, PortalParticipantInfo } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

import { FetchProgressBar } from '../../common/FetchProgressBar.tsx';

interface DinnerRouteSectionProps {
  participantInfo: PortalParticipantInfo | undefined;
  isLoading: boolean;
}

export function DinnerRouteSection({ participantInfo, isLoading }: DinnerRouteSectionProps) {
  const { t } = useTranslation('portal');

  if (isLoading) {
    return <FetchProgressBar isPending={isLoading} error={undefined} />;
  }

  const dinnerRouteUrl = participantInfo?.dinnerRouteUrl ?? null;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <DirectionsIcon color="primary" />
          <Typography variant="h6">{t('participant_event_section_dinnerroute')}</Typography>
        </Stack>

        {isStringNotEmpty(dinnerRouteUrl) ? (
          <Stack spacing={1.5}>
            <Button variant="contained" size="small" href={dinnerRouteUrl!} target="_blank" rel="noopener noreferrer" sx={{ alignSelf: 'flex-start' }}>
              {t('participant_event_view_dinnerroute')}
            </Button>
            <Typography variant="body2" color="text.secondary">
              {t('participant_event_dinnerroute_mealspecifics_hint')}
            </Typography>
          </Stack>
        ) : (
          <Alert severity="info" icon={false}>
            {t('participant_event_dinnerroute_pending')}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { isStringEmpty, PortalParticipantInfo, TeamSelfServiceInfo, Time } from '@runningdinner/shared';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { FetchProgressBar } from '../../common/FetchProgressBar.tsx';

function TeamInfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 1 }} sx={{ mt: 1.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: { sm: 90 }, flexShrink: 0 }}>
        {label}:
      </Typography>
      <Box sx={{ typography: 'body2' }}>{value}</Box>
    </Stack>
  );
}

function TeamPartnerEmailLink({ teamPartnerEmail }: TeamSelfServiceInfo) {
  if (isStringEmpty(teamPartnerEmail)) {
    return null;
  }
  return (
    <Box
      component="a"
      href={`mailto:${teamPartnerEmail}`}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
    >
      <EmailIcon sx={{ fontSize: 14 }} color="action" />
      {teamPartnerEmail}
    </Box>
  );
}

function TeamPartnerMobileNumberLink({ teamPartnerMobileNumber }: TeamSelfServiceInfo) {
  if (isStringEmpty(teamPartnerMobileNumber)) {
    return null;
  }
  return (
    <Box
      component="a"
      href={`tel:${teamPartnerMobileNumber}`}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'inherit', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
    >
      <PhoneAndroidIcon sx={{ fontSize: 14 }} color="action" />
      {teamPartnerMobileNumber}
    </Box>
  );
}

function TeamHostInfo({ selfIsHost, hostName }: TeamSelfServiceInfo) {
  const { t } = useTranslation('portal');
  return (
    <>
      <span>{hostName}</span>
      {selfIsHost && <Chip label={t('participant_event_team_host_self_badge')} size="small" color="success" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />}
    </>
  );
}

function MealDetails({ mealTime, mealLabel }: TeamSelfServiceInfo) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Chip
        label={
          <>
            <Time date={mealTime} /> — {mealLabel}
          </>
        }
        size="small"
        color="primary"
        variant="outlined"
      />
    </Box>
  );
}

function TeamDetails({ info }: { info: TeamSelfServiceInfo }) {
  const { t } = useTranslation('portal');
  return (
    <Box sx={{ mb: 2 }}>
      <MealDetails {...info} />
      <TeamInfoRow
        label={t('participant_event_team_partner')}
        value={
          <Stack direction="column" spacing={0.25}>
            <span>{info.teamPartnerName}</span>
            <TeamPartnerEmailLink {...info} />
            <TeamPartnerMobileNumberLink {...info} />
          </Stack>
        }
      />
      <TeamInfoRow
        label={t('participant_event_team_host')}
        value={
          <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
            <TeamHostInfo {...info} />
          </Stack>
        }
      />
    </Box>
  );
}

type MyTeamSectionProps = {
  participantInfo: PortalParticipantInfo | undefined;
  isLoading: boolean;
};

export function MyTeamSection({ participantInfo, isLoading }: MyTeamSectionProps) {
  const { t } = useTranslation('portal');
  const teamSelfServiceInfo = participantInfo?.teamSelfServiceInfo ?? null;

  if (isLoading) {
    return <FetchProgressBar isPending={isLoading} error={undefined} />;
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <GroupIcon color="primary" />
          <Typography variant="h6">{t('participant_event_section_team')}</Typography>
        </Stack>

        {!teamSelfServiceInfo && (
          <Alert severity="info" icon={false}>
            {t('participant_event_team_pending')}
          </Alert>
        )}

        {teamSelfServiceInfo && (
          <>
            <TeamDetails info={teamSelfServiceInfo} />
            <Button variant="outlined" size="small" href={teamSelfServiceInfo.manageTeamHostingUrl} target="_blank" rel="noopener noreferrer">
              {t('participant_event_manage_team_hosting')}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

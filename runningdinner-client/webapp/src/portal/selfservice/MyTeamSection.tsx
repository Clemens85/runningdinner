import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import { isStringEmpty, isStringNotEmpty, MealSpecifics, PortalParticipantInfo, TeamSelfServiceInfo, Time } from '@runningdinner/shared';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { FetchProgressBar } from '../../common/FetchProgressBar.tsx';

type MealSpecificsChipsProps = {
  enabled: boolean;
};

function VeganChip({ enabled }: MealSpecificsChipsProps) {
  const { t } = useTranslation('portal');
  if (!enabled) {
    return null;
  }
  return <Chip label={t('vegan', { ns: 'common' })} size="small" color="success" variant="outlined" />;
}

function VegetarianChip({ enabled }: MealSpecificsChipsProps) {
  const { t } = useTranslation('portal');
  if (!enabled) {
    return null;
  }
  return <Chip label={t('vegetarian', { ns: 'common' })} size="small" color="success" variant="outlined" />;
}

function LactoseChip({ enabled }: MealSpecificsChipsProps) {
  const { t } = useTranslation('portal');
  if (!enabled) {
    return null;
  }
  return <Chip label={t('lactose', { ns: 'common' })} size="small" color="warning" variant="outlined" />;
}

function GlutenChip({ enabled }: MealSpecificsChipsProps) {
  const { t } = useTranslation('portal');
  if (!enabled) {
    return null;
  }
  return <Chip label={t('gluten', { ns: 'common' })} size="small" color="warning" variant="outlined" />;
}

function MealSpecificsInfo({ vegan, vegetarian, lactose, gluten, mealSpecificsNote }: MealSpecifics) {
  const hasNote = isStringNotEmpty(mealSpecificsNote);
  const hasAny = vegan || vegetarian || lactose || gluten || hasNote;

  if (!hasAny) {
    return null;
  }
  return (
    <Stack direction="column" spacing={0.5}>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
        <VeganChip enabled={vegan} />
        <VegetarianChip enabled={!vegan && vegetarian} />
        <LactoseChip enabled={lactose} />
        <GlutenChip enabled={gluten} />
      </Stack>
      {hasNote && (
        <Typography variant="caption" color="text.secondary">
          {mealSpecificsNote}
        </Typography>
      )}
    </Stack>
  );
}

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

/** Compact dietary restriction chips + optional free-text note for the team partner. */
function TeamPartnerMealSpecifics({ mealSpecifics }: { mealSpecifics: MealSpecifics }) {
  return (
    <Box sx={{ mt: 0.5 }}>
      <MealSpecificsInfo {...mealSpecifics} />
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

function TeamPartnerName({ teamPartnerName, fixedTeamPartner }: TeamSelfServiceInfo) {
  const { t } = useTranslation('portal');
  return (
    <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
      <span>{teamPartnerName}</span>
      {fixedTeamPartner && <Chip label={t('participant_event_team_partner_fixed_badge')} size="small" color="info" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />}
    </Stack>
  );
}

function TeamDetails({ info }: { info: TeamSelfServiceInfo }) {
  const { t } = useTranslation('portal');

  return (
    <Box sx={{ mb: 2 }}>
      <MealDetails {...info} />
      {info.teamPartnerCancelled && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          {t('participant_event_team_partner_cancelled')}
        </Alert>
      )}
      {!info.teamPartnerCancelled && info.teamPartnerName && (
        <TeamInfoRow
          label={t('participant_event_team_partner')}
          value={
            <Stack direction="column" spacing={0.25}>
              <TeamPartnerName {...info} />
              <TeamPartnerEmailLink {...info} />
              <TeamPartnerMobileNumberLink {...info} />
              {info.teamPartnerMealSpecifics && <TeamPartnerMealSpecifics mealSpecifics={info.teamPartnerMealSpecifics} />}
            </Stack>
          }
        />
      )}
      <TeamInfoRow
        label={t('participant_event_team_host')}
        value={
          <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
            <TeamHostInfo {...info} />
          </Stack>
        }
      />
      {info.likelyGuestMealSpecifics && <LikelyGuestMealSpecifics mealSpecifics={info.likelyGuestMealSpecifics} />}
    </Box>
  );
}

function LikelyGuestMealSpecifics({ mealSpecifics }: { mealSpecifics: MealSpecifics }) {
  const { t } = useTranslation('portal');
  const { vegan, vegetarian, lactose, gluten, mealSpecificsNote } = mealSpecifics;
  const hasNote = isStringNotEmpty(mealSpecificsNote);
  const hasAny = vegan || vegetarian || lactose || gluten || hasNote;

  if (!hasAny) {
    return null;
  }
  return (
    <>
      <Divider sx={{ my: 1.5 }} />
      <Box sx={{ borderLeft: '3px solid', borderColor: 'info.light', pl: 1.5, py: 0.5 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: 'info.main', flexShrink: 0 }} />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t('participant_event_team_likely_guest_specifics_title')}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: hasNote ? 0.75 : 0.5 }}>
          <VeganChip enabled={vegan} />
          <VegetarianChip enabled={!vegan && vegetarian} />
          <LactoseChip enabled={lactose} />
          <GlutenChip enabled={gluten} />
        </Stack>
        {hasNote && (
          <Typography variant="body2" sx={{ mb: 0.75 }}>
            {mealSpecificsNote}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          {t('participant_event_team_likely_guest_specifics_hint')}
        </Typography>
      </Box>
    </>
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
            {/* Hide "Manage hosting" for fixed partners — they share a home, no host decision needed */}
            {!teamSelfServiceInfo.fixedTeamPartner && !teamSelfServiceInfo.teamPartnerCancelled && (
              <Button
                variant="outlined"
                size="small"
                href={teamSelfServiceInfo.manageTeamHostingUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {t('participant_event_manage_team_hosting')}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

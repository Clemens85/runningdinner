import { Alert, AlertTitle, Box, Grid, useMediaQuery, useTheme } from '@mui/material';
import { findSelfAdminTeamNameInfo, getCustomTeamName, SelfAdminTeamNameInfo, updateSelfAdminTeamName } from '@runningdinner/shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { TeamNameForm, useTeamNameForm } from '../common/team/TeamNameForm';
import { commonStyles } from '../common/theme/CommonStyles';
import { useCustomSnackbar } from '../common/theme/CustomSnackbarHook';
import { PrimaryButton } from '../common/theme/PrimaryButton';
import Paragraph from '../common/theme/typography/Paragraph';
import { PageTitle } from '../common/theme/typography/Tags';

export default function SelfAdminChangeTeamNamePage() {
  const { t } = useTranslation('selfadmin');
  const urlParams = useParams<Record<string, string>>();
  const selfAdminId = urlParams.selfAdminId || '';
  const participantId = urlParams.participantId || '';
  const teamId = urlParams.teamId || '';

  const teamNameInfoQuery = useQuery({
    queryKey: ['selfAdminTeamNameInfo', selfAdminId, participantId, teamId],
    queryFn: () => findSelfAdminTeamNameInfo({ selfAdminId, participantId, teamId }),
  });

  if (teamNameInfoQuery.isError) {
    return (
      <Alert severity="error" variant="outlined" sx={{ mt: 3 }}>
        <AlertTitle>{t('selfadmin:change_team_name_loading_error_title')}</AlertTitle>
        {t('selfadmin:change_team_name_loading_error_text')}
      </Alert>
    );
  }
  if (!teamNameInfoQuery.data) {
    return null;
  }

  return (
    <>
      <PageTitle>{t('selfadmin:change_team_name_title')}</PageTitle>
      {teamNameInfoQuery.data.teamNameChangeAllowed ? (
        <ChangeTeamNameView teamNameInfo={teamNameInfoQuery.data} />
      ) : (
        <TeamNameChangeNotAllowedView teamNameInfo={teamNameInfoQuery.data} />
      )}
    </>
  );
}

function CurrentTeamName({ teamNameInfo }: { teamNameInfo: SelfAdminTeamNameInfo }) {
  const { t } = useTranslation('selfadmin');
  const currentTeamName = getCustomTeamName(teamNameInfo);
  if (!currentTeamName) {
    return null;
  }
  return (
    <Paragraph>
      {t('selfadmin:change_team_name_current')}: <strong>{currentTeamName}</strong>
    </Paragraph>
  );
}

function TeamNameChangeNotAllowedView({ teamNameInfo }: { teamNameInfo: SelfAdminTeamNameInfo }) {
  const { t } = useTranslation('selfadmin');
  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
        {t('selfadmin:change_team_name_not_allowed')}
      </Alert>
      <CurrentTeamName teamNameInfo={teamNameInfo} />
    </Box>
  );
}

function ChangeTeamNameView({ teamNameInfo }: { teamNameInfo: SelfAdminTeamNameInfo }) {
  const { t } = useTranslation(['selfadmin', 'common', 'admin']);
  const urlParams = useParams<Record<string, string>>();
  const selfAdminId = urlParams.selfAdminId || '';
  const participantId = urlParams.participantId || '';
  const teamId = urlParams.teamId || '';

  const queryClient = useQueryClient();
  const { showSuccess } = useCustomSnackbar();

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('lg'));
  const fullWidthProps = isSmallDevice ? commonStyles.fullWidth : {};

  const { formMethods, submit } = useTeamNameForm({
    initialTeamName: teamNameInfo.teamName,
    saveTeamName: async (teamName) => {
      const updatedInfo = await updateSelfAdminTeamName({ selfAdminId, participantId, teamId }, teamName);
      queryClient.setQueryData(['selfAdminTeamNameInfo', selfAdminId, participantId, teamId], updatedInfo);
      formMethods.setValue('teamName', updatedInfo.teamName || '');
      showSuccess(t('selfadmin:change_team_name_success_text'), { autoHideDuration: 30000 });
    },
  });

  return (
    <>
      <Paragraph>{t('selfadmin:change_team_name_help')}</Paragraph>
      <Box sx={{ mt: 3 }}>
        <TeamNameForm formMethods={formMethods} onSubmit={submit} />
      </Box>
      <Box sx={{ my: 3 }}>
        <Grid container direction={'row'} sx={{ justifyContent: 'flex-end' }}>
          <Grid size={isSmallDevice ? 12 : undefined}>
            <PrimaryButton onClick={submit} sx={fullWidthProps} disabled={formMethods.formState.isSubmitting} size={'large'}>
              {t('common:save')}
            </PrimaryButton>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}

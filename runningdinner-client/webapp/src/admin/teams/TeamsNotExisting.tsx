import {useTranslation, Trans} from "react-i18next";
import {Paper, Box, Grid} from "@mui/material";
import HtmlTranslate from "../../common/i18n/HtmlTranslate";
import Alert from '@mui/material/Alert';
import { AlertTitle } from '@mui/material';
import Paragraph from "../../common/theme/typography/Paragraph";
import {PrimarySuccessButtonAsync} from "../../common/theme/PrimarySuccessButtonAsync";
import {formatLocalDate, isArrayEmpty, isClosedDinner, useTeamsNotExisting, 
        useUpdateFindTeamsQueryData, useBackendIssueHandler, createTeamArrangementsAsync, 
        BaseRunningDinnerProps, TeamsNotExistingInfo, BaseAdminIdProps, assertDefined, HttpError} from "@runningdinner/shared";
import LinkIntern from "../../common/theme/LinkIntern";
import {useAdminNavigation} from "../AdminNavigationHook";
import {MissingParticipantActivationItem} from "../common/MissingParticipantActivationDialog";
import { useNotificationHttpError } from "../../common/NotificationHttpErrorHook";
import { ProgressBar } from "../../common/ProgressBar";

const TeamsNotExisting = ({runningDinner}: BaseRunningDinnerProps) => {

  const {t} = useTranslation('admin');
  const {adminId} = runningDinner;
  const {teamsNotExistingInfo, loading, error} = useTeamsNotExisting(runningDinner);
  const {updateTeams} = useUpdateFindTeamsQueryData(adminId);

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['admin', 'common']
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  if (loading || error || teamsNotExistingInfo === null) {
    // @ts-ignore
    return <ProgressBar showLoadingProgress={loading} fetchError={error} />;
  }

  const handleGenerateTeams = async () => {
    try {
      const teamGenerationResult = await createTeamArrangementsAsync(adminId);
      updateTeams(teamGenerationResult.teams);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  };

  assertDefined(teamsNotExistingInfo);
  const closedDinner = isClosedDinner(runningDinner);
  const { numParticipants, numExpectedTeams, numNotAssignableParticipants } = teamsNotExistingInfo;
  const canGenerateTeams = numExpectedTeams > 0;

  return (
    <Paper>
      <Box p={3}>
        { closedDinner ? <Paragraph i18n="admin:participants_count_closed_event" parameters={{numParticipants}} html={true} /> : <Paragraph i18n="admin:participants_count_public_event" parameters={{numParticipants}} html={true}/> }
        { canGenerateTeams ? <Paragraph i18n="admin:participants_count_sufficient" parameters={{numExpectedTeams, numNotAssignableParticipants}} html={true}/> : <Paragraph i18n="admin:participants_count_too_few" /> }
        <RegistrationStillRunningAlert teamsNotExistingInfo={teamsNotExistingInfo} />
        <NotActivatedParticipantsAlert teamsNotExistingInfo={teamsNotExistingInfo} adminId={runningDinner.adminId} />
      </Box>
      <Box p={3}>
        <PrimarySuccessButtonAsync disabled={!canGenerateTeams} onClick={handleGenerateTeams} 
                                   data-testid={"generate-teams-action"}>
                                    {t('teams_generate')}
        </PrimarySuccessButtonAsync>
      </Box>
    </Paper>
  );

};

type TeamsNotExistingAlertProps = {
  teamsNotExistingInfo: TeamsNotExistingInfo;
}

function NotActivatedParticipantsAlert({teamsNotExistingInfo, adminId}: TeamsNotExistingAlertProps & BaseAdminIdProps) {

  const {t} = useTranslation('admin');
  const { generateDashboardPath } = useAdminNavigation();

  if (isArrayEmpty(teamsNotExistingInfo.notActivatedParticipants)) {
    return null;
  }

  return (
    <Box mt={3}>
      <Alert severity={"warning"}>
        <AlertTitle>{t('attention')}</AlertTitle>
        {t("admin:registrations_not_yet_confirmed_teams_not_existing_info_1")}<br/>
        <Trans i18nKey={"admin:registrations_not_yet_confirmed_teams_not_existing_info_2"}
                   // @ts-ignore
                   components={{ anchor: <LinkIntern pathname={generateDashboardPath(adminId)} /> }} />
      </Alert>

      <Grid container>
        <Grid item xs={12} md={8} lg={6}>
        { teamsNotExistingInfo.notActivatedParticipants?.map(nap => 
          <Box key={nap.id} sx={{ mt: 3 }}>
            <MissingParticipantActivationItem {... nap} />
          </Box>
        )}
        </Grid>
      </Grid>

    </Box>
);
}

function RegistrationStillRunningAlert({teamsNotExistingInfo}: TeamsNotExistingAlertProps)  {

  const {t} = useTranslation('admin');

  if (!teamsNotExistingInfo.infoTeamCreationNotPossibleAndRegistrationStillRunning && !teamsNotExistingInfo.warnTeamsCanBeCreatedButRegistrationStillRunning) {
    return null;
  }

  const endOfRegistrationDate = formatLocalDate(teamsNotExistingInfo.endOfRegistrationDate);
  const severity = teamsNotExistingInfo.infoTeamCreationNotPossibleAndRegistrationStillRunning ? 'info': 'warning';
  const message = `teams_generate_deadline_open_${severity}`;

  return (
      <Box mt={3}>
        <Alert severity={severity}>
          <AlertTitle>{t('attention')}</AlertTitle>
          <HtmlTranslate i18n={message} parameters={{endOfRegistrationDate }} ns="admin" />
        </Alert>
      </Box>
  );
}

export default TeamsNotExisting;

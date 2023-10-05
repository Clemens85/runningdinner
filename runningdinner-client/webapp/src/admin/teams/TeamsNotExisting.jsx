import React from "react";
import {useTranslation} from "react-i18next";
import {Paper, Box, LinearProgress} from "@mui/material";
import HtmlTranslate from "../../common/i18n/HtmlTranslate";
import Alert from '@mui/material/Alert';
import { AlertTitle } from '@mui/material';
import Paragraph from "../../common/theme/typography/Paragraph";
import {PrimarySuccessButtonAsync} from "../../common/theme/PrimarySuccessButtonAsync";
import {formatLocalDate, isClosedDinner, useTeamsNotExisting} from "@runningdinner/shared";

const TeamsNotExisting = ({runningDinner, onGenerateTeams}) => {

  const {t} = useTranslation('admin');

  const [teamsNotExistingInfo, loading, error] = useTeamsNotExisting(runningDinner);
  if (error) { return ( <div>{error}</div> ); }
  if (loading) { return ( <LinearProgress color="secondary" /> ); }

  const closedDinner = isClosedDinner(runningDinner);
  const { numParticipants, numExpectedTeams, numNotAssignableParticipants } = teamsNotExistingInfo;
  const canGenerateTeams = numExpectedTeams > 0;

  return (
    <Paper>
      <Box p={3}>
        { closedDinner ? <Paragraph i18n="admin:participants_count_closed_event" parameters={{numParticipants}} html={true} /> : <Paragraph i18n="admin:participants_count_public_event" parameters={{numParticipants}} html={true}/> }
        { canGenerateTeams ? <Paragraph i18n="admin:participants_count_sufficient" parameters={{numExpectedTeams, numNotAssignableParticipants}} html={true}/> : <Paragraph i18n="admin:participants_count_too_few" /> }
        <RegistrationStillRunningAlert teamsNotExistingInfo={teamsNotExistingInfo} />
      </Box>
      <Box p={3}>
        <PrimarySuccessButtonAsync disabled={!canGenerateTeams} onClick={onGenerateTeams} data-testid={"generate-teams-action"}>{t('teams_generate')}</PrimarySuccessButtonAsync>
      </Box>
    </Paper>
  );

};

function RegistrationStillRunningAlert({teamsNotExistingInfo})  {

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

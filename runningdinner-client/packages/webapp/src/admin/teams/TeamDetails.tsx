import React from "react";
import {Box, Button, Grid, Hidden, Paper} from "@material-ui/core";
import Paragraph from "../../common/theme/typography/Paragraph";
import {useTranslation} from "react-i18next";
import FormFieldset from "../../common/theme/FormFieldset";
import TeamSchedule from "./TeamSchedule";
import {Subtitle} from "../../common/theme/typography/Tags";
import LinkAction from "../../common/theme/LinkAction";
import {CANCEL_WHOLE_TEAM_RESULT, TeamMemberCancelDialog} from "./cancellation/TeamMemberCancelDialog";
import VerticalMenuThreeDots from "../../common/menu/VerticalMenuThreeDots";
import {CancelledTeamMember} from "./CancelledTeamMember";
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import {Span} from "../../common/theme/typography/Tags";
import {TeamCancelDialog} from "./cancellation/TeamCancelDialog";
import {
  TeamNr,
  Time,
  CONSTANTS,
  ValueTranslate,
  findEntityById,
  Fullname,
  generateCancelledTeamMembersAsNumberArray,
  getFullname,
  hasEnoughSeats,
  useDisclosure, Team, Meal, Participant, NoopFunction, CallbackHandler
} from "@runningdinner/shared";
import {useAdminContext} from "../AdminContext";

export interface TeamDetailsProps {
  team: Team;
  teamMemberIdToCancel: string | null;
  onOpenChangeTeamHostDialog: (team: Team) => unknown;
  onUpdateTeamState: (team: Team) => unknown;
}

export default function TeamDetails({team, teamMemberIdToCancel, onOpenChangeTeamHostDialog, onUpdateTeamState}: TeamDetailsProps) {

  const {t} = useTranslation('common');
  const {runningDinner} = useAdminContext();

  const {adminId, sessionData} = runningDinner;
  const {teamMembers, meal, hostTeamMember} = team;

  const isCancelled = team.status === CONSTANTS.TEAM_STATUS.CANCELLED;
  const isReplaced = team.status === CONSTANTS.TEAM_STATUS.REPLACED;

  const passedTeamMemberToCancel = findEntityById(teamMembers, teamMemberIdToCancel);

  const {isOpen: isTeamMemberCancelDialogOpen,
         close: closeTeamMemberCancelDialog,
         open: openTeamMemberCancelDialog,
         getIsOpenData: getTeamMemberToCancel} = useDisclosure(!!passedTeamMemberToCancel, passedTeamMemberToCancel);

  const {isOpen: isTeamCancelDialogOpen,
         close: closeTeamCancelDialog,
         open: openTeamCancelDialog} = useDisclosure(false);

  let teamMembersDisplay = teamMembers.map(participant => <TeamMember key={participant.id} participant={participant}
                                                                        onOpenTeamMemberCancelDialog={() => openTeamMemberCancelDialog(participant) }/>);
  const cancelledTeamMembers = generateCancelledTeamMembersAsNumberArray(team, runningDinner.options.teamSize);
  teamMembersDisplay = teamMembersDisplay.concat(
      cancelledTeamMembers.map(cancelledTeamMember => <TeamMember key={cancelledTeamMember} onOpenTeamMemberCancelDialog={NoopFunction} />)
  );

  const hostTeamMemberName = getFullname(hostTeamMember);

  const handleCloseTeamMemberCancelDialog = (closeResult?: any) => { // TODO
    closeTeamMemberCancelDialog();
    if (closeResult === CANCEL_WHOLE_TEAM_RESULT) {
      handleOpenTeamCancelDialog();
    } else if (closeResult && closeResult.teamNumber) {
      onUpdateTeamState(closeResult); // closeResult === the updated team
    }
  };

  const handleOpenSingleTeamMessage = () => {
    alert('handleOpenSingleTeamMessage');
  };

  const handleOpenTeamCancelDialog = () => {
    openTeamCancelDialog();
  };

  const handleCloseTeamCancelDialog = (closeResult?: Team) => {
    closeTeamCancelDialog();
    if (closeResult && closeResult.teamNumber) {
      onUpdateTeamState(closeResult); // closeResult === the updated team
    }
  };

  const handleNotifyAffectedTeamsCancellation = () => {

  };

  let actionMenuItems = [
    { label: t("admin:team_message"), onClick: handleOpenSingleTeamMessage },
    { label: t("admin:team_cancel"), onClick: handleOpenTeamCancelDialog }
  ];
  if (isCancelled) {
    actionMenuItems = [{ label: t("admin:team_notify_cancellation"), onClick: handleNotifyAffectedTeamsCancellation }];
  }

  return (
      <Paper elevation={3}>
        <Box p={2}>

          <Grid container>
            <Grid item xs={11}>
              <Subtitle><TeamNr {...team} /></Subtitle>
              <MealAtTime {...meal} />
            </Grid>
            <Grid item xs={1}>
              <VerticalMenuThreeDots entries={actionMenuItems}/>
            </Grid>
            { isReplaced &&
              <Grid item xs={12}>
                <Box mt={1}>
                  <cite><Span i18n="admin:team_replaced_text" /></cite>
                </Box>
              </Grid> }
          </Grid>

          {isCancelled
              ? <Box mt={2}><CancelledTeamMember /></Box>
              : <Box mt={2}>
                  <Grid container>
                    <Grid item xs={12}>
                      <FormFieldset>{t('team_members')}</FormFieldset>
                    </Grid>
                  </Grid>
                  {teamMembersDisplay}
                  <Grid container>
                    <Grid item>
                      <Box mt={1}>
                      <Paragraph i18n="admin:teams_host" parameters={{host: hostTeamMemberName}} html={true}/> &nbsp; (<LinkAction
                        onClick={() => onOpenChangeTeamHostDialog(team)}>{t('change')}</LinkAction>)
                      </Box>
                    </Grid>
                  </Grid>
                  <NoValidTeamHost team={team} numSeatsNeededForHost={sessionData.numSeatsNeededForHost}/>
                </Box> }

          <Box mt={2}>
            <Grid container>
              <Grid item xs={12}>
                <FormFieldset>{t('admin:team_schedule')}</FormFieldset>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12}>
                <TeamSchedule team={team} adminId={adminId}/>
              </Grid>
            </Grid>
          </Box>

        </Box>

        { isTeamMemberCancelDialogOpen && <TeamMemberCancelDialog isOpen={isTeamMemberCancelDialogOpen}
                                                                  onClose={handleCloseTeamMemberCancelDialog}
                                                                  team={team}
                                                                  adminId={adminId}
                                                                  teamMemberToCancel={getTeamMemberToCancel()} /> }

        { isTeamCancelDialogOpen && <TeamCancelDialog isOpen={isTeamCancelDialogOpen}
                                                      onClose={handleCloseTeamCancelDialog}
                                                      teamToCancel={team}
                                                      runningDinner={runningDinner} /> }

      </Paper>
  );
}

function MealAtTime({label, time}: Meal) {
  const {t} = useTranslation('common');
  return (
      <Paragraph>{label} {t('at_time')} <Time date={time}/></Paragraph>
  );
}

interface TeamMemberProps {
  participant?: Participant;
  onOpenTeamMemberCancelDialog: CallbackHandler;
}

function TeamMember({participant, onOpenTeamMemberCancelDialog}: TeamMemberProps) {

  const {t} = useTranslation(['common', 'admin']);

  if (!participant) {
    return (
      <Grid container>
        <Grid item xs={12}><CancelledTeamMember /></Grid>
      </Grid>
    );
  }

  const { numSeats, gender } = participant;
  const numSeatsDisplay = numSeats > -1 ? t('participant_seats', { numSeats }) : t('no_information');

  return (
      <Grid container alignItems="center">
        <Grid item xs={6} sm={4}><Fullname {...participant}/></Grid>
        <Grid item xs={2} sm={2}>{numSeatsDisplay}</Grid>
        <Hidden xsDown>
          <Grid item xs={3} sm={2}>
            <ValueTranslate value={gender} ns="common" prefix="gender" valueMapping={{'undefined': 'unknown'}}/>
          </Grid>
        </Hidden>
        <Grid item xs={4} sm={4}>
          <Box justifyContent="flex-end">
            <Button color="secondary" onClick={onOpenTeamMemberCancelDialog}>{t('admin:participant_cancel')}</Button>
          </Box>
        </Grid>
      </Grid>
  );
}

interface NoValidTeamHostProps {
  team: Team;
  numSeatsNeededForHost: number;
}

function NoValidTeamHost({team, numSeatsNeededForHost}: NoValidTeamHostProps) {

  if (hasEnoughSeats(team, numSeatsNeededForHost)) {
    return null;
  }

  return (
      <Grid container>
        <Grid item xs={12}>
          <ErrorOutlineOutlinedIcon /> <Span i18n={'admin:teams_no_valid_host'} />
        </Grid>
      </Grid>
  );

}

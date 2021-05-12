import React from "react";
import {Box, Button, Grid, Hidden, Paper} from "@material-ui/core";
import Paragraph from "../../common/theme/typography/Paragraph";
import {useTranslation} from "react-i18next";
import FormFieldset from "../../common/theme/FormFieldset";
import TeamSchedule from "./TeamSchedule";
import {Subtitle} from "../../common/theme/typography/Tags";
import LinkAction from "../../common/theme/LinkAction";
import {TeamMemberCancelDialog, TeamMemberCancelDialogResult} from "./cancellation/TeamMemberCancelDialog";
import ContextMenuIcon from "../../common/menu/ContextMenuIcon";
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
  useDisclosure, Team, Meal, Participant, NoopFunction, CallbackHandler, RunningDinnerSessionData, isSameEntity
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
  const {teamMembers, meal} = team;

  const isCancelled = team.status === CONSTANTS.TEAM_STATUS.CANCELLED;
  const isReplaced = team.status === CONSTANTS.TEAM_STATUS.REPLACED;

  const passedTeamMemberToCancel = findEntityById(teamMembers, teamMemberIdToCancel);

  const {isOpen: isTeamCancelDialogOpen,
         close: closeTeamCancelDialog,
         open: openTeamCancelDialog} = useDisclosure(false);

  let teamMemberNodes = teamMembers.map(participant => <TeamMember key={participant.id}
                                                                    adminId={adminId}
                                                                    teamMember={participant}
                                                                    team={team}
                                                                    passedTeamMemberToCancel={passedTeamMemberToCancel}
                                                                    onOpenTeamCancelDialog={openTeamCancelDialog}
                                                                    onUpdateTeamState={onUpdateTeamState} />);
  const cancelledTeamMembers = generateCancelledTeamMembersAsNumberArray(team, runningDinner.options.teamSize);
  const cancelledTeamMemberNodes = cancelledTeamMembers.map(cancelledTeamMember => <TeamMember key={cancelledTeamMember}
                                                                                               adminId={adminId}
                                                                                               team={team}
                                                                                               onOpenTeamCancelDialog={NoopFunction}
                                                                                               onUpdateTeamState={NoopFunction}/>);
  teamMemberNodes = teamMemberNodes.concat(cancelledTeamMemberNodes);

  const handleOpenSingleTeamMessage = () => {
    alert('handleOpenSingleTeamMessage');
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
    { label: t("admin:team_cancel"), onClick: openTeamCancelDialog }
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
              <ContextMenuIcon entries={actionMenuItems}/>
            </Grid>
            { isReplaced &&
              <Grid item xs={12}>
                <Box mt={1}>
                  <cite><Span i18n="admin:team_replaced_text" /></cite>
                </Box>
              </Grid> }
          </Grid>

          { isCancelled ? <Box mt={2}><CancelledTeamMember /></Box>
              : <Box mt={2}>
                  <Grid container>
                    <Grid item xs={12}>
                      <FormFieldset>{t('team_members')}</FormFieldset>
                    </Grid>
                  </Grid>
                  {teamMemberNodes}
                  <TeamHostInfo sessionData={sessionData} team={team} onOpenChangeTeamHostDialog={onOpenChangeTeamHostDialog}/>
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
  teamMember?: Participant;
  adminId: string;
  team: Team;
  passedTeamMemberToCancel?: Participant;
  onUpdateTeamState: (team: Team) => unknown;
  onOpenTeamCancelDialog: CallbackHandler;
}



function TeamMember({teamMember, adminId, team, passedTeamMemberToCancel, onUpdateTeamState, onOpenTeamCancelDialog}: TeamMemberProps) {

  const {t} = useTranslation(['common', 'admin']);

  const {isOpen: isTeamMemberCancelDialogOpen,
         close: closeTeamMemberCancelDialog,
         open: openTeamMemberCancelDialog} = useDisclosure(isSameEntity(passedTeamMemberToCancel, teamMember), passedTeamMemberToCancel);

  if (!teamMember) {
    return (
      <Grid container>
        <Grid item xs={12}><CancelledTeamMember /></Grid>
      </Grid>
    );
  }

  const handleCloseTeamMemberCancelDialog = (closeResult?: TeamMemberCancelDialogResult) => {
    closeTeamMemberCancelDialog();
    if (closeResult?.mustCancelWholeTeam) {
      onOpenTeamCancelDialog();
    } else if (closeResult?.teamAfterCancel) {
      onUpdateTeamState(closeResult.teamAfterCancel);
    }
  };

  const { numSeats, gender } = teamMember;
  const numSeatsDisplay = numSeats > -1 ? t('participant_seats', { numSeats }) : t('no_information');

  return (
      <Grid container alignItems="center">
        <Grid item xs={6} sm={4}><Fullname {...teamMember}/></Grid>
        <Grid item xs={2} sm={2}>{numSeatsDisplay}</Grid>
        <Hidden xsDown>
          <Grid item xs={3} sm={2}>
            <ValueTranslate value={gender} ns="common" prefix="gender" valueMapping={{'undefined': 'unknown'}}/>
          </Grid>
        </Hidden>
        <Grid item xs={4} sm={4}>
          <Box justifyContent="flex-end">
            <Button color="secondary" onClick={() => openTeamMemberCancelDialog()}>{t('admin:participant_cancel')}</Button>
          </Box>
        </Grid>
        { isTeamMemberCancelDialogOpen && <TeamMemberCancelDialog isOpen={isTeamMemberCancelDialogOpen}
                                                                  onClose={handleCloseTeamMemberCancelDialog}
                                                                  team={team}
                                                                  adminId={adminId}
                                                                  teamMemberToCancel={teamMember} /> }
      </Grid>
  );
}

interface TeamHostInfoProps {
  team: Team;
  onOpenChangeTeamHostDialog: (team: Team) => unknown;
  sessionData: RunningDinnerSessionData;
}

function TeamHostInfo({team, sessionData, onOpenChangeTeamHostDialog}: TeamHostInfoProps) {

  const {t} = useTranslation('common');

  const {hostTeamMember} = team;
  const hostTeamMemberName = getFullname(hostTeamMember);

  return (
    <Box mt={1}>
      <Grid container spacing={1} alignContent={"center"}>
        <Grid item alignItems={"center"}>
          <Paragraph i18n="admin:teams_host" parameters={{host: hostTeamMemberName}} html={true}/>
        </Grid>
        <Grid item alignItems={"center"}>
          <LinkAction onClick={() => onOpenChangeTeamHostDialog(team)}><Span>({t('change')})</Span></LinkAction>
        </Grid>
      </Grid>
      <NoValidTeamHost team={team} numSeatsNeededForHost={sessionData.numSeatsNeededForHost}/>
    </Box>
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
      <Grid container spacing={1} alignItems={"center"}>
        <Grid item>
          <ErrorOutlineOutlinedIcon color={"secondary"} />
        </Grid>
        <Grid item>
          <Span i18n={'admin:teams_no_valid_host'} color={"secondary"}/>
        </Grid>
      </Grid>
  );

}

import React from "react";
import {Box, Button, Grid, Hidden, Paper} from "@material-ui/core";
import Paragraph from "../../common/theme/typography/Paragraph";
import {useTranslation} from "react-i18next";
import FormFieldset from "../../common/theme/FormFieldset";
import ValueTranslate from "../../shared/i18n/ValueTranslate";
import ParticipantService from "../../shared/admin/ParticipantService";
import TeamSchedule from "./TeamSchedule";
import {Subtitle} from "../../common/theme/typography/Tags";
import TeamNr from "../../shared/TeamNr";
import LinkAction from "../../common/theme/LinkAction";
import {findEntityById} from "../../shared/Utils";
import {useDisclosure} from "../../shared/DisclosureHook";
import {CANCEL_WHOLE_TEAM_RESULT, TeamMemberCancelDialog} from "./cancellation/TeamMemberCancelDialog";
import VerticalMenuThreeDots from "../../common/menu/VerticalMenuThreeDots";
import TeamService from "../../shared/admin/TeamService";
import {CancelledTeamMember} from "./CancelledTeamMember";
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import {Span} from "../../common/theme/typography/Tags";
import {TeamCancelDialog} from "./cancellation/TeamCancelDialog";
import {CONSTANTS} from "../../shared/Constants";
import {Time} from "../../shared/date/Time";
import {Fullname} from "../../shared/Fullname";

export default function TeamDetails({team, runningDinner, teamMemberIdToCancel, onOpenChangeTeamHostDialog, onUpdateTeamState}) {

  const {t} = useTranslation('common');

  const {adminId, sessionData} = runningDinner;
  const {teamMembers, meal, hostTeamMember} = team;

  const isCancelled = team.status === CONSTANTS.TEAM_STATUS.CANCELLED;
  const isReplaced = team.status === CONSTANTS.TEAM_STATUS.REPLACED;

  const passedTeamMemberToCancel = findEntityById(teamMembers, teamMemberIdToCancel);

  const {isOpen: isTeamMemberCancelDialogOpen,
         close: closeTeamMemberCancelDialog,
         open: openTeamMemberCancelDialog,
         data: teamMemberToCancel} = useDisclosure(!!passedTeamMemberToCancel, passedTeamMemberToCancel);

  const {isOpen: isTeamCancelDialogOpen,
         close: closeTeamCancelDialog,
         open: openTeamCancelDialog} = useDisclosure(false);

  let teamMembersDisplay = teamMembers.map(participant => <TeamMember key={participant.id} participant={participant}
                                                                        onOpenTeamMemberCancelDialog={() => openTeamMemberCancelDialog(participant) }/>);
  const cancelledTeamMembers = TeamService.generateCancelledTeamMembersAsNumberArray(team, runningDinner.options.teamSize);
  teamMembersDisplay = teamMembersDisplay.concat(
      cancelledTeamMembers.map(cancelledTeamMember => <TeamMember key={cancelledTeamMember} participant={null} onOpenTeamMemberCancelDialog={() => {}} />)
  );

  const hostTeamMemberName = ParticipantService.getFullname(hostTeamMember);

  const handleCloseTeamMemberCancelDialog = (closeResult) => {
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

  const handleCloseTeamCancelDialog = (closeResult) => {
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
              <MealAtTime meal={meal} />
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

        { teamMemberToCancel && <TeamMemberCancelDialog isOpen={isTeamMemberCancelDialogOpen}
                                                        onClose={handleCloseTeamMemberCancelDialog}
                                                        team={team}
                                                        adminId={adminId}
                                                        teamMemberToCancel={teamMemberToCancel} /> }

        { isTeamCancelDialogOpen && <TeamCancelDialog isOpen={isTeamCancelDialogOpen}
                                                      onClose={handleCloseTeamCancelDialog}
                                                      teamToCancel={team}
                                                      runningDinner={runningDinner} /> }

      </Paper>
  );
}

function MealAtTime({meal}) {
  const {t} = useTranslation('common');
  return (
      <Paragraph>{meal.label} {t('at_time')} <Time date={meal.time}/></Paragraph>
  );
}

function TeamMember({participant, onOpenTeamMemberCancelDialog}) {

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

function NoValidTeamHost({team, numSeatsNeededForHost}) {

  const hasEnoughSeats = TeamService.hasEnoughSeats(team, numSeatsNeededForHost);
  if (hasEnoughSeats) {
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

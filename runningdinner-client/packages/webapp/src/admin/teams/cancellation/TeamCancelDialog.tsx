import {useTranslation} from "react-i18next";
import {
  Dialog,
  DialogContent,
  Box, Grid,
} from "@material-ui/core";
import {DialogTitleCloseable} from "../../../common/theme/DialogTitleCloseable";
import React, {useState} from "react";
import DialogActionsPanel from "../../../common/theme/DialogActionsPanel";
import {SmallTitle, Span} from "../../../common/theme/typography/Tags";
import {Alert, AlertTitle} from "@material-ui/lab";
import { Fetch } from "../../../common/Fetch";
import {
  Fullname,
  CONSTANTS,
  useTeamName,
  useNumberOfAssignableParticipantsToReplaceTeam,
  findEntityById,
  removeEntityFromList,
  cancelTeamDryRunAsync,
  findNotAssignedParticipantsAsync,
  getFullnameList,
  useBackendIssueHandler, RunningDinner, Team, Participant, TeamCancellationResult, CallbackHandler, CallbackHandlerAsync, isArrayEmpty, cancelTeamAsync
} from "@runningdinner/shared";
import SelectableEntity from "../../common/SelectableEntity";
import cloneDeep from "lodash/cloneDeep";
import take from "lodash/take";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Paragraph from "../../../common/theme/typography/Paragraph";
import {useNotificationHttpError} from "../../../common/NotificationHttpErrorHook";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";

export interface TeamCancelDialogProps {
  runningDinner: RunningDinner,
  teamToCancel: Team,
  isOpen: boolean;
  onClose: (cancelledTeam?: Team) => void
}

interface TeamCancellationPreviewData extends TeamCancellationResult {
  replacementParticipants?: Participant[]
}

interface SelectableParticipant extends Participant {
  selected?: boolean;
}

export const TeamCancelDialog = ({runningDinner, teamToCancel, isOpen, onClose}: TeamCancelDialogProps) => {

  const {t} = useTranslation(['admin', 'common']);

  const [teamCancelPreviewData, setTeamCancelPreviewData] = useState<TeamCancellationPreviewData>();
  const [replacementParticipants, setReplacementParticipants] = useState<SelectableParticipant[]>([]);

  const {adminId} = runningDinner;
  const {showSuccess} = useCustomSnackbar();

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const {getTeamName} = useTeamName();

  if (!isOpen) {
    return null;
  }

  const handlePerformCancellation = async() => {
    try {
      const teamCancellationResult = await cancelTeamAsync(adminId, teamToCancel, replacementParticipants);
      const cancelledOrReplacedTeam = teamCancellationResult.team;
      const cancelledOrReplacedTeamName = getTeamName(cancelledOrReplacedTeam);
      if (cancelledOrReplacedTeam.status === CONSTANTS.TEAM_STATUS.REPLACED) {
        showSuccess(t("admin:team_cancel_replace_team_members_success", {cancelledOrReplacedTeam: cancelledOrReplacedTeamName}));
      } else {
        showSuccess(t("admin:team_cancel_success", {cancelledOrReplacedTeam: cancelledOrReplacedTeamName}));
      }
      onClose(cancelledOrReplacedTeam);
    } catch (e) {
      showHttpErrorDefaultNotification(e);
    }
  };

  const handleReplacementParticipantSelectionChange = (incomingParticipant: SelectableParticipant, selected: boolean) => {
    setReplacementParticipants(prevState => {
      let result = cloneDeep(prevState);
      const replacementParticipant = findEntityById(result, incomingParticipant.id);
      if (selected && !replacementParticipant) {
        result.push(incomingParticipant);
      }
      if (!selected && replacementParticipant) {
        result = removeEntityFromList(result, replacementParticipant)!;
      }
      incomingParticipant.selected = selected;
      return result;
    });
  };

  const handleShowPreview = async() => {
    try {
      const teamCancellationPreviewResponse = await cancelTeamDryRunAsync(adminId, teamToCancel, replacementParticipants);
      const teamCancellationPreviewData = {
        ...teamCancellationPreviewResponse,
        replacementParticipants
      }
      setTeamCancelPreviewData(teamCancellationPreviewData);
    } catch (e) {
      showHttpErrorDefaultNotification(e);
    }
  };

  return (
      <>
        { teamCancelPreviewData ?
              <TeamCancelPreview teamCancelPreview={teamCancelPreviewData}
                                 onPerformCancellation={handlePerformCancellation}
                                 onCancelDialog={onClose} /> :
              <TeamCancelOverview runningDinner={runningDinner}
                                  team={teamToCancel}
                                  onReplacementParticipantSelectionChange={handleReplacementParticipantSelectionChange}
                                  onCancelDialog={onClose}
                                  onShowPreview={handleShowPreview} />
        }
      </>
  );
};

interface TeamCancelOverviewProps {
  runningDinner: RunningDinner,
  team: Team,
  onCancelDialog: CallbackHandler,
  onShowPreview: CallbackHandlerAsync,
  onReplacementParticipantSelectionChange: (participant: Participant, selected: boolean) => void
}

function TeamCancelOverview({runningDinner, team, onCancelDialog, onShowPreview, onReplacementParticipantSelectionChange}: TeamCancelOverviewProps) {

  const {t} = useTranslation(['admin', 'common']);
  const {teamName} = useTeamName(team);
  const okLabel = t('common:next') + ' ...';
  const { adminId } = runningDinner;

  return (
      <Dialog open={true} onClose={onCancelDialog} aria-labelledby="form-dialog-title" maxWidth={"sm"} fullWidth={true}>
        <DialogTitleCloseable onClose={onCancelDialog}>{t('team_member_cancel', {teamMemberToCancel: teamName})}</DialogTitleCloseable>
        <DialogContent>
          <Box>
            <Span i18n="admin:team_cancel_info_text" />
          </Box>
          <Box mt={3}>
            <Fetch asyncFunction={findNotAssignedParticipantsAsync}
                   parameters={[adminId]}
                   render={resultObj => <TeamCancelOverviewContent
                                            team={team}
                                            runningDinner={runningDinner}
                                            onReplacementParticipantSelectionChange={onReplacementParticipantSelectionChange}
                                            notAssignedParticipants={resultObj.result} /> }/>
          </Box>
        </DialogContent>
        <DialogActionsPanel onOk={onShowPreview} onCancel={onCancelDialog} okLabel={okLabel} cancelLabel={t('common:cancel')} danger={false}/>
      </Dialog>
  );
}

interface TeamCancelOverviewContentProps {
  runningDinner: RunningDinner,
  team: Team,
  notAssignedParticipants: Participant[],
  onReplacementParticipantSelectionChange: (participant: Participant, selected: boolean) => void
}

function TeamCancelOverviewContent({team, runningDinner, notAssignedParticipants = [], onReplacementParticipantSelectionChange}: TeamCancelOverviewContentProps) {

  const {t} = useTranslation(['admin', 'common']);
  const { numberOfMissingParticipantsToReplaceTeam, hasEnoughNotAssignedParticipantsToReplaceTeam} = useNumberOfAssignableParticipantsToReplaceTeam(runningDinner, team, notAssignedParticipants);

  React.useEffect(() => {
    if (hasEnoughNotAssignedParticipantsToReplaceTeam) {
      const preselectedReplacementParticipants = take(notAssignedParticipants, team.teamMembers.length);
      preselectedReplacementParticipants.map(participant => onReplacementParticipantSelectionChange(participant, true));
    } // eslint-disable-next-line
  }, [notAssignedParticipants, hasEnoughNotAssignedParticipantsToReplaceTeam]);

  const renderTooFewParticipantsAlert = () => {
    return (
        <Alert severity="info" variant="outlined">
          <AlertTitle>{t('admin:team_cancel_info_headline_too_few_participants')}</AlertTitle>
          <Span i18n='admin:team_cancel_info_text_too_few_participants' parameters={{ numNeededParticipants: numberOfMissingParticipantsToReplaceTeam}} html={true} />
        </Alert>
    );
  };

  const renderEnoughParticipantsInfo = () => {
    const teamName = t('admin:team', {teamNumber: team.teamNumber});
    const { teamSize } = runningDinner.options;
    return (
        <Alert severity="success" variant="outlined">
          <AlertTitle>{t('admin:team_cancel_info_headline_sufficient_participants')}</AlertTitle>
          <Span i18n='admin:team_cancel_info_text_sufficient_participants' parameters={{ teamSize: teamSize, teamName: teamName }} html={true} />
        </Alert>
    );
  };

  const selectableParticipantsToReplace = notAssignedParticipants.map(notAssignedParticipant =>
      <Box key={notAssignedParticipant.id}>
        <SelectableEntity disabled={!hasEnoughNotAssignedParticipantsToReplaceTeam}
                          entity={notAssignedParticipant}
                          onSelectionChange={onReplacementParticipantSelectionChange} />
      </Box>
  );

  return (
    <>
      { hasEnoughNotAssignedParticipantsToReplaceTeam && renderEnoughParticipantsInfo() }
      { !hasEnoughNotAssignedParticipantsToReplaceTeam && renderTooFewParticipantsAlert() }
      <Box mt={1}>
        { selectableParticipantsToReplace }
      </Box>
    </>
  );
}


interface TeamCancelPreviewProps {
  teamCancelPreview: TeamCancellationPreviewData,
  onPerformCancellation: CallbackHandler,
  onCancelDialog: CallbackHandler
}

function TeamCancelPreview({teamCancelPreview, onPerformCancellation, onCancelDialog}: TeamCancelPreviewProps) {

  const {t} = useTranslation(['admin', 'common']);

  const {team} = teamCancelPreview;
  const {teamNumber} = team;
  const {teamName, getTeamName} = useTeamName(team);

  const isReplacement = team.status === CONSTANTS.TEAM_STATUS.REPLACED;

  const headline = isReplacement ? t('team_cancel_replace_headline', { teamNumber: teamNumber }) : t('team_cancel_complete_headline', { teamNumber: teamNumber });

  const renderParticipantList = (participants: Participant[]) => {
    const participantNodes = participants.map(participant => {
      return (
          <ListItem key={participant.id}>
            <ListItemText><Fullname {...participant} /></ListItemText>
          </ListItem>
      );
    });
    return (<List dense={true} disablePadding={true}>{ participantNodes }</List>);
  };

  const renderReplacementInfo = () => {
    return (
      <Box mb={1}>
        <Grid container>
          <Grid item xs={6}>
            <SmallTitle i18n="admin:team_cancel_remove_text" parameters={{ teamName: teamName}} />
          </Grid>
          <Grid item xs={6}>
            <SmallTitle i18n="admin:team_cancel_replaced_by_text" />
          </Grid>
          <Grid item xs={6}>
            { renderParticipantList(teamCancelPreview.removedParticipants) }
          </Grid>
          <Grid item xs={6}>
            { renderParticipantList(teamCancelPreview.replacementParticipants || []) }
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderAffectedTeamsList = (teams: Team[]) => {
    const teamNodes = teams.map(team => {
      const teamName = getTeamName(team);
      const teamMembers = getFullnameList(team.teamMembers);
      return (
          <ListItem key={team.id}>
            <ListItemText
                primary={teamName}
                secondary={teamMembers} />
          </ListItem>
      );
    });
    return (<List dense={true} disablePadding={true}>{ teamNodes }</List>);
  };

  const renderAffectedTeamsInfo = () => {

    const {dinnerRouteMessagesSent} = teamCancelPreview;
    const cancelledButNoDinnerRouteMessagesSent = !dinnerRouteMessagesSent && !isReplacement;
    const showNotificationHint = dinnerRouteMessagesSent || cancelledButNoDinnerRouteMessagesSent;

    return (
      <Grid container>
        <Grid item xs={6}>
          <SmallTitle i18n="admin:affected_hosting_teams" />
        </Grid>
        <Grid item xs={6}>
          <SmallTitle i18n="admin:affected_guest_teams" />
        </Grid>
        <Grid item xs={6}>
          { renderAffectedTeamsList(teamCancelPreview.affectedHostTeams) }
        </Grid>
        <Grid item xs={6}>
          { renderAffectedTeamsList(teamCancelPreview.affectedGuestTeams) }
        </Grid>
        {showNotificationHint &&
          <Box mt={2}>
            <SmallTitle i18n="admin:attention"/>
            { dinnerRouteMessagesSent && <em><Span i18n="admin:team_cancel_hint_dinnerroutes_sent"/></em> }
            { cancelledButNoDinnerRouteMessagesSent && <em><Span i18n="admin:team_cancel_hint_notify_teams" parameters={{ teamName: teamName }} /></em> }
          </Box>
        }
      </Grid>
    );
  };

  const handleOk = () => {
    if (isReplacement && isArrayEmpty(teamCancelPreview.replacementParticipants)) {
      throw new Error("Illegal state: replacementParticipants was empty");
    }
    onPerformCancellation();
  };

  const okLabel = isReplacement ? t('team_cancel_replace_team_members') : t('team_cancel_button');
  return (
      <Dialog open={true} onClose={onCancelDialog} aria-labelledby="form-dialog-title" maxWidth={"md"} fullWidth={true}>
        <DialogTitleCloseable onClose={onCancelDialog}>{headline}</DialogTitleCloseable>
        <DialogContent>
          <Box>
            { !isReplacement && <Paragraph i18n="admin:team_cancel_complete_message" parameters={{ teamNumber: teamNumber, meal: team.meal.label }} html={true}/> }
            { isReplacement && renderReplacementInfo() }
          </Box>
          <Box mt={2}>
            { renderAffectedTeamsInfo() }
          </Box>
        </DialogContent>
        <DialogActionsPanel onOk={handleOk} onCancel={onCancelDialog}
                            okLabel={okLabel} cancelLabel={t('common:cancel')}
                            danger={true}/>
      </Dialog>
  );
}
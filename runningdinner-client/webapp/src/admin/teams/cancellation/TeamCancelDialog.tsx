import {useTranslation} from "react-i18next";
import {
  Dialog,
  DialogContent,
  Box, Grid,
} from "@mui/material";
import {DialogTitleCloseable} from "../../../common/theme/DialogTitleCloseable";
import React, {useState} from "react";
import DialogActionsPanel from "../../../common/theme/DialogActionsPanel";
import {SmallTitle, Span} from "../../../common/theme/typography/Tags";
import { Alert, AlertTitle } from '@mui/material';
import {
  Fullname,
  CONSTANTS,
  useTeamName,
  useNumberOfAssignableParticipantsToReplaceTeam,
  findEntityById,
  removeEntityFromList,
  cancelTeamDryRunAsync,
  getFullnameList,
  useBackendIssueHandler,
  RunningDinner,
  Team,
  Participant,
  TeamCancellationResult,
  CallbackHandler,
  CallbackHandlerAsync,
  isArrayEmpty,
  cancelTeamAsync,
  useFindParticipants,
  isQuerySucceeded,
  assertDefined,
  HttpError
} from "@runningdinner/shared";
import SelectableEntity from "../../common/SelectableEntity";
import cloneDeep from "lodash/cloneDeep";
import take from "lodash/take";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Paragraph from "../../../common/theme/typography/Paragraph";
import {useNotificationHttpError} from "../../../common/NotificationHttpErrorHook";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";
import { FetchProgressBar } from "../../../common/FetchProgressBar";

export interface TeamCancelDialogProps {
  runningDinner: RunningDinner,
  teamToCancel: Team,
  isOpen: boolean;
  onClose: (cancelledTeam?: Team) => void
}

interface TeamCancellationPreviewData {
  teamCancellationPreviewResult?: TeamCancellationResult
  replacementParticipants: Participant[],
  showTeamCancelPreview?: boolean
}

interface SelectableParticipant extends Participant {
  selected?: boolean;
}

export const TeamCancelDialog = ({runningDinner, teamToCancel, isOpen, onClose}: TeamCancelDialogProps) => {

  const {t} = useTranslation(['admin', 'common']);

  const [teamCancelPreviewData, setTeamCancelPreviewData] = useState<TeamCancellationPreviewData>({replacementParticipants: []});

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
      const teamCancellationResult = await cancelTeamAsync(adminId, teamToCancel, teamCancelPreviewData.replacementParticipants);
      const cancelledOrReplacedTeam = teamCancellationResult.team;
      const cancelledOrReplacedTeamName = getTeamName(cancelledOrReplacedTeam);
      if (cancelledOrReplacedTeam.status === CONSTANTS.TEAM_STATUS.REPLACED) {
        showSuccess(t("admin:team_cancel_replace_team_members_success", {cancelledOrReplacedTeam: cancelledOrReplacedTeamName}));
      } else {
        showSuccess(t("admin:team_cancel_success", {cancelledOrReplacedTeam: cancelledOrReplacedTeamName}));
      }
      onClose(cancelledOrReplacedTeam);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError, { showGenericMesssageOnValidationError: false });
    }
  };

  const handleReplacementParticipantSelectionChange = (incomingParticipant: SelectableParticipant, selected: boolean) => {
    setTeamCancelPreviewData(prevState => {
      let result = cloneDeep(prevState);
      let replacementParticipants = result.replacementParticipants;
      const replacementParticipant = findEntityById(replacementParticipants, incomingParticipant.id);
      if (selected && !replacementParticipant) {
        replacementParticipants.push(incomingParticipant);
      }
      if (!selected && replacementParticipant) {
        replacementParticipants = removeEntityFromList(replacementParticipants, replacementParticipant)!;
      }
      incomingParticipant.selected = selected;
      result.replacementParticipants = replacementParticipants;
      return result;
    });
  };

  const handleShowPreview = async() => {
    try {
      const teamCancellationPreviewResult = await cancelTeamDryRunAsync(adminId, teamToCancel, teamCancelPreviewData.replacementParticipants);
      setTeamCancelPreviewData({
        replacementParticipants: teamCancelPreviewData.replacementParticipants,
        showTeamCancelPreview: true,
        teamCancellationPreviewResult: teamCancellationPreviewResult
      });
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError, { showGenericMesssageOnValidationError: false, showAllValidationErrorMessages: true });
    }
  };

  const { showTeamCancelPreview } = teamCancelPreviewData;

  return (
      <>
        { showTeamCancelPreview ?
              <TeamCancelPreview teamCancelPreviewData={teamCancelPreviewData}
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

  const findParticipantsQuery = useFindParticipants(adminId);
  if (!isQuerySucceeded(findParticipantsQuery)) {
    return <FetchProgressBar {...findParticipantsQuery} />;
  }
  assertDefined(findParticipantsQuery.data);

  return (
      <Dialog open={true} onClose={onCancelDialog} aria-labelledby="form-dialog-title" maxWidth={"sm"} fullWidth={true} data-testid={"team-cancel-dialog-overview"}>
        <DialogTitleCloseable onClose={onCancelDialog}>{t('team_member_cancel', {teamMemberToCancel: teamName})}</DialogTitleCloseable>
        <DialogContent>
          <Box>
            <Span i18n="admin:team_cancel_info_text" />
          </Box>
          <Box mt={3}>
            <TeamCancelOverviewContent team={team}
                                      runningDinner={runningDinner}
                                      onReplacementParticipantSelectionChange={onReplacementParticipantSelectionChange}
                                      notAssignedParticipants={findParticipantsQuery.data.participantsWaitingList} /> 
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
      preselectedReplacementParticipants.map((participant: Participant) => onReplacementParticipantSelectionChange(participant, true));
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

    let numNeededParticipants = teamSize;
    if (team.teamMembers.length < teamSize) {
      numNeededParticipants = teamSize - team.teamMembers.length;
    }

    return (
        <Alert severity="success" variant="outlined">
          <AlertTitle>{t('admin:team_cancel_info_headline_sufficient_participants')}</AlertTitle>
          <Span i18n='admin:team_cancel_info_text_sufficient_participants' parameters={{ teamSize: numNeededParticipants, teamName: teamName }} html={true} />
        </Alert>
    );
  };

  const selectableParticipantsToReplace = notAssignedParticipants.map((notAssignedParticipant, index) =>
      <Box key={notAssignedParticipant.id}>
        <SelectableEntity disabled={!hasEnoughNotAssignedParticipantsToReplaceTeam}
                          entity={notAssignedParticipant}
                          onSelectionChange={onReplacementParticipantSelectionChange}
                          data-testid={`replacement-participant-${index}`}
        />
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
  teamCancelPreviewData: TeamCancellationPreviewData,
  onPerformCancellation: CallbackHandler,
  onCancelDialog: CallbackHandler
}

function TeamCancelPreview({teamCancelPreviewData, onPerformCancellation, onCancelDialog}: TeamCancelPreviewProps) {

  const {t} = useTranslation(['admin', 'common']);

  const {teamCancellationPreviewResult, replacementParticipants} = teamCancelPreviewData;
  const {team, removedParticipants, dinnerRouteMessagesSent, affectedHostTeams, affectedGuestTeams} = teamCancellationPreviewResult!;
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
            { renderParticipantList(removedParticipants) }
          </Grid>
          <Grid item xs={6}>
            { renderParticipantList(replacementParticipants) }
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
          { renderAffectedTeamsList(affectedHostTeams) }
        </Grid>
        <Grid item xs={6}>
          { renderAffectedTeamsList(affectedGuestTeams) }
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
    if (isReplacement && isArrayEmpty(replacementParticipants)) {
      throw new Error("Illegal state: replacementParticipants was empty");
    }
    onPerformCancellation();
  };

  const okLabel = isReplacement ? t('team_cancel_replace_team_members') : t('team_cancel_button');
  return (
      <Dialog open={true} onClose={onCancelDialog} aria-labelledby="form-dialog-title" maxWidth={"md"} fullWidth={true} data-testid={"team-cancel-dialog-preview"}>
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

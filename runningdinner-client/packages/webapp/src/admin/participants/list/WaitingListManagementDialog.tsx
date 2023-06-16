import {
  AppBar,
  createStyles,
  Dialog,
  Grid,
  IconButton,
  makeStyles,
  Slide,
  Theme,
  Toolbar,
  Typography
} from '@material-ui/core';
import {
  addSelectedParticipantToTeam,
  assignParticipantsToExistingTeamsAsync,
  BaseRunningDinnerProps,
  calculateCancelledTeamMembersNumArr,
  CallbackHandler,
  findEntityById,
  findWaitingListInfoAsync,
  Fullname,
  generateNewTeamsFromWaitingListAsync,
  getNumCancelledTeamMembers,
  getTeamParticipantsAssignment,
  isArrayNotEmpty,
  MessageSubType,
  removeSelectedParticipantFromTeam,
  SelectableParticipant,
  setupAssignParticipantsToTeamsModel,
  Team,
  TeamNr,
  TeamParticipantsAssignment,
  TeamParticipantsAssignmentModel,
  useBackendIssueHandler,
  useTeamNameMembers,
  WaitingListAction,
  WaitingListActionAdditional,
  WaitingListActionResult,
  WaitingListActionUI,
  WaitingListInfo
} from '@runningdinner/shared';
import {Fetch} from '../../../common/Fetch';
import React, {useEffect, useState} from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Subtitle} from "../../../common/theme/typography/Tags";
import Paragraph from "../../../common/theme/typography/Paragraph";
import Box from "@material-ui/core/Box";
import SelectableEntity from "../../common/SelectableEntity";
import cloneDeep from 'lodash/cloneDeep';
import {SpacingPaper} from '../../../common/theme/SpacingPaper';
import {CancelledTeamMember} from "../../teams/CancelledTeamMember";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";
import {TransitionProps} from '@material-ui/core/transitions';
import CloseIcon from '@material-ui/icons/Close';
import useCommonStyles from "../../../common/theme/CommonStyles";
import {SpacingGrid} from "../../../common/theme/SpacingGrid";
import {useNotificationHttpError} from "../../../common/NotificationHttpErrorHook";
import {PrimarySuccessButtonAsync} from "../../../common/theme/PrimarySuccessButtonAsync";
import {Breakpoint} from "@material-ui/core/styles/createBreakpoints";
import {GridSize} from "@material-ui/core/Grid/Grid";
import {useAdminNavigation} from "../../AdminNavigationHook";
import {SpacingButton} from "../../../common/theme/SpacingButton";
import {Alert, AlertTitle} from "@material-ui/lab";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children?: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useDialogStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      position: 'relative',
      color: 'white',
    },
    title: {
      marginLeft: theme.spacing(2),
      flex: 1,
    },
  }),
);

type CloseCallback = {
  onClose: CallbackHandler;
};
type ReFetchCallback = {
  reFetch: () => Promise<WaitingListInfo>;
};
type SaveCallback = {
  onSave: (waitingListActionResult: WaitingListActionResult) => unknown;
};

type SingleTeamParticipantsAssignmentProps = {
  allSelectableParticipants: SelectableParticipant[];
  onRemoveFromTeam: (team: Team, participant: SelectableParticipant) => unknown;
  onAddToTeam: (team: Team, participant: SelectableParticipant) => unknown;
  teamSizeOfRunningDinner: number;
}

type TeamNotificationModel = {
  dinnerRouteMessagesAlreadySent: boolean;
  affectedTeams: Team[];
};

export function WaitingListManagementDialog(props: BaseRunningDinnerProps & CloseCallback) {
  
  const {t} = useTranslation(["admin", "common"]);

  const dialogClasses = useDialogStyles();

  const {runningDinner, onClose} = props;

  return (
    <Dialog onClose={onClose} open={true} fullScreen TransitionComponent={Transition}>
      <AppBar className={dialogClasses.appBar}>
        <Toolbar>
          <Typography variant="h6" className={dialogClasses.title}>
            {t('admin:waitinglist_management')}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close" data-testid={"close-waitinglist-view-action"}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Fetch asyncFunction={findWaitingListInfoAsync}
             parameters={[runningDinner.adminId]}
             render={response =>
                <Box mt={3}>
                  <WaitingListManagementDialogContentView {...response.result} reFetch={response.reFetch} runningDinner={runningDinner} onClose={onClose} />
                </Box>
             } />

    </Dialog>
  );
}

function WaitingListManagementDialogContentView(props: WaitingListInfo & ReFetchCallback & CloseCallback & BaseRunningDinnerProps) {

  const { possibleActions, teamsGenerated, runningDinner, reFetch, onClose } = props;

  const [currentWaitingListAction, setCurrentWaitingListAction] = React.useState<WaitingListActionUI>();
  const [teamNotificationModel, setTeamNotificationModel] = React.useState<TeamNotificationModel>();

  React.useEffect(() => {
    setCurrentWaitingListAction(isArrayNotEmpty(possibleActions) ? possibleActions[0] : undefined);
  }, [possibleActions]);

  async function handleSave(waitingListActionResult: WaitingListActionResult) {
    const {affectedTeams} = waitingListActionResult;
    const showNotificationView = (waitingListActionResult.dinnerRouteMessagesAlreadySent || waitingListActionResult.teamMessagesAlreadySent) && isArrayNotEmpty(affectedTeams);
    if (!showNotificationView) {
      reloadWaitingListContent();
      return;
    }
    // else: show notification view
    setTeamNotificationModel({
      affectedTeams,
      dinnerRouteMessagesAlreadySent: waitingListActionResult.dinnerRouteMessagesAlreadySent
    });
  }

  function reloadWaitingListContent() {
    setTeamNotificationModel(undefined);
    reFetch();
  }

  if (!teamsGenerated) {
    return <TeamsNotGeneratedView />;
  }

  if (teamNotificationModel) {
    return <NotifyTeamsAboutChangesView {... teamNotificationModel }
                                        onSave={reloadWaitingListContent}
                                        runningDinner={runningDinner} />
  }

  if (currentWaitingListAction === WaitingListActionAdditional.NO_ACTION) {
    onClose();
    return null;
  }

  return (
    <>
      { currentWaitingListAction === WaitingListAction.GENERATE_NEW_TEAMS && <RegenerateTeamsWithAssignableParticipantsView {... props} onSave={handleSave} /> }
      { currentWaitingListAction === WaitingListAction.ASSIGN_TO_EXISTING_TEAMS && <TeamParticipantsAssignmentView {...props} onSave={handleSave}/> }
      { currentWaitingListAction === WaitingListAction.DISTRIBUTE_TO_TEAMS && <NoSimpleActionView {...props} /> }
    </>
  );
}

const DIALOG_SPACING_X = 3;
const GRID_SIZES: Partial<Record<Breakpoint, GridSize>> = { xs: 12, md: 5, lg: 5, xl: 5 };

function TeamParticipantsAssignmentView(props: WaitingListInfo & SaveCallback & BaseRunningDinnerProps) {

  const {teamsWithCancelStatusOrCancelledMembers, totalNumberOfMissingTeamMembers, allParticipantsOnWaitingList, runningDinner, onSave} = props;

  const {t} = useTranslation(['admin', 'common']);
  const commonClasses = useCommonStyles();
  const {showWarning, showSuccess} = useCustomSnackbar();

  const {teamSize} = runningDinner.options;
  const [teamParticipantsAssignmentModel, setTeamParticipantsAssignmentModel] = useState<TeamParticipantsAssignmentModel>(setupAssignParticipantsToTeamsModel(teamsWithCancelStatusOrCancelledMembers, allParticipantsOnWaitingList));

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['admin', 'common']
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  useEffect(() => {
    const model = setupAssignParticipantsToTeamsModel(teamsWithCancelStatusOrCancelledMembers, allParticipantsOnWaitingList);
    setTeamParticipantsAssignmentModel(model);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAddToTeam(team: Team, participant: SelectableParticipant) {
    const teamParticipantsAssignment = getTeamParticipantsAssignment(teamParticipantsAssignmentModel, team);
    const numCancelledTeamMembers = getNumCancelledTeamMembers(team, teamParticipantsAssignment.selectedParticipants.length, teamSize);
    if (numCancelledTeamMembers <= 0) {
      showWarning(t("admin:waitinglist_assign_participants_teams_select_max_warning", { teamSize }));
      return;
    }
    setTeamParticipantsAssignmentModel(prevState => {
      const prevModelState = cloneDeep(prevState);
      return addSelectedParticipantToTeam(prevModelState, team, participant);
    });
  }

  function handleRemoveFromTeam(team: Team, participant: SelectableParticipant) {
    setTeamParticipantsAssignmentModel(prevState => {
      const prevModelState = cloneDeep(prevState);
      return removeSelectedParticipantFromTeam(prevModelState, team, participant);
    });
  }

  async function handleAssignToExistingTeams() {
    const {teamParticipantAssignments} = teamParticipantsAssignmentModel;
    try {
      const result = await assignParticipantsToExistingTeamsAsync(runningDinner.adminId, teamParticipantAssignments);
      showSuccess(t("admin:waitinglist_assign_participants_teams_success"));
      onSave(result);
    } catch (e) {
      showHttpErrorDefaultNotification(e, {
        showGenericMesssageOnValidationError: false,
        showMessageForValidationErrorsWithoutSource: true
      });
    }
  }

  const teamParticipantAssignments = teamParticipantsAssignmentModel.teamParticipantAssignments || [];
  const allSelectableParticipants = teamParticipantsAssignmentModel.allSelectableParticipants || [];
  const numParticipantsOnWaitingList = allParticipantsOnWaitingList.length; // Displays the original number of participants on waitinglist

  return (
    <div data-testid={"waitinglist-teams-participants-assignment-view"}>
      <SpacingGrid container mt={DIALOG_SPACING_X} justify={"center"} mx={DIALOG_SPACING_X}>
        <Grid item {... GRID_SIZES}>
          <Subtitle>{t('admin:waitinglist_assign_participants_teams')}</Subtitle>
          <Paragraph>
            <Trans i18nKey={"admin:waitinglist_num_participants_list_info"} values={{ numParticipants: numParticipantsOnWaitingList }} /><br />
            <Trans i18nKey={"admin:waitinglist_num_participants_assignment_info"} /><br />
            <Trans i18nKey={"admin:waitinglist_num_missing_teammembers"} values={{ totalNumberOfMissingTeamMembers }} />
          </Paragraph>
        </Grid>
      </SpacingGrid>
      <SpacingGrid container mt={DIALOG_SPACING_X} justify={"center"}>
        <>
        {
          teamParticipantAssignments.map(tpa => {
            return (
              <Grid item {... GRID_SIZES} key={tpa.team.id}>
                <Box mx={DIALOG_SPACING_X} mb={DIALOG_SPACING_X}>
                  <SingleTeamParticipantsAssignmentView {...tpa}
                                                        allSelectableParticipants={allSelectableParticipants}
                                                        teamSizeOfRunningDinner={teamSize}
                                                        onAddToTeam={handleAddToTeam}
                                                        onRemoveFromTeam={handleRemoveFromTeam} />
                </Box>
              </Grid>
            )
          })
        }
        </>
      </SpacingGrid>

      <SpacingGrid container justify={"center"}>
        <Grid item {... GRID_SIZES}>
          <Box mx={DIALOG_SPACING_X} mt={DIALOG_SPACING_X}>
            <PrimarySuccessButtonAsync onClick={handleAssignToExistingTeams} size={"large"} className={commonClasses.fullWidth} data-testid={"waitinglist-assign-participants-teams-action"}>
              {t('admin:waitinglist_assign_participants_teams')}!
            </PrimarySuccessButtonAsync>
          </Box>
        </Grid>
      </SpacingGrid>
    </div>
  );
}

function NotifyTeamsAboutChangesView({runningDinner, affectedTeams, dinnerRouteMessagesAlreadySent, onSave}: TeamNotificationModel & SaveCallback & BaseRunningDinnerProps) {

  const {t} = useTranslation(["admin", "common"]);
  const commonClasses = useCommonStyles();
  const {generateTeamMessagesPath} = useAdminNavigation();
  const {getTeamNameMembers} = useTeamNameMembers();

  const {adminId} = runningDinner;

  function handleSendNotifications(openMessagesView: boolean) {
    if (openMessagesView) {
      window.open(generateTeamMessagesPath(adminId, MessageSubType.TEAMS_MODIFIED_WAITINGLIST, affectedTeams), '_blank');
    }
    // Dummy object for indicating that notification view shall not be shown again:
    onSave({ affectedTeams: [], teamMessagesAlreadySent: false, dinnerRouteMessagesAlreadySent: false });
  }

  return (
    <>
      <SpacingGrid container mt={DIALOG_SPACING_X} justify={"center"} px={DIALOG_SPACING_X}>
        <Grid item {... GRID_SIZES}>
          <Subtitle>{t('admin:team_notify_cancellation')}</Subtitle>
          <Paragraph>{t("admin:waitinglist_notification_teams_info")}</Paragraph>
          <ul>
            { affectedTeams.map(team => <li key={team.id} data-testid={"waitinglist_notification_team"}>{getTeamNameMembers(team)}</li>) }
          </ul>
        </Grid>
      </SpacingGrid>

      { dinnerRouteMessagesAlreadySent &&
        <SpacingGrid container mt={DIALOG_SPACING_X} justify={"center"} px={DIALOG_SPACING_X}>
          <Grid item {... GRID_SIZES}>
            <Alert severity={"warning"} data-testid={"waitinglist_notification_dinnerroute_hint"}>
              <AlertTitle>{t('common:attention')}</AlertTitle>
              <Trans i18nKey='admin:waitinglist_notification_dinnerroutes_sent' />
            </Alert>
          </Grid>
        </SpacingGrid>
      }

      <SpacingGrid container justify={"center"} px={DIALOG_SPACING_X} mt={DIALOG_SPACING_X}>
        <Grid item {... GRID_SIZES}>
          <PrimarySuccessButtonAsync onClick={() => handleSendNotifications(true)}
                                     size={"large"} className={commonClasses.fullWidth}
                                     data-testid={"waitinglist_notification_teams_open_messages_action"}>
            {t('admin:waitinglist_notification_teams_sendmessages')}
          </PrimarySuccessButtonAsync>
          <SpacingButton onClick={() => handleSendNotifications(false)} mt={DIALOG_SPACING_X}
                         color={"primary"} variant={"outlined"} className={commonClasses.fullWidth}
                         data-testid={"waitinglist_notification_teams_continue_without_messages_action"}>
            {t('admin:waitinglist_notification_teams_continue_without_messages')}
          </SpacingButton>
        </Grid>
      </SpacingGrid>
    </>
  );
}

function SingleTeamParticipantsAssignmentView(props: SingleTeamParticipantsAssignmentProps & TeamParticipantsAssignment) {

  const {team, selectedParticipants, allSelectableParticipants, onAddToTeam, onRemoveFromTeam, teamSizeOfRunningDinner} = props;
  const {t} = useTranslation("admin");

  const selectableParticipantControls = allSelectableParticipants.map(participant =>
    <Box key={participant.id} >
      <SelectableEntity entity={participant}
                        data-testid={"waitinglist-participant-for-assignment"}
                        onSelectionChange={(participant: SelectableParticipant, selected: boolean) => selected && onAddToTeam(team, participant) } />
    </Box>
  );

  const selectedParticipantControls = selectedParticipants.map(participant =>
    <Box key={participant.id} >
      <SelectableEntity entity={participant}
                        onSelectionChange={(participant: SelectableParticipant, selected: boolean) => !selected && onRemoveFromTeam(team, participant) } />
    </Box>
  );

  function renderTeamMembers() {
    const cancelledTeamMembers = calculateCancelledTeamMembersNumArr(team, selectedParticipants.length, teamSizeOfRunningDinner);
    const teamMemberNodes = team.teamMembers.map(member => <Paragraph key={member.id}><Fullname {...member} /></Paragraph>);
    const cancelledTeamMemberNodes = cancelledTeamMembers.map((num) => <Paragraph key={num}><CancelledTeamMember /></Paragraph>);
    return (
      <>
        { teamMemberNodes }
        { selectedParticipantControls }
        { cancelledTeamMemberNodes }
      </>
    );
  }

  return (
    <div data-testid={"waitinglist-team-for-assignment"}>
      <SpacingPaper elevation={3} p={DIALOG_SPACING_X}>
        <Subtitle><TeamNr {...team} /></Subtitle>
        { renderTeamMembers() }
      </SpacingPaper>
      <Box my={2}>
        <small>{t("admin:waitinglist_assign_participants_teams_select_hint")}</small>
      </Box>
      { selectableParticipantControls }
    </div>
  );

}

function RegenerateTeamsWithAssignableParticipantsView(props: WaitingListInfo & BaseRunningDinnerProps & SaveCallback) {

  const {numMissingParticipantsForFullTeamArrangement, participtantsForTeamArrangement, remainingParticipants, runningDinner, onSave } = props;

  const commonClasses = useCommonStyles();
  const {showWarning, showSuccess} = useCustomSnackbar();
  const {t} = useTranslation(['admin', 'common']);

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const numRemainingParticipants = remainingParticipants.length;
  const numParticipantsAssignable = participtantsForTeamArrangement.length;

  const [participantList, setParticipantList] = useState<SelectableParticipant[]>([]);

  async function handleGenerateNewTeams() {
    const participantsForTeamsGeneration = participantList.filter(p => p.selected);
    try {
      const result = await generateNewTeamsFromWaitingListAsync(runningDinner.adminId, participantsForTeamsGeneration);
      showSuccess(t("admin:waitinglist_generate_teams_success"));
      onSave(result);
    } catch (e) {
      showHttpErrorDefaultNotification(e, {
        showGenericMesssageOnValidationError: false,
        showAllValidationErrorMessages: true
      });
    }
  }

  function handleParticipantSelectionChange(participant: SelectableParticipant, selected: boolean) {
    if (getNumSelectedParticipantsParticipantsInState() >= numParticipantsAssignable && selected) {
      showWarning(t("admin:waitinglist_generate_teams_selected_too_much", {numParticipants: numParticipantsAssignable}));
      return;
    }
    setParticipantList(prevState => {
      const prevModelState = cloneDeep(prevState);
      const participantToModify = findEntityById(prevModelState, participant.id);
      participantToModify.selected = selected;
      return prevModelState;
    });
  }

  function getNumSelectedParticipantsParticipantsInState() {
    const tmp = participantList.filter(p => p.selected);
    return tmp.length;
  }

  React.useEffect(() => {
    let initialParticipantList = new Array<SelectableParticipant>();
    for (let i = 0; i < participtantsForTeamArrangement.length; i++) {
      const p = cloneDeep(participtantsForTeamArrangement[i]);
      p.selected = true;
      initialParticipantList.push(p);
    }
    initialParticipantList = initialParticipantList.concat(cloneDeep(remainingParticipants));
    setParticipantList(initialParticipantList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const participantsAssignableControls = participantList.map(participant =>
    <Box key={participant.id} >
      <SelectableEntity entity={participant}
                        onSelectionChange={handleParticipantSelectionChange}
                        data-testid={"waitinglist-participant-for-teams-generation"} />
    </Box>
  );

  return (
    <div data-testid={"waitinglist-teams-generation-view"}>
      <SpacingGrid container mt={DIALOG_SPACING_X} justify={"center"} px={DIALOG_SPACING_X}>
        <SpacingGrid item {... GRID_SIZES} px={DIALOG_SPACING_X}>
          <Subtitle><Trans i18nKey={"admin:waitinglist_generate_teams_num_participants"} values={{ numParticipants: numParticipantsAssignable }}/></Subtitle>
          { numRemainingParticipants > 0 &&
            <Paragraph data-testid={"waitinglist-teams-generation-view-remaining-participants-hint"}>
              <Trans i18nKey={"admin:waitinglist_generate_teams_num_participants_remaining"} values={{ numRemainingParticipants }} />
              <Trans i18nKey={"admin:waitinglist_generate_teams_num_participants_missing"} values={{ numMissingParticipantsForFullTeamArrangement }} />
            </Paragraph>
          }
        </SpacingGrid>
      </SpacingGrid>

      <SpacingGrid container mt={DIALOG_SPACING_X} justify={"center"}>
        <SpacingGrid item {... GRID_SIZES} px={DIALOG_SPACING_X} mb={DIALOG_SPACING_X}>
          <SpacingPaper elevation={3} p={DIALOG_SPACING_X}>
            { participantsAssignableControls }
          </SpacingPaper>
          <Box my={2}>
            <small>{t("admin:waitinglist_generate_teams_select_hint")}</small>
          </Box>
        </SpacingGrid>
      </SpacingGrid>

      <SpacingGrid container justify={"center"}>
        <SpacingGrid item {... GRID_SIZES} px={DIALOG_SPACING_X} mt={DIALOG_SPACING_X}>
          <PrimarySuccessButtonAsync onClick={handleGenerateNewTeams} size={"large"} className={commonClasses.fullWidth} data-testid={"waitinglist-teams-generation-action"}>
            {t('admin:waitinglist_generate_teams')}
          </PrimarySuccessButtonAsync>
        </SpacingGrid>
      </SpacingGrid>
    </div>
  );
}

function NoSimpleActionView({numMissingParticipantsForFullTeamArrangement, remainingParticipants}: WaitingListInfo) {

  const {t} = useTranslation(["admin", "common"]);

  const numRemainingParticipants = remainingParticipants.length;

  return (
    <Grid container justify={"center"} data-testid={"waitinglist-distribute-to-teams-view"}>
      <Grid item {... GRID_SIZES}>
        <Box m={DIALOG_SPACING_X}>
          <Paragraph>
            <Trans i18nKey={"admin:waitinglist_no_simple_action_missing_participants_info"} values={{ numRemainingParticipants, numMissingParticipantsForFullTeamArrangement }} />
          </Paragraph>
          <Paragraph i18n={"admin:waitinglist_no_simple_action_distribution_options"} />
          <ul>
            <li><Trans i18nKey={"admin:waitinglist_no_simple_action_distribution_option_1"} /></li>
            <li><Trans i18nKey={"admin:waitinglist_no_simple_action_distribution_option_2"} /></li>
          </ul>
          <Paragraph><strong>{t('common:note')}</strong>: <Trans i18nKey={"admin:waitinglist_no_simple_action_distribution_info"} /></Paragraph>
        </Box>
      </Grid>
    </Grid>
  )
}

function TeamsNotGeneratedView() {

  const {t} = useTranslation(["admin", "common"]);

  return (
    <Grid container justify={"center"} data-testid={"waitinglist-teams-not-generated-view"}>
      <Grid item {... GRID_SIZES}>
        <Box m={DIALOG_SPACING_X}>
          <Paragraph>
            <Trans i18nKey={"admin:waitinglist_teams_not_generated"} /><br/>
            <Trans i18nKey={"admin:waitinglist_teams_not_generated_options"} />
          </Paragraph>
          <ul>
            <li><Trans i18nKey={"admin:waitinglist_teams_not_generated_option_1"} /></li>
            <li><Trans i18nKey={"admin:waitinglist_teams_not_generated_option_2"} /></li>
            <li><strong>{t("common:preview")}</strong>: <Trans i18nKey={"admin:waitinglist_teams_not_generated_option_3"} /></li>
          </ul>
          <Paragraph>
            <strong>{t('common:note')}</strong>: <Trans i18nKey={"admin:waitinglist_teams_not_generated_hint"} />
          </Paragraph>
        </Box>
      </Grid>
    </Grid>
  );
}

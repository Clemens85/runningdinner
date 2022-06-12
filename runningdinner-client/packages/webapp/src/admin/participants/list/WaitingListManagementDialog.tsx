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
  ActivityType,
  addSelectedParticipantToTeam,
  assignParticipantsToExistingTeamsAsync,
  BaseRunningDinnerProps,
  calculateCancelledTeamMembersNumArr,
  CallbackHandler,
  filterActivitiesByType,
  findAdminActivitiesByAdminIdAndTypesAsync,
  findEntityById,
  findWaitingListInfoAsync,
  Fullname,
  generateNewTeamsFromWaitingListAsync,
  getNumCancelledTeamMembers,
  getTeamParticipantsAssignment,
  isArrayEmpty,
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
  onSave: (affectedTeams: Team[], showNotificationView: boolean, triggerRefetch: boolean) => unknown;
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
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
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
  }, possibleActions);

  async function handleSave(affectedTeams: Team[], showNotificationView: boolean, triggerRefetch: boolean) {
    if (triggerRefetch) {
      reloadWaitingListContent();
    } else if (showNotificationView) {
      const activities = await findTeamOrDinnerRouteMessageActivitiesAsync(runningDinner.adminId);
      if (isArrayEmpty(activities)) {
        // Although we wanted to show notification view, there is no need for it, due to there were no messages sent so far.
        // => Hence we trigger refetch for determining if there is anything left to be done for the user (we know it better here than our child compponent which called us)
        reloadWaitingListContent();
        return;
      } // else: show notification view
      setTeamNotificationModel({
        affectedTeams,
        dinnerRouteMessagesAlreadySent: isArrayNotEmpty(filterActivitiesByType(activities, ActivityType.DINNERROUTE_MAIL_SENT))
      });
    }
  }

  async function findTeamOrDinnerRouteMessageActivitiesAsync(adminId: string) {
    const activityList = await findAdminActivitiesByAdminIdAndTypesAsync(adminId, [ActivityType.TEAMARRANGEMENT_MAIL_SENT, ActivityType.DINNERROUTE_MAIL_SENT]);
    return activityList.activities || [];
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
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  useEffect(() => {
    const model = setupAssignParticipantsToTeamsModel(teamsWithCancelStatusOrCancelledMembers, allParticipantsOnWaitingList);
    setTeamParticipantsAssignmentModel(model);
  }, []);

  function handleAddToTeam(team: Team, participant: SelectableParticipant) {
    const teamParticipantsAssignment = getTeamParticipantsAssignment(teamParticipantsAssignmentModel, team);
    const numCancelledTeamMembers = getNumCancelledTeamMembers(team, teamParticipantsAssignment.selectedParticipants.length, teamSize);
    if (numCancelledTeamMembers <= 0) {
      showWarning("Es können nur max. " + teamSize + " Teilnehmer in einem Team sein!");
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
      const affectedTeams = await assignParticipantsToExistingTeamsAsync(runningDinner.adminId, teamParticipantAssignments);
      showSuccess("Teams erfolgreich aufgefüllt");
      onSave(affectedTeams, true, false);
    } catch (e) {
      showHttpErrorDefaultNotification(e);
    }
  }

  const teamParticipantAssignments = teamParticipantsAssignmentModel.teamParticipantAssignments || [];
  const allSelectableParticipants = teamParticipantsAssignmentModel.allSelectableParticipants || [];
  const numParticipantsOnWaitingList = allParticipantsOnWaitingList.length; // Displays the original number of participants on waitinglist

  return (
    <>
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
            <PrimarySuccessButtonAsync onClick={handleAssignToExistingTeams} size={"large"} className={commonClasses.fullWidth}>
              {t('admin:waitinglist_assign_participants_teams')}!
            </PrimarySuccessButtonAsync>
          </Box>
        </Grid>
      </SpacingGrid>
    </>
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
    onSave(affectedTeams, false, true);
  }

  return (
    <>
      <SpacingGrid container mt={DIALOG_SPACING_X} justify={"center"} px={DIALOG_SPACING_X}>
        <Grid item {... GRID_SIZES}>
          <Subtitle>{t('admin:team_notify_cancellation')}</Subtitle>
          <Paragraph>{t("admin:waitinglist_notification_teams_info")}</Paragraph>
          <ul>
            { affectedTeams.map(team => <li key={team.id}>{getTeamNameMembers(team)}</li>) }
          </ul>
        </Grid>
      </SpacingGrid>

      { dinnerRouteMessagesAlreadySent &&
        <SpacingGrid container mt={DIALOG_SPACING_X} justify={"center"} px={DIALOG_SPACING_X}>
          <Grid item {... GRID_SIZES}>
            <Alert severity={"warning"}>
              <AlertTitle>{t('common:attention')}</AlertTitle>
              <Trans i18nKey='admin:waitinglist_notification_dinnerroutes_sent' />
            </Alert>
          </Grid>
        </SpacingGrid>
      }

      <SpacingGrid container justify={"center"} px={DIALOG_SPACING_X} mt={DIALOG_SPACING_X}>
        <Grid item {... GRID_SIZES}>
          <PrimarySuccessButtonAsync onClick={() => handleSendNotifications(true)}
                                     size={"large"} className={commonClasses.fullWidth}>
            {t('admin:waitinglist_notification_teams_sendmessages')}
          </PrimarySuccessButtonAsync>
          <SpacingButton onClick={() => handleSendNotifications(false)} mt={DIALOG_SPACING_X}
                         color={"primary"} variant={"outlined"} className={commonClasses.fullWidth}>
            {t('admin:waitinglist_notification_teams_continue_without_messages')}
          </SpacingButton>
        </Grid>
      </SpacingGrid>
    </>
  );
}

function SingleTeamParticipantsAssignmentView(props: SingleTeamParticipantsAssignmentProps & TeamParticipantsAssignment) {

  const {team, selectedParticipants, allSelectableParticipants, onAddToTeam, onRemoveFromTeam, teamSizeOfRunningDinner} = props;

  const selectableParticipantControls = allSelectableParticipants.map(participant =>
    <Box key={participant.id} >
      <SelectableEntity entity={participant}
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
    <>
      <SpacingPaper elevation={3} p={DIALOG_SPACING_X}>
        <Subtitle><TeamNr {...team} /></Subtitle>
        { renderTeamMembers() }
      </SpacingPaper>
      <Box my={2}>
        <small>(Wähle die Teilnehmer aus die zu diesem Team hinzufügen willst)</small>
      </Box>
      { selectableParticipantControls }
    </>
  );

}

function RegenerateTeamsWithAssignableParticipantsView(props: WaitingListInfo & BaseRunningDinnerProps & SaveCallback) {

  const {numMissingParticipantsForFullTeamArrangement, participtantsForTeamArrangement, remainingParticipants, runningDinner, onSave } = props;

  const commonClasses = useCommonStyles();
  const {showInfo, showSuccess} = useCustomSnackbar();
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
      await generateNewTeamsFromWaitingListAsync(runningDinner.adminId, participantsForTeamsGeneration);
      showSuccess("Teams erfolgreich generiert");
      onSave([], true, false); // TODO: Get new teams out of new generated ones!
    } catch (e) {
      showHttpErrorDefaultNotification(e);
    }
  }

  function handleParticipantSelectionChange(participant: SelectableParticipant, selected: boolean) {
    if (getNumSelectedParticipantsParticipantsInState() >= numParticipantsAssignable && selected) {
      showInfo("Erst unchecken");
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
  }, []);


  const participantsAssignableControls = participantList.map(participant =>
    <Box key={participant.id} >
      <SelectableEntity entity={participant} onSelectionChange={handleParticipantSelectionChange} />
    </Box>
  );

  return (
    <>
      <SpacingGrid container mt={DIALOG_SPACING_X} justify={"center"} px={DIALOG_SPACING_X}>
        <SpacingGrid item {... GRID_SIZES} px={DIALOG_SPACING_X}>
          <Subtitle>Es gibt <strong>{numParticipantsAssignable}</strong> Teilnehmer welche als neue Teams eingeteilt werden können!</Subtitle>
          { numRemainingParticipants > 0 &&
            <Paragraph>
              Es gibt noch <strong>{numRemainingParticipants}</strong> Teilnehmer welche übrig bleiben. Falls sich noch <strong>{numMissingParticipantsForFullTeamArrangement}</strong> weitere Teilnehmer
              anmelden, so kannst du alle diese später ebenfalls noch als weitere Teams hinzufügen.
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
            <small>(Wähle die Teilnehmer aus, welche als neue Teams eingeteilt werden sollen)</small>
          </Box>
        </SpacingGrid>
      </SpacingGrid>

      <SpacingGrid container justify={"center"}>
        <SpacingGrid item {... GRID_SIZES} px={DIALOG_SPACING_X} mt={DIALOG_SPACING_X}>
          <PrimarySuccessButtonAsync onClick={handleGenerateNewTeams} size={"large"} className={commonClasses.fullWidth}>
            {t('Teilnehmer in Teams einteilen!')}
          </PrimarySuccessButtonAsync>
        </SpacingGrid>
      </SpacingGrid>
    </>
  );
}

function NoSimpleActionView({numMissingParticipantsForFullTeamArrangement, remainingParticipants}: WaitingListInfo) {

  const {t} = useTranslation(["admin", "common"]);

  const numRemainingParticpants = remainingParticipants.length;

  return (
    <Grid container justify={"center"}>
      <Grid item {... GRID_SIZES}>
        <Box m={DIALOG_SPACING_X}>
          <Paragraph>
            Die {numRemainingParticpants} verbleibenden Teilnehmer auf der Warteliste können nicht als neue Teams hinzugefügt werden.<br/>
            Hierzu fehlen derzeit noch <strong>{numMissingParticipantsForFullTeamArrangement}</strong> zusätzliche Teilnehmer.
          </Paragraph>
          <Paragraph>Folgende Optionen stehen dir zur Verfügung:</Paragraph>
          <ul>
            <li>First come first serve: Die übrig gebliebenen Teilnehmer nehmen zunächst nicht am Event teil, können aber bei Bedarf z.B. später mögliche Teilnehmer/Team-Absagen ersetzen.</li>
            <li>Falls sich doch noch <strong>{numMissingParticipantsForFullTeamArrangement}</strong> zusätzliche Teilnehmer anmelden, kannst du diese als neue Teams hinzufügen.</li>
          </ul>
          <Paragraph>
            <strong>{t('common:note')}</strong>: Aktuell gibt es noch keine Möglichkeit übrig gebliebene Teilnehmer automatisch auf existierende Teams zu verteilen.
            An diesem Feature wird derzeit gearbeitet, aber es ist noch nicht verfübar. Bis dahin und falls du dies tun willst, musst du das händisch mit Zettel und Stift erledigen und kannst aber ggfalls
            über das Tool dann die betroffenen Teams via Team-Nachrichten-Versand benachrichtigen.
          </Paragraph>
        </Box>
      </Grid>
    </Grid>
  )
}

function TeamsNotGeneratedView() {

  const {t} = useTranslation(["admin", "common"]);

  return (
    <Grid container justify={"center"}>
      <Grid item {... GRID_SIZES}>
        <Box m={DIALOG_SPACING_X}>
          <Paragraph>
            Je nach Anzahl der Teilnehmer kann es vorkommen, dass nicht alle angemeldeten Teilnehmer in Teams eingeteilt werden können.
            Hier kannst du alle übrig gebliebenen Teilnehmer verwalten <strong>nachdem</strong> du die Team-Einteilungen vorgenommen hast.
            <br/>Folgende Optionen stehen dir dann zur Verfügung:
          </Paragraph>
          <ul>
            <li>Abgesagte Teilnehmer / Teams durch Teilnehmer auf Warteliste ersetzen</li>
            <li>Bei genügend großer Anzahl auf Warteliste, Teilnehmer nachträglich als Teams hinzufügen</li>
            <li><strong>{t("common:preview")}</strong>: Übrig gebliebene Teilnehmer auf existierende Teams verteilen (<strong>noch nicht verfügbar, kommt aber bald ...</strong> bis dahin musst du dies händisch mit Zettel + Stift erledigen)</li>
          </ul>
          <Paragraph>
            <strong>{t('common:note')}</strong>: Es macht generell Sinn, die Team-Einteilung immer so spät wie möglich und so früh wie nötig vorzunehmen.
          </Paragraph>
        </Box>
      </Grid>
    </Grid>
  );
}

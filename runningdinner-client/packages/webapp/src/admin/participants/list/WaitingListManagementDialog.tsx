import {
  AppBar,
  createStyles,
  Dialog,
  Grid,
  IconButton, makeStyles,
  Slide,
  Theme,
  Toolbar,
  Typography
} from '@material-ui/core';
import {
  isArrayNotEmpty,
  Team,
  CallbackHandler,
  TeamNr,
  SelectableParticipant,
  Fullname,
  findEntityById,
  TeamParticipantsAssignmentModel,
  setupAssignParticipantsToTeamsModel,
  addSelectedParticipantToTeam,
  removeSelectedParticipantFromTeam,
  TeamParticipantsAssignment,
  calculateCancelledTeamMembersNumArr,
  getNumCancelledTeamMembers,
  getTeamParticipantsAssignment,
  findWaitingListInfoAsync,
  BaseRunningDinnerProps,
  WaitingListInfo,
  WaitingListAction,
  generateNewTeamsFromWaitingListAsync, useBackendIssueHandler, assignParticipantsToExistingTeamsAsync
} from '@runningdinner/shared';
import { Fetch } from '../../../common/Fetch';
import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import {SmallTitle, Subtitle} from "../../../common/theme/typography/Tags";
import Paragraph from "../../../common/theme/typography/Paragraph";
import Box from "@material-ui/core/Box";
import SelectableEntity from "../../common/SelectableEntity";
import cloneDeep from 'lodash/cloneDeep';
import { SpacingPaper } from '../../../common/theme/SpacingPaper';
import {CancelledTeamMember} from "../../teams/CancelledTeamMember";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";
import { TransitionProps } from '@material-ui/core/transitions';
import CloseIcon from '@material-ui/icons/Close';
import useCommonStyles from "../../../common/theme/CommonStyles";
import {SpacingGrid} from "../../../common/theme/SpacingGrid";
import {useNotificationHttpError} from "../../../common/NotificationHttpErrorHook";
import {PrimarySuccessButtonAsync} from "../../../common/theme/PrimarySuccessButtonAsync";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";
import { GridSize } from "@material-ui/core/Grid/Grid";

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

interface WaitingListManagementDialogProps extends BaseRunningDinnerProps {
  onClose: CallbackHandler;
}

export function WaitingListManagementDialog(props: WaitingListManagementDialogProps) {
  
  const {t} = useTranslation(["admin", "common"]);

  const dialogClasses = useDialogStyles();

  const {runningDinner, onClose} = props

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
                  <WaitingListManagementDialogContentView {...response.result} reFetch={response.reFetch} runningDinner={runningDinner} />
                </Box>
             } />

    </Dialog>
  );
}

interface WaitingListManagementDialogContentProps extends WaitingListInfo, BaseRunningDinnerProps {
  reFetch: () => Promise<WaitingListInfo>;
}

interface WaitingListAssignmentViewProps extends WaitingListManagementDialogContentProps {
  onSave: CallbackHandler;
}

function WaitingListManagementDialogContentView(props: WaitingListManagementDialogContentProps) {

  const { possibleActions, teamsGenerated, reFetch } = props;

  const [currentWaitingListAction, setCurrentWaitingListAction] = React.useState<WaitingListAction>();
  React.useEffect(() => {
    setCurrentWaitingListAction(isArrayNotEmpty(possibleActions) ? possibleActions[0] : undefined);
  }, possibleActions);

  function handleAssignToExistingTeams() {
    reFetch();
  }

  function handleGenerateNewTeams() {
    reFetch();
  }

  if (!teamsGenerated) {
    return <TeamsNotGeneratedView />;
  }

  if (!currentWaitingListAction) {
    return <NoActionView {... props } />;
  }
  return (
    <>
      { currentWaitingListAction === WaitingListAction.GENERATE_NEW_TEAMS && <RegenerateTeamsWithAssignableParticipantsView {... props} onSave={handleGenerateNewTeams} /> }
      { currentWaitingListAction === WaitingListAction.ASSIGN_TO_EXISTING_TEAMS && <TeamParticipantsAssignmentView {...props} onSave={handleAssignToExistingTeams}/> }
    </>
  );
}

const DIALOG_SPACING_X = 3;
const GRID_SIZES: Partial<Record<Breakpoint, GridSize>> = { xs: 12, md: 4, lg: 4, xl: 4 };

function TeamParticipantsAssignmentView({teamsWithCancelStatusOrCancelledMembers, remainingParticipants, participtantsForTeamArrangement, runningDinner, onSave}: WaitingListAssignmentViewProps) {

  const {t} = useTranslation(['admin', 'common']);
  const commonClasses = useCommonStyles();
  const {showInfo, showSuccess} = useCustomSnackbar();

  const {teamSize} = runningDinner.options;
  const [teamParticipantsAssignmentModel, setTeamParticipantsAssignmentModel] = useState<TeamParticipantsAssignmentModel>(setupAssignParticipantsToTeamsModel(teamsWithCancelStatusOrCancelledMembers, remainingParticipants));

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  useEffect(() => {
    const allParticipants = participtantsForTeamArrangement.concat(remainingParticipants);
    const model = setupAssignParticipantsToTeamsModel(teamsWithCancelStatusOrCancelledMembers, allParticipants);
    setTeamParticipantsAssignmentModel(model);
  }, []);

  function handleAddToTeam(team: Team, participant: SelectableParticipant) {
    const teamParticipantsAssignment = getTeamParticipantsAssignment(teamParticipantsAssignmentModel, team);
    const numCancelledTeamMembers = getNumCancelledTeamMembers(team, teamParticipantsAssignment.selectedParticipants.length, teamSize);
    if (numCancelledTeamMembers <= 0) {
      showInfo("Es können nur max. " + teamSize + " Teilnehmer in einem Team sein!");
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
      await assignParticipantsToExistingTeamsAsync(runningDinner.adminId, teamParticipantAssignments);
      showSuccess("Teams erfolgreich aufgefüllt");
      onSave();
    } catch (e) {
      showHttpErrorDefaultNotification(e);
    }
  }

  const teamParticipantAssignments = teamParticipantsAssignmentModel.teamParticipantAssignments || [];
  const allSelectableParticipants = teamParticipantsAssignmentModel.allSelectableParticipants || [];

  return (
    <>
      <SpacingGrid container mt={DIALOG_SPACING_X} justify={"center"}>
        <>
        {
          teamParticipantAssignments.map(tpa => {
            return (
              <Grid item {... GRID_SIZES} key={tpa.team.id}>
                <Box mx={DIALOG_SPACING_X}>
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
            <PrimarySuccessButtonAsync onClick={handleAssignToExistingTeams} size={"large"} className={commonClasses.buttonSpacingLeft}>
              {t('Teams durch Teilnehmer auf Warteliste auffüllen!')}
            </PrimarySuccessButtonAsync>
          </Box>
        </Grid>
      </SpacingGrid>

    </>
  );
}

interface SingleTeamParticipantsAssignmentViewProps extends TeamParticipantsAssignment {
  allSelectableParticipants: SelectableParticipant[];
  onRemoveFromTeam: (team: Team, participant: SelectableParticipant) => unknown;
  onAddToTeam: (team: Team, participant: SelectableParticipant) => unknown;
  teamSizeOfRunningDinner: number;
}

function SingleTeamParticipantsAssignmentView({team, selectedParticipants, allSelectableParticipants, onAddToTeam, onRemoveFromTeam, teamSizeOfRunningDinner}: SingleTeamParticipantsAssignmentViewProps) {

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
      { selectableParticipantControls }
    </>
  );

}

function RegenerateTeamsWithAssignableParticipantsView(props: WaitingListAssignmentViewProps) {

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
      onSave();
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

  const colMd = 6;

  const participantsAssignableControls = participantList.map(participant =>
    <Box key={participant.id} >
      <SelectableEntity entity={participant} onSelectionChange={handleParticipantSelectionChange} />
    </Box>
  );

  return (
    <>
      <Grid container>
        <Grid item {... GRID_SIZES}>
          <Box mx={DIALOG_SPACING_X}>
            <Paragraph>Hier kannst du <strong>{numParticipantsAssignable}</strong> Teilnehmer als neue Teams hinzufügen</Paragraph>
            { numRemainingParticipants > 0 &&
              <Paragraph>
                Es gibt noch <strong>{numRemainingParticipants}</strong> Teilnehmer welche übrig bleiben. Falls sich noch <strong>{numMissingParticipantsForFullTeamArrangement}</strong> weitere Teilnehmer
                anmelden, so kannst du alle diese später ebenfalls noch als weitere Teams hinzufügen.
              </Paragraph>
            }
          </Box>
        </Grid>

        <Grid item {... GRID_SIZES}>
          <SpacingPaper elevation={3} p={DIALOG_SPACING_X} mx={DIALOG_SPACING_X}>
            { participantsAssignableControls }
          </SpacingPaper>
        </Grid>

      </Grid>

      <Grid container justify={"flex-end"}>
        <Grid item {... GRID_SIZES}>
          <Box mx={DIALOG_SPACING_X} mt={DIALOG_SPACING_X}>
            <PrimarySuccessButtonAsync onClick={handleGenerateNewTeams} size={"large"} className={commonClasses.buttonSpacingLeft}>
              {t('Teilnehmer in Teams einteilen!')}
            </PrimarySuccessButtonAsync>
          </Box>
        </Grid>
      </Grid>

    </>
  );
}

function NoActionView({numMissingParticipantsForFullTeamArrangement}: WaitingListInfo) {

  const {t} = useTranslation(["admin", "common"]);

  return (
    <Grid container justify={"center"}>
      <Grid item {... GRID_SIZES}>
        <Box m={DIALOG_SPACING_X}>
          <Paragraph>
            Die aktuell vorhandenen Teilnehmer können leider nicht als neue Teams hinzugefügt werden.
            Hierzu fehlen derzeit noch <strong>{numMissingParticipantsForFullTeamArrangement}</strong> zusätzliche Teilnehmer.
          </Paragraph>
          <Paragraph>
            Folgende Optionen stehen dir zur Verfügung:
            <ul>
              <li>First come first serve: Die übrig gebliebenen Teilnehmer nehmen zunächst nicht am Event teil, können aber bei Bedarf z.B. später mögliche Teilnehmer/Team-Absagen ersetzen.</li>
              <li>Falls sich doch noch <strong>{numMissingParticipantsForFullTeamArrangement}</strong> zusätzliche Teilnehmer anmelden, kannst du diese als neue Teams hinzufügen.</li>
            </ul>
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



interface PossibleActionSelectControlProps {
  possibleActions: WaitingListAction[];
  currentWaitingListAction: WaitingListAction;
  onWaitingListActionChange: (wla: WaitingListAction) => unknown;
}

// function PossibleActionSelectControl({possibleActions, currentWaitingListAction, onWaitingListActionChange}: PossibleActionSelectControlProps) {
//
//   function handleChange(changeEvent: React.ChangeEvent<{ value: unknown}>) {
//     const newWaitingListAction = changeEvent.target.value as WaitingListAction;
//     onWaitingListActionChange(newWaitingListAction);
//   }
//
//   const selectionOptions = possibleActions
//     .map(possibleAction =>
//       <MenuItem value={possibleAction} key={possibleAction}>
//         {possibleAction}
//       </MenuItem>
//     );
//
//   const selectionLabel = 'TODO';
//   return (
//     <>
//       <SmallTitle>Es sind mehrere Aktionen möglich</SmallTitle>
//       <FormControl fullWidth>
//         <InputLabel>{selectionLabel}</InputLabel>
//         <Select
//           autoWidth
//           value={currentWaitingListAction}
//           onChange={handleChange}
//           inputProps={{ 'aria-label': selectionLabel }}>
//           {selectionOptions}
//         </Select>
//       </FormControl>
//     </>
//   )
// }



{/*{ possibleActions.length > 1 && <PossibleActionSelectControl possibleActions={possibleActions}*/}
{/*                                                             currentWaitingListAction={currentWaitingListAction}*/}
{/*                                                             onWaitingListActionChange={setCurrentWaitingListAction} />  }*/}
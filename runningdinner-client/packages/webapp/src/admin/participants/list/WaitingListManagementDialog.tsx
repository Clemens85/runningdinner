import {Dialog, DialogContent, Divider, Grid, Paper} from '@material-ui/core';
import {
  findTeamsForWaitingListAsync,
  isArrayNotEmpty,
  Team,
  CallbackHandler,
  getWaitingListParticipantsAssignableToTeams,
  TeamNr,
  Participant,
  SelectableParticipant, isSameEntity, removeEntityFromList, Fullname, generateCancelledTeamMembersAsNumberArray
} from '@runningdinner/shared';
import DialogActionsPanel from '../../../common/theme/DialogActionsPanel';
import { DialogTitleCloseable } from '../../../common/theme/DialogTitleCloseable';
import { Fetch } from '../../../common/Fetch';
import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import { WaitingListManagementBaseProps } from './WaitingListManagementAlert';
import {Subtitle} from "../../../common/theme/typography/Tags";
import Paragraph from "../../../common/theme/typography/Paragraph";
import Box from "@material-ui/core/Box";
import SelectableEntity from "../../common/SelectableEntity";
import find from "lodash/find";
import uniqBy from 'lodash/uniqBy';
import orderBy from 'lodash/orderBy';
import cloneDeep from 'lodash/cloneDeep';
import { SpacingPaper } from '../../../common/theme/SpacingPaper';
import {CancelledTeamMember} from "../../teams/CancelledTeamMember";
import {useCustomSnackbar} from "../../../common/theme/CustomSnackbarHook";

interface WaitingListManagementDialogProps extends WaitingListManagementBaseProps {
  onCancel: CallbackHandler;
  onSave: CallbackHandler;
}

export function WaitingListManagementDialog(props: WaitingListManagementDialogProps) {
  
  const {t} = useTranslation(["admin", "common"]);

  const {runningDinner, onCancel, onSave} = props

  return (
    <Dialog onClose={onCancel} open={true}>
      <DialogTitleCloseable onClose={onCancel}>{t('Wartelisten-Verwaltung')}</DialogTitleCloseable>
      <DialogContent>
        <Fetch asyncFunction={findTeamsForWaitingListAsync}
               parameters={[runningDinner.adminId]}
               render={response =>
                  <WaitingListManagementDialogContentView {...props} teamsWithCancelStatusOrCancelledMembers={response.result} />
               } />
      </DialogContent>
      <DialogActionsPanel onOk={onSave} 
                          onCancel={onCancel}
                          okLabel={t('common:save')}
                          cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}

interface WaitingListManagementDialogContentViewProps extends WaitingListManagementDialogProps {
  teamsWithCancelStatusOrCancelledMembers: Team[];
}

function WaitingListManagementDialogContentView(props: WaitingListManagementDialogContentViewProps) {

  const {runningDinner, teamsWithCancelStatusOrCancelledMembers, participantsNotAssignable} = props;

  if (isArrayNotEmpty(teamsWithCancelStatusOrCancelledMembers)) {
    return <TeamParticipantsAssignmentView {...props} />
  } else {
    const waitingListParticipantsAssignableToTeams = getWaitingListParticipantsAssignableToTeams(runningDinner, participantsNotAssignable);
    if (isArrayNotEmpty(waitingListParticipantsAssignableToTeams.participantsAssignable)) {
      <RegenerateTeamsWithAssignableParticipantsView />
    } else {
      return <>TODO</>
    }
  }

  return (
    <>TODO</>
  );
}


interface TeamParticipantsAssignmentModel {
  allSelectableParticipants: SelectableParticipant[];
  teamParticipantAssignments: TeamParticipantsAssignment[];
}

interface TeamParticipantsAssignment {
  team: Team;
  selectedParticipants: SelectableParticipant[];
}

function setupAssignParticipantsToTeamsModel(teams: Team[], participants: Participant[]): TeamParticipantsAssignmentModel {
  const result = {
    allSelectableParticipants: cloneDeep(participants),
    teamParticipantAssignments: teams.map((t) => { return { team: t, selectedParticipants: [] } })
  };
  return orderAndDistinctAllSelectableParticipants(result);
}

function removeSelectedParticipantFromTeam(teamParticipantsAssignmentModel: TeamParticipantsAssignmentModel, team: Team, participant: SelectableParticipant) {
  const teamParticipantsAssignment = getTeamParticipantsAssignment(teamParticipantsAssignmentModel, team);
  teamParticipantsAssignment.selectedParticipants = removeEntityFromList(teamParticipantsAssignment.selectedParticipants, participant) || [];
  participant.selected = false;
  teamParticipantsAssignmentModel.allSelectableParticipants.push(participant);
  return orderAndDistinctAllSelectableParticipants(teamParticipantsAssignmentModel);
}

function addSelectedParticipantToTeam(teamParticipantsAssignmentModel: TeamParticipantsAssignmentModel, team: Team, participant: SelectableParticipant) {
  const teamParticipantsAssignment = getTeamParticipantsAssignment(teamParticipantsAssignmentModel, team);
  teamParticipantsAssignment.selectedParticipants.push(participant);
  participant.selected = true;
  teamParticipantsAssignmentModel.allSelectableParticipants = removeEntityFromList(teamParticipantsAssignmentModel.allSelectableParticipants, participant) || [];
  return orderAndDistinctAllSelectableParticipants(teamParticipantsAssignmentModel);
}

function getTeamParticipantsAssignment(teamParticipantsAssignmentModel: TeamParticipantsAssignmentModel, team: Team): TeamParticipantsAssignment {
  const teamParticipantsAssignment = find(teamParticipantsAssignmentModel.teamParticipantAssignments, (tpa) => isSameEntity(tpa.team, team));
  if (!teamParticipantsAssignment) {
    throw `Could not find TeamParticipantsAssignment in ${JSON.stringify(teamParticipantsAssignmentModel.teamParticipantAssignments)} for team ${JSON.stringify(team)}`;
  }
  return teamParticipantsAssignment;
}

function orderAndDistinctAllSelectableParticipants(teamParticipantsAssignmentModel: TeamParticipantsAssignmentModel) {
  teamParticipantsAssignmentModel.allSelectableParticipants = uniqBy(teamParticipantsAssignmentModel.allSelectableParticipants, 'id');
  teamParticipantsAssignmentModel.allSelectableParticipants = orderBy(teamParticipantsAssignmentModel.allSelectableParticipants, 'participantNumber');
  return teamParticipantsAssignmentModel;
}

function calculateCancelledTeamMembersNumArr(team: Team, numSelectedParticipants: number, teamSizeOfRunningDinner: number): number[] {
  const numCancelledTeamMembers = getNumCancelledTeamMembers(team, numSelectedParticipants, teamSizeOfRunningDinner);
  let cancelledTeamMembers = generateCancelledTeamMembersAsNumberArray(team, teamSizeOfRunningDinner);
  return cancelledTeamMembers.slice(0, numCancelledTeamMembers);
}

function getNumCancelledTeamMembers(team: Team, numSelectedParticipants: number, teamSizeOfRunningDinner: number) {
  const { teamMembers } = team;
  let numCancelledTeamMembers = teamSizeOfRunningDinner - teamMembers.length - numSelectedParticipants;
  if (numCancelledTeamMembers < 0) {
    numCancelledTeamMembers = 0;
  }
  return numCancelledTeamMembers;
}

function TeamParticipantsAssignmentView({teamsWithCancelStatusOrCancelledMembers, participantsNotAssignable, runningDinner}: WaitingListManagementDialogContentViewProps) {

  const {showInfo} = useCustomSnackbar();

  const {teamSize} = runningDinner.options;
  const [teamParticipantsAssignmentModel, setTeamParticipantsAssignmentModel] = useState<TeamParticipantsAssignmentModel>(setupAssignParticipantsToTeamsModel(teamsWithCancelStatusOrCancelledMembers, participantsNotAssignable));

  useEffect(() => {
    const model = setupAssignParticipantsToTeamsModel(teamsWithCancelStatusOrCancelledMembers, participantsNotAssignable);
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
      const updatedModel = addSelectedParticipantToTeam(prevModelState, team, participant);
      return updatedModel;
    });
  }

  function handleRemoveFromTeam(team: Team, participant: SelectableParticipant) {
    setTeamParticipantsAssignmentModel(prevState => {
      const prevModelState = cloneDeep(prevState);
      const updatedModel = removeSelectedParticipantFromTeam(prevModelState, team, participant);
      return updatedModel;
    });
  }

  const teamParticipantAssignments = teamParticipantsAssignmentModel.teamParticipantAssignments || [];
  const allSelectableParticipants = teamParticipantsAssignmentModel.allSelectableParticipants || [];

  return (
    <Grid container spacing={3}>
      <>
      {
        teamParticipantAssignments.map(tpa => {
          return (
            <Grid item key={tpa.team.id}>
              <SingleTeamParticipantsAssignmentView {...tpa} allSelectableParticipants={allSelectableParticipants}
                                                    teamSizeOfRunningDinner={teamSize}
                                                    onAddToTeam={handleAddToTeam}
                                                    onRemoveFromTeam={handleRemoveFromTeam} />
              <Divider orientation="vertical" flexItem />
            </Grid>
          )
        })
      }
      </>
    </Grid>
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
      <SpacingPaper elevation={3} p={3}>
        <Subtitle><TeamNr {...team} /></Subtitle>
        { renderTeamMembers() }
      </SpacingPaper>
      { selectableParticipantControls }
    </>
  );

}

function RegenerateTeamsWithAssignableParticipantsView() {
  return (
    <>
    </>
  );
}


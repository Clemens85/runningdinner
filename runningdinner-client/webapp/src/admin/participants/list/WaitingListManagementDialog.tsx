import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Button, Dialog, Grid, IconButton, Paper, Slide, Toolbar, Typography } from '@mui/material';
import { Alert, AlertTitle } from '@mui/material';
import Box from '@mui/material/Box';
import { TransitionProps } from '@mui/material/transitions';
import {
  addSelectedParticipantToTeam,
  assertDefined,
  assignParticipantsToExistingTeamsAsync,
  BaseRunningDinnerProps,
  calculateCancelledTeamMembersNumArr,
  CallbackHandler,
  findEntityById,
  Fullname,
  generateNewTeamsFromWaitingListAsync,
  getNumCancelledTeamMembers,
  getTeamParticipantsAssignment,
  HttpError,
  isArrayNotEmpty,
  isQuerySucceeded,
  MessageSubType,
  removeSelectedParticipantFromTeam,
  SelectableParticipant,
  setupAssignParticipantsToTeamsModel,
  Team,
  TeamNr,
  TeamParticipantsAssignment,
  TeamParticipantsAssignmentModel,
  useBackendIssueHandler,
  useFindWaitingListInfo,
  useTeamNameMembers,
  WaitingListAction,
  WaitingListActionAdditional,
  WaitingListActionResult,
  WaitingListActionUI,
  WaitingListInfo,
} from '@runningdinner/shared';
import { cloneDeep } from 'lodash-es';
import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { FetchProgressBar } from '../../../common/FetchProgressBar';
import { useNotificationHttpError } from '../../../common/NotificationHttpErrorHook';
import { useCustomSnackbar } from '../../../common/theme/CustomSnackbarHook';
import { PrimarySuccessButtonAsync } from '../../../common/theme/PrimarySuccessButtonAsync';
import Paragraph from '../../../common/theme/typography/Paragraph';
import { Subtitle } from '../../../common/theme/typography/Tags';
import { useAdminNavigation } from '../../AdminNavigationHook';
import SelectableEntity from '../../common/SelectableEntity';
import { CancelledTeamMember } from '../../teams/CancelledTeamMember';

const Transition = React.forwardRef(function Transition(props: TransitionProps & { children?: React.ReactElement }, ref: React.Ref<unknown>) {
  // @ts-ignore
  return <Slide direction="up" ref={ref} {...props} />;
});

type CloseCallback = {
  onClose: CallbackHandler;
};
type SaveCallback = {
  onSave: (waitingListActionResult: WaitingListActionResult) => unknown;
};

type SingleTeamParticipantsAssignmentProps = {
  allSelectableParticipants: SelectableParticipant[];
  onRemoveFromTeam: (team: Team, participant: SelectableParticipant) => unknown;
  onAddToTeam: (team: Team, participant: SelectableParticipant) => unknown;
  teamSizeOfRunningDinner: number;
};

type TeamNotificationModel = {
  dinnerRouteMessagesAlreadySent: boolean;
  affectedTeams: Team[];
};

export function WaitingListManagementDialog(props: BaseRunningDinnerProps & CloseCallback) {
  const { t } = useTranslation(['admin', 'common']);

  const { runningDinner, onClose } = props;

  return (
    <Dialog onClose={onClose} open={true} fullScreen TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative', color: '#fff', backgroundColor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
            {t('admin:waitinglist_management')}
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close" data-testid={'close-waitinglist-view-action'} size="large">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box mt={3}>
        <WaitingListManagementDialogContentView runningDinner={runningDinner} onClose={onClose} />
      </Box>
    </Dialog>
  );
}

function WaitingListManagementDialogContentView(props: CloseCallback & BaseRunningDinnerProps) {
  const findWaitingListInfoQuery = useFindWaitingListInfo(props.runningDinner.adminId);

  const [currentWaitingListAction, setCurrentWaitingListAction] = React.useState<WaitingListActionUI>();
  const [teamNotificationModel, setTeamNotificationModel] = React.useState<TeamNotificationModel>();

  React.useEffect(() => {
    const possibleActions = findWaitingListInfoQuery.data?.possibleActions;
    if (!possibleActions) {
      return;
    }
    setCurrentWaitingListAction(isArrayNotEmpty(possibleActions) ? possibleActions[0] : undefined);
  }, [findWaitingListInfoQuery.data?.possibleActions]);

  if (!isQuerySucceeded(findWaitingListInfoQuery)) {
    return <FetchProgressBar {...findWaitingListInfoQuery} />;
  }
  const { data: waitingListInfo, refetch } = findWaitingListInfoQuery;
  assertDefined(waitingListInfo);

  const { runningDinner, onClose } = props;
  const { teamsGenerated } = waitingListInfo;

  async function handleSave(waitingListActionResult: WaitingListActionResult) {
    const { affectedTeams } = waitingListActionResult;
    const showNotificationView = (waitingListActionResult.dinnerRouteMessagesAlreadySent || waitingListActionResult.teamMessagesAlreadySent) && isArrayNotEmpty(affectedTeams);
    if (!showNotificationView) {
      reloadWaitingListContent();
      return;
    }
    // else: show notification view
    setTeamNotificationModel({
      affectedTeams,
      dinnerRouteMessagesAlreadySent: waitingListActionResult.dinnerRouteMessagesAlreadySent,
    });
  }

  function reloadWaitingListContent() {
    setTeamNotificationModel(undefined);
    refetch();
  }

  if (!teamsGenerated) {
    return <TeamsNotGeneratedView />;
  }

  if (teamNotificationModel) {
    return <NotifyTeamsAboutChangesView {...teamNotificationModel} onSave={reloadWaitingListContent} runningDinner={runningDinner} />;
  }

  if (currentWaitingListAction === WaitingListActionAdditional.NO_ACTION) {
    onClose();
    return null;
  }

  return (
    <>
      {currentWaitingListAction === WaitingListAction.GENERATE_NEW_TEAMS && (
        <RegenerateTeamsWithAssignableParticipantsView {...waitingListInfo} onSave={handleSave} runningDinner={runningDinner} />
      )}
      {currentWaitingListAction === WaitingListAction.ASSIGN_TO_EXISTING_TEAMS && (
        <TeamParticipantsAssignmentView {...waitingListInfo} onSave={handleSave} runningDinner={runningDinner} />
      )}
      {currentWaitingListAction === WaitingListAction.DISTRIBUTE_TO_TEAMS && <NoSimpleActionView {...waitingListInfo} />}
    </>
  );
}

const DIALOG_SPACING_X = 3;

function TeamParticipantsAssignmentView(props: WaitingListInfo & SaveCallback & BaseRunningDinnerProps) {
  const { teamsWithCancelStatusOrCancelledMembers, totalNumberOfMissingTeamMembers, allParticipantsOnWaitingList, runningDinner, onSave } = props;

  const { t } = useTranslation(['admin', 'common']);
  const { showWarning, showSuccess } = useCustomSnackbar();

  const { teamSize } = runningDinner.options;
  const [teamParticipantsAssignmentModel, setTeamParticipantsAssignmentModel] = useState<TeamParticipantsAssignmentModel>(
    setupAssignParticipantsToTeamsModel(teamsWithCancelStatusOrCancelledMembers, allParticipantsOnWaitingList),
  );

  const { getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['admin', 'common'],
    },
  });
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  useEffect(() => {
    const model = setupAssignParticipantsToTeamsModel(teamsWithCancelStatusOrCancelledMembers, allParticipantsOnWaitingList);
    setTeamParticipantsAssignmentModel(model);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleAddToTeam(team: Team, participant: SelectableParticipant) {
    const teamParticipantsAssignment = getTeamParticipantsAssignment(teamParticipantsAssignmentModel, team);
    const numCancelledTeamMembers = getNumCancelledTeamMembers(team, teamParticipantsAssignment.selectedParticipants.length, teamSize);
    if (numCancelledTeamMembers <= 0) {
      showWarning(t('admin:waitinglist_assign_participants_teams_select_max_warning', { teamSize }));
      return;
    }
    setTeamParticipantsAssignmentModel((prevState) => {
      const prevModelState = cloneDeep(prevState);
      return addSelectedParticipantToTeam(prevModelState, team, participant);
    });
  }

  function handleRemoveFromTeam(team: Team, participant: SelectableParticipant) {
    setTeamParticipantsAssignmentModel((prevState) => {
      const prevModelState = cloneDeep(prevState);
      return removeSelectedParticipantFromTeam(prevModelState, team, participant);
    });
  }

  async function handleAssignToExistingTeams() {
    const { teamParticipantAssignments } = teamParticipantsAssignmentModel;
    try {
      const result = await assignParticipantsToExistingTeamsAsync(runningDinner.adminId, teamParticipantAssignments);
      showSuccess(t('admin:waitinglist_assign_participants_teams_success'));
      onSave(result);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError, {
        showGenericMesssageOnValidationError: false,
        showMessageForValidationErrorsWithoutSource: true,
      });
    }
  }

  const teamParticipantAssignments = teamParticipantsAssignmentModel.teamParticipantAssignments || [];
  const allSelectableParticipants = teamParticipantsAssignmentModel.allSelectableParticipants || [];
  const numParticipantsOnWaitingList = allParticipantsOnWaitingList.length; // Displays the original number of participants on waitinglist

  return (
    <div data-testid={'waitinglist-teams-participants-assignment-view'}>
      <Grid container justifyContent={'center'} sx={{ mt: DIALOG_SPACING_X, mx: DIALOG_SPACING_X, justifyContent: 'center' }}>
        <Grid>
          <Subtitle>{t('admin:waitinglist_assign_participants_teams')}</Subtitle>
          <Paragraph>
            <Trans i18nKey={'admin:waitinglist_num_participants_list_info'} values={{ numParticipants: numParticipantsOnWaitingList }} />
            <br />
            <Trans i18nKey={'admin:waitinglist_num_participants_assignment_info'} />
            <br />
            <Trans i18nKey={'admin:waitinglist_num_missing_teammembers'} values={{ totalNumberOfMissingTeamMembers }} />
          </Paragraph>
        </Grid>
      </Grid>
      <Grid container justifyContent={'center'} sx={{ mt: DIALOG_SPACING_X, justifyContent: 'center' }}>
        <>
          {teamParticipantAssignments.map((tpa) => {
            return (
              <Grid key={tpa.team.id}>
                <Box mx={DIALOG_SPACING_X} mb={DIALOG_SPACING_X}>
                  <SingleTeamParticipantsAssignmentView
                    {...tpa}
                    allSelectableParticipants={allSelectableParticipants}
                    teamSizeOfRunningDinner={teamSize}
                    onAddToTeam={handleAddToTeam}
                    onRemoveFromTeam={handleRemoveFromTeam}
                  />
                </Box>
              </Grid>
            );
          })}
        </>
      </Grid>
      <Grid container justifyContent={'center'} sx={{ justifyContent: 'center' }}>
        <Grid>
          <Box mx={DIALOG_SPACING_X} mt={DIALOG_SPACING_X}>
            <PrimarySuccessButtonAsync onClick={handleAssignToExistingTeams} size={'large'} sx={{ width: '100%' }} data-testid={'waitinglist-assign-participants-teams-action'}>
              {t('admin:waitinglist_assign_participants_teams')}!
            </PrimarySuccessButtonAsync>
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}

function NotifyTeamsAboutChangesView({ runningDinner, affectedTeams, dinnerRouteMessagesAlreadySent, onSave }: TeamNotificationModel & SaveCallback & BaseRunningDinnerProps) {
  const { t } = useTranslation(['admin', 'common']);
  const { generateTeamMessagesPath } = useAdminNavigation();
  const { getTeamNameMembers } = useTeamNameMembers();

  const { adminId } = runningDinner;

  function handleSendNotifications(openMessagesView: boolean) {
    if (openMessagesView) {
      window.open(generateTeamMessagesPath(adminId, MessageSubType.TEAMS_MODIFIED_WAITINGLIST, affectedTeams), '_blank');
    }
    // Dummy object for indicating that notification view shall not be shown again:
    onSave({ affectedTeams: [], teamMessagesAlreadySent: false, dinnerRouteMessagesAlreadySent: false });
  }

  return (
    <>
      <Grid container justifyContent={'center'} sx={{ px: DIALOG_SPACING_X, mt: DIALOG_SPACING_X, justifyContent: 'center' }}>
        <Grid>
          <Subtitle>{t('admin:team_notify_cancellation')}</Subtitle>
          <Paragraph>{t('admin:waitinglist_notification_teams_info')}</Paragraph>
          <ul>
            {affectedTeams.map((team) => (
              <li key={team.id} data-testid={'waitinglist_notification_team'}>
                {getTeamNameMembers(team)}
              </li>
            ))}
          </ul>
        </Grid>
      </Grid>
      {dinnerRouteMessagesAlreadySent && (
        <Grid container justifyContent={'center'} sx={{ px: DIALOG_SPACING_X, mt: DIALOG_SPACING_X, justifyContent: 'center' }}>
          <Grid>
            <Alert severity={'warning'} data-testid={'waitinglist_notification_dinnerroute_hint'}>
              <AlertTitle>{t('common:attention')}</AlertTitle>
              <Trans i18nKey="admin:waitinglist_notification_dinnerroutes_sent" />
            </Alert>
          </Grid>
        </Grid>
      )}
      <Grid container justifyContent={'center'} sx={{ px: DIALOG_SPACING_X, mt: DIALOG_SPACING_X, justifyContent: 'center' }}>
        <Grid>
          <PrimarySuccessButtonAsync
            onClick={() => handleSendNotifications(true)}
            size={'large'}
            sx={{ width: '100%' }}
            data-testid={'waitinglist_notification_teams_open_messages_action'}
          >
            {t('admin:waitinglist_notification_teams_sendmessages')}
          </PrimarySuccessButtonAsync>
          <Button
            onClick={() => handleSendNotifications(false)}
            sx={{ mt: DIALOG_SPACING_X, width: '100%' }}
            color={'primary'}
            variant={'outlined'}
            data-testid={'waitinglist_notification_teams_continue_without_messages_action'}
          >
            {t('admin:waitinglist_notification_teams_continue_without_messages')}
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

function SingleTeamParticipantsAssignmentView(props: SingleTeamParticipantsAssignmentProps & TeamParticipantsAssignment) {
  const { team, selectedParticipants, allSelectableParticipants, onAddToTeam, onRemoveFromTeam, teamSizeOfRunningDinner } = props;
  const { t } = useTranslation('admin');

  const selectableParticipantControls = allSelectableParticipants.map((participant) => (
    <Box key={participant.id}>
      <SelectableEntity
        entity={participant}
        data-testid={'waitinglist-participant-for-assignment'}
        onSelectionChange={(participant: SelectableParticipant, selected: boolean) => selected && onAddToTeam(team, participant)}
      />
    </Box>
  ));

  const selectedParticipantControls = selectedParticipants.map((participant) => (
    <Box key={participant.id}>
      <SelectableEntity entity={participant} onSelectionChange={(participant: SelectableParticipant, selected: boolean) => !selected && onRemoveFromTeam(team, participant)} />
    </Box>
  ));

  function renderTeamMembers() {
    const cancelledTeamMembers = calculateCancelledTeamMembersNumArr(team, selectedParticipants.length, teamSizeOfRunningDinner);
    const teamMemberNodes = team.teamMembers.map((member) => (
      <Paragraph key={member.id}>
        <Fullname {...member} />
      </Paragraph>
    ));
    const cancelledTeamMemberNodes = cancelledTeamMembers.map((num) => (
      <Paragraph key={num}>
        <CancelledTeamMember />
      </Paragraph>
    ));
    return (
      <>
        {teamMemberNodes}
        {selectedParticipantControls}
        {cancelledTeamMemberNodes}
      </>
    );
  }

  return (
    <div data-testid={'waitinglist-team-for-assignment'}>
      <Paper elevation={3} sx={{ p: DIALOG_SPACING_X }}>
        <Subtitle>
          <TeamNr {...team} />
        </Subtitle>
        {renderTeamMembers()}
      </Paper>
      <Box my={2}>
        <small>{t('admin:waitinglist_assign_participants_teams_select_hint')}</small>
      </Box>
      {selectableParticipantControls}
    </div>
  );
}

function RegenerateTeamsWithAssignableParticipantsView(props: WaitingListInfo & BaseRunningDinnerProps & SaveCallback) {
  const { numMissingParticipantsForFullTeamArrangement, participtantsForTeamArrangement, remainingParticipants, runningDinner, onSave } = props;

  const { showWarning, showSuccess } = useCustomSnackbar();
  const { t } = useTranslation(['admin', 'common']);

  const { getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin',
    },
  });
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  const numRemainingParticipants = remainingParticipants.length;
  const numParticipantsAssignable = participtantsForTeamArrangement.length;

  const [participantList, setParticipantList] = useState<SelectableParticipant[]>([]);

  async function handleGenerateNewTeams() {
    const participantsForTeamsGeneration = participantList.filter((p) => p.selected);
    try {
      const result = await generateNewTeamsFromWaitingListAsync(runningDinner.adminId, participantsForTeamsGeneration);
      showSuccess(t('admin:waitinglist_generate_teams_success'));
      onSave(result);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError, {
        showGenericMesssageOnValidationError: false,
        showAllValidationErrorMessages: true,
      });
    }
  }

  function handleParticipantSelectionChange(participant: SelectableParticipant, selected: boolean) {
    if (getNumSelectedParticipantsParticipantsInState() >= numParticipantsAssignable && selected) {
      showWarning(t('admin:waitinglist_generate_teams_selected_too_much', { numParticipants: numParticipantsAssignable }));
      return;
    }
    setParticipantList((prevState) => {
      const prevModelState = cloneDeep(prevState);
      const participantToModify = findEntityById(prevModelState, participant.id);
      participantToModify.selected = selected;
      return prevModelState;
    });
  }

  function getNumSelectedParticipantsParticipantsInState() {
    const tmp = participantList.filter((p) => p.selected);
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

  const participantsAssignableControls = participantList.map((participant) => (
    <Box key={participant.id}>
      <SelectableEntity entity={participant} onSelectionChange={handleParticipantSelectionChange} data-testid={'waitinglist-participant-for-teams-generation'} />
    </Box>
  ));

  return (
    <div data-testid={'waitinglist-teams-generation-view'}>
      <Grid container justifyContent={'center'} sx={{ px: DIALOG_SPACING_X, mt: DIALOG_SPACING_X, justifyContent: 'center' }}>
        <Grid sx={{ px: DIALOG_SPACING_X }}>
          <Subtitle>
            <Trans i18nKey={'admin:waitinglist_generate_teams_num_participants'} values={{ numParticipants: numParticipantsAssignable }} />
          </Subtitle>
          {numRemainingParticipants > 0 && (
            <Paragraph data-testid={'waitinglist-teams-generation-view-remaining-participants-hint'}>
              <Trans i18nKey={'admin:waitinglist_generate_teams_num_participants_remaining'} values={{ numRemainingParticipants }} />
              <Trans i18nKey={'admin:waitinglist_generate_teams_num_participants_missing'} values={{ numMissingParticipantsForFullTeamArrangement }} />
            </Paragraph>
          )}
        </Grid>
      </Grid>
      <Grid container justifyContent={'center'} sx={{ mt: DIALOG_SPACING_X, justifyContent: 'center' }}>
        <Grid sx={{ px: DIALOG_SPACING_X, mb: DIALOG_SPACING_X }}>
          <Paper elevation={3} sx={{ p: DIALOG_SPACING_X }}>
            {participantsAssignableControls}
          </Paper>
          <Box my={2}>
            <small>{t('admin:waitinglist_generate_teams_select_hint')}</small>
          </Box>
        </Grid>
      </Grid>
      <Grid container justifyContent={'center'} sx={{ justifyContent: 'center' }}>
        <Grid sx={{ mt: DIALOG_SPACING_X, px: DIALOG_SPACING_X }}>
          <PrimarySuccessButtonAsync onClick={handleGenerateNewTeams} size={'large'} sx={{ width: '100%' }} data-testid={'waitinglist-teams-generation-action'}>
            {t('admin:waitinglist_generate_teams')}
          </PrimarySuccessButtonAsync>
        </Grid>
      </Grid>
    </div>
  );
}

function NoSimpleActionView({ numMissingParticipantsForFullTeamArrangement, remainingParticipants }: WaitingListInfo) {
  const { t } = useTranslation(['admin', 'common']);

  const numRemainingParticipants = remainingParticipants.length;

  return (
    <Grid container justifyContent={'center'} data-testid={'waitinglist-distribute-to-teams-view'}>
      <Grid>
        <Box m={DIALOG_SPACING_X}>
          <Paragraph>
            <Trans i18nKey={'admin:waitinglist_no_simple_action_missing_participants_info'} values={{ numRemainingParticipants, numMissingParticipantsForFullTeamArrangement }} />
          </Paragraph>
          <Paragraph i18n={'admin:waitinglist_no_simple_action_distribution_options'} />
          <ul>
            <li>
              <Trans i18nKey={'admin:waitinglist_no_simple_action_distribution_option_1'} />
            </li>
            <li>
              <Trans i18nKey={'admin:waitinglist_no_simple_action_distribution_option_2'} values={{ numMissingParticipantsForFullTeamArrangement }} />
            </li>
          </ul>
          <Paragraph>
            <strong>{t('common:note')}</strong>: <Trans i18nKey={'admin:waitinglist_no_simple_action_distribution_info'} />
          </Paragraph>
        </Box>
      </Grid>
    </Grid>
  );
}

function TeamsNotGeneratedView() {
  const { t } = useTranslation(['admin', 'common']);

  return (
    <Grid container justifyContent={'center'} data-testid={'waitinglist-teams-not-generated-view'}>
      <Grid>
        <Box m={DIALOG_SPACING_X}>
          <Paragraph>
            <Trans i18nKey={'admin:waitinglist_teams_not_generated'} />
            <br />
            <Trans i18nKey={'admin:waitinglist_teams_not_generated_options'} />
          </Paragraph>
          <ul>
            <li>
              <Trans i18nKey={'admin:waitinglist_teams_not_generated_option_1'} />
            </li>
            <li>
              <Trans i18nKey={'admin:waitinglist_teams_not_generated_option_2'} />
            </li>
            <li>
              <strong>{t('common:preview')}</strong>: <Trans i18nKey={'admin:waitinglist_teams_not_generated_option_3'} />
            </li>
          </ul>
          <Paragraph>
            <strong>{t('common:note')}</strong>: <Trans i18nKey={'admin:waitinglist_teams_not_generated_hint'} />
          </Paragraph>
        </Box>
      </Grid>
    </Grid>
  );
}

import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Box, Button, Divider, Grid, Paper } from '@mui/material';
import {
  assertDefined,
  BaseAdminIdProps,
  CallbackHandler,
  CONSTANTS,
  findEntityById,
  Fullname,
  generateCancelledTeamMembersAsNumberArray,
  getFullname,
  getRunningDinnerMandatorySelector,
  hasEnoughSeats,
  isSameEntity,
  Meal,
  MessageSubType,
  NoopFunction,
  Participant,
  RunningDinnerSessionData,
  Team,
  TeamArrangementList,
  TeamNr,
  Time,
  useAdminSelector,
  useDisclosure,
  useFindTeamMeetingPlan,
  ValueTranslate,
} from '@runningdinner/shared';
import { concat } from 'lodash-es';
import { useTranslation } from 'react-i18next';

import ContextMenuIcon from '../../common/contextmenu/ContextMenuIcon';
import LinkAction from '../../common/theme/LinkAction';
import Paragraph from '../../common/theme/typography/Paragraph';
import { Span, Subtitle } from '../../common/theme/typography/Tags';
import { useAdminNavigation } from '../AdminNavigationHook';
import { TeamCancelDialog } from './cancellation/TeamCancelDialog';
import { TeamMemberCancelDialog, TeamMemberCancelDialogResult } from './cancellation/TeamMemberCancelDialog';
import { CancelledTeamMember } from './CancelledTeamMember';
import { SwapMealsDialog } from './SwapMealsDialog';
import { TeamPartnerWishIcon } from './TeamPartnerWishIcon';
import TeamSchedule from './TeamSchedule';

export interface TeamDetailsProps {
  team: Team;
  teamMemberIdToCancel: string | null;
  onOpenChangeTeamHostDialog: (team: Team) => unknown;
  onUpdateTeamState: (team: Team) => unknown;
  onMealsSwapSuccess: () => unknown;
}

export default function TeamDetails({ team, teamMemberIdToCancel, onOpenChangeTeamHostDialog, onMealsSwapSuccess, onUpdateTeamState }: TeamDetailsProps) {
  const { t } = useTranslation('common');
  const runningDinner = useAdminSelector(getRunningDinnerMandatorySelector);
  const { navigateToTeamMessages } = useAdminNavigation();

  const { adminId, sessionData } = runningDinner;
  const { teamMembers, meal, id } = team;

  const isCancelled = team.status === CONSTANTS.TEAM_STATUS.CANCELLED;
  const isReplaced = team.status === CONSTANTS.TEAM_STATUS.REPLACED;

  const passedTeamMemberToCancel = findEntityById(teamMembers, teamMemberIdToCancel);

  const { isOpen: isTeamCancelDialogOpen, close: closeTeamCancelDialog, open: openTeamCancelDialog } = useDisclosure(false);

  const { isOpen: isSwapMealsDialogOpen, close: closeSwapMealsDialog, open: openSwapMealsDialog } = useDisclosure(false);

  const findTeamMeetingPlanQuery = useFindTeamMeetingPlan(adminId, id || '');

  let teamMemberNodes = teamMembers.map((participant) => (
    <TeamMember
      key={participant.id}
      adminId={adminId}
      teamMember={participant}
      team={team}
      passedTeamMemberToCancel={passedTeamMemberToCancel}
      onOpenTeamCancelDialog={openTeamCancelDialog}
      onUpdateTeamState={onUpdateTeamState}
    />
  ));
  const cancelledTeamMembers = generateCancelledTeamMembersAsNumberArray(team, runningDinner.options.teamSize);
  const cancelledTeamMemberNodes = cancelledTeamMembers.map((cancelledTeamMember) => (
    <TeamMember key={cancelledTeamMember} adminId={adminId} team={team} onOpenTeamCancelDialog={NoopFunction} onUpdateTeamState={NoopFunction} />
  ));
  teamMemberNodes = teamMemberNodes.concat(cancelledTeamMemberNodes);

  function handleOpenSingleTeamMessage() {
    navigateToTeamMessages(adminId, MessageSubType.TEAM_SINGLE, [team]);
  }

  function handleCloseTeamCancelDialog(closeResult?: Team) {
    closeTeamCancelDialog();
    if (closeResult && closeResult.teamNumber) {
      onUpdateTeamState(closeResult); // closeResult === the updated team
    }
  }

  function handleOpenSwapMealsDialog() {
    openSwapMealsDialog();
  }

  function handleCloseSwapMealsDialog(updatedTeams?: TeamArrangementList) {
    closeSwapMealsDialog();
    if (updatedTeams) {
      onMealsSwapSuccess();
    }
  }

  function handleNotifyAffectedTeamsCancellation() {
    const teamMeetingPlan = findTeamMeetingPlanQuery.data;
    assertDefined(teamMeetingPlan);
    const affectedTeams = concat(teamMeetingPlan.guestTeams, teamMeetingPlan.hostTeams);
    navigateToTeamMessages(adminId, MessageSubType.TEAM_CANCELLATION, affectedTeams);
  }

  let actionMenuItems = [
    { label: t('admin:team_message'), onClick: handleOpenSingleTeamMessage },
    { label: `${t('admin:meals_swap')}...`, onClick: handleOpenSwapMealsDialog },
    { label: t('admin:team_cancel'), onClick: openTeamCancelDialog },
  ];
  if (isCancelled) {
    actionMenuItems = [{ label: t('admin:team_notify_cancellation'), onClick: handleNotifyAffectedTeamsCancellation }];
  }

  return (
    <Paper elevation={3}>
      <Box p={2}>
        <Grid container>
          <Grid size={11}>
            <Subtitle>
              <TeamNr {...team} />
            </Subtitle>
            <MealAtTime {...meal} />
          </Grid>
          <Grid size={1}>
            <ContextMenuIcon entries={actionMenuItems} dataTestId={'team-details-context-menu-icon'} />
          </Grid>
          {isReplaced && (
            <Grid size={12}>
              <Box mt={1}>
                <cite>
                  <Span i18n="admin:team_replaced_text" />
                </cite>
              </Box>
            </Grid>
          )}

          <TeamPartnerWishIcon team={team} showLabelAsTooltip={false} mt={1} />
        </Grid>

        {isCancelled ? (
          <Box mt={2}>
            <CancelledTeamMember />
          </Box>
        ) : (
          <Box mt={2}>
            <Divider>
              <strong>{t('team_members')}</strong>
            </Divider>
            {teamMemberNodes}
            <TeamHostInfo sessionData={sessionData} team={team} onOpenChangeTeamHostDialog={onOpenChangeTeamHostDialog} />
          </Box>
        )}

        <Box mt={2}>
          <Divider>
            <strong>{t('admin:team_schedule')}</strong>
          </Divider>
          <Grid container>
            <Grid size={12}>
              <TeamSchedule
                isTeamMeetingPlanLoading={findTeamMeetingPlanQuery.isPending}
                teamMeetingPlanError={findTeamMeetingPlanQuery.error}
                teamMeetingPlanResult={findTeamMeetingPlanQuery.data}
                adminId={adminId}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
      {isTeamCancelDialogOpen && <TeamCancelDialog isOpen={isTeamCancelDialogOpen} onClose={handleCloseTeamCancelDialog} teamToCancel={team} runningDinner={runningDinner} />}
      {isSwapMealsDialogOpen && <SwapMealsDialog onClose={handleCloseSwapMealsDialog} srcTeam={team} adminId={runningDinner.adminId} />}
    </Paper>
  );
}

function MealAtTime({ label, time }: Meal) {
  const { t } = useTranslation('common');
  return (
    <Paragraph>
      {label} {t('at_time')} <Time date={time} />
    </Paragraph>
  );
}

interface TeamMemberProps extends BaseAdminIdProps {
  teamMember?: Participant;
  team: Team;
  passedTeamMemberToCancel?: Participant;
  onUpdateTeamState: (team: Team) => unknown;
  onOpenTeamCancelDialog: CallbackHandler;
}

function TeamMember({ teamMember, adminId, team, passedTeamMemberToCancel, onUpdateTeamState, onOpenTeamCancelDialog }: TeamMemberProps) {
  const { t } = useTranslation(['common', 'admin']);

  const {
    isOpen: isTeamMemberCancelDialogOpen,
    close: closeTeamMemberCancelDialog,
    open: openTeamMemberCancelDialog,
  } = useDisclosure(isSameEntity(passedTeamMemberToCancel, teamMember), passedTeamMemberToCancel);

  if (!teamMember) {
    return (
      <Grid container>
        <Grid size={12}>
          <CancelledTeamMember />
        </Grid>
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
      <Grid
        size={{
          xs: 6,
          sm: 4,
        }}
      >
        <Fullname {...teamMember} />
      </Grid>
      <Grid
        size={{
          xs: 2,
          sm: 2,
        }}
      >
        {numSeatsDisplay}
      </Grid>
      <Grid
        size={{
          xs: 3,
          sm: 2,
        }}
        sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}
      >
        <ValueTranslate value={gender} ns="common" prefix="gender" valueMapping={{ undefined: 'unknown' }} />
      </Grid>
      <Grid
        size={{
          xs: 4,
          sm: 4,
        }}
      >
        <Box justifyContent="flex-end">
          <Button color="secondary" onClick={() => openTeamMemberCancelDialog()}>
            {t('admin:participant_cancel')}
          </Button>
        </Box>
      </Grid>
      {isTeamMemberCancelDialogOpen && (
        <TeamMemberCancelDialog isOpen={isTeamMemberCancelDialogOpen} onClose={handleCloseTeamMemberCancelDialog} team={team} adminId={adminId} teamMemberToCancel={teamMember} />
      )}
    </Grid>
  );
}

interface TeamHostInfoProps {
  team: Team;
  onOpenChangeTeamHostDialog: (team: Team) => unknown;
  sessionData: RunningDinnerSessionData;
}

function TeamHostInfo({ team, sessionData, onOpenChangeTeamHostDialog }: TeamHostInfoProps) {
  const { t } = useTranslation('common');

  const { hostTeamMember } = team;
  const hostTeamMemberName = getFullname(hostTeamMember);

  return (
    <Box mt={1}>
      <Grid container spacing={1} alignContent={'center'}>
        <Grid>
          <Paragraph i18n="admin:teams_host" parameters={{ host: hostTeamMemberName }} html={true} />
        </Grid>
        <Grid>
          <LinkAction onClick={() => onOpenChangeTeamHostDialog(team)}>
            <Span>({t('change')})</Span>
          </LinkAction>
        </Grid>
      </Grid>
      <NoValidTeamHost team={team} numSeatsNeededForHost={sessionData.numSeatsNeededForHost} />
    </Box>
  );
}

interface NoValidTeamHostProps {
  team: Team;
  numSeatsNeededForHost: number;
}

function NoValidTeamHost({ team, numSeatsNeededForHost }: NoValidTeamHostProps) {
  if (hasEnoughSeats(team, numSeatsNeededForHost)) {
    return null;
  }

  return (
    <Grid container spacing={1} alignItems={'center'}>
      <Grid>
        <ErrorOutlineOutlinedIcon color={'secondary'} />
      </Grid>
      <Grid>
        <Span i18n={'admin:teams_no_valid_host'} color={'secondary'} />
      </Grid>
    </Grid>
  );
}

import {useParams} from "react-router-dom";
import {Box, Grid} from "@mui/material";
import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import TeamsNotExisting from "./TeamsNotExisting";
import TeamsList from "./TeamsList";
import {EmptyDetails} from "../common/EmptyDetails";
import TeamDetails from "./TeamDetails";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {ChangeTeamHostDialog} from "./ChangeTeamHostDialog";
import {PageTitle} from "../../common/theme/typography/Tags";
import {useQuery} from "../../common/hooks/QueryHook";
import {
  assertDefined,
  findEntityById,
  getFullname, getRunningDinnerMandatorySelector,
  HttpError,
  isArrayNotEmpty,
  isQuerySucceeded,
  swapTeamMembersAsync,
  Team,
  useAdminSelector, useBackendIssueHandler,
  useDisclosure,
  useFindTeams,
  useUpdateFindTeamsQueryData
} from "@runningdinner/shared";
import {TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM, useAdminNavigation} from "../AdminNavigationHook";
import { useCustomSnackbar } from "../../common/theme/CustomSnackbarHook";
import DropdownButton from "../../common/theme/dropdown/DropdownButton";
import DropdownButtonItem from "../../common/theme/dropdown/DropdownButtonItem";
import {BackToListButton, useMasterDetailView} from "../../common/hooks/MasterDetailViewHook";
import { TeamArrangementActionsButton } from "./TeamArrangementActionsButton";
import { useNotificationHttpError } from "../../common/NotificationHttpErrorHook";
import {BrowserTitle} from "../../common/mainnavigation/BrowserTitle";
import { useIsBigTabletDevice } from "../../common/theme/CustomMediaQueryHook";
import { FetchProgressBar } from "../../common/FetchProgressBar";

const TeamsContainer = () => {

  const query = useQuery();

  const runningDinner = useAdminSelector(getRunningDinnerMandatorySelector);

  const params = useParams<Record<string, string>>();
  const teamId = params.teamId;
  const teamMemberIdToCancel = query.get(TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM);

  const findTeamsQuery = useFindTeams(runningDinner.adminId);
  if (!isQuerySucceeded(findTeamsQuery)) {
    return <FetchProgressBar {...findTeamsQuery} />;
  }

  const teams = findTeamsQuery.data || [];

  return <Teams teamId={teamId}
                teamMemberIdToCancel={teamMemberIdToCancel}
                incomingTeams={teams}
                refetch={findTeamsQuery.refetch} />;
};

interface TeamsProps {
  incomingTeams: Team[];
  teamId?: string;
  teamMemberIdToCancel: string | null;
  refetch: () => unknown;
}

function Teams({incomingTeams, teamId, teamMemberIdToCancel, refetch}: TeamsProps) {

  const runningDinner = useAdminSelector(getRunningDinnerMandatorySelector);

  const { adminId } = runningDinner;

  const {exchangeTeams} = useUpdateFindTeamsQueryData(adminId);

  const [selectedTeam, setSelectedTeam] = useState<Team>();

  const {isOpen: isChangeTeamHostDialogOpen,
         close: closeChangeTeamHostDialog,
         open: openChangeTeamHostDialog,
         getIsOpenData: getTeamForChangeTeamHostDialog} = useDisclosure();

  const {navigateToTeam} = useAdminNavigation();
  const {t} = useTranslation('admin');

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['admin', 'common']
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const {showSuccess} = useCustomSnackbar();

  const {showBackToListViewButton, setShowDetailsView, showListView, showDetailsView} = useMasterDetailView();

  const isBigTablet = useIsBigTabletDevice();

  useEffect(() => {
    if (teamId) {
      const foundTeam = findEntityById(incomingTeams, teamId);
      if (foundTeam && foundTeam.id !== selectedTeam?.id) {
        openTeamDetails(foundTeam);
      }
    }
    // eslint-disable-next-line
  }, [teamId, incomingTeams, selectedTeam]);

  const teamsExisting = isArrayNotEmpty(incomingTeams);

  function handleTeamClick(team: Team) {
    navigateToTeam(adminId, team.id!);
  }

  function openTeamDetails(team: Team) {
    setSelectedTeam(team);
    setShowDetailsView(true);
    window.scrollTo(0, 0);
  }

  function setNoSelectedTeam() {
    setShowDetailsView(false);
    setSelectedTeam(undefined);
  }

  function handleMealsSwapped() {
    setNoSelectedTeam();
    showSuccess(t("admin:meals_swap_success"));
    refetch();
  }

  const handleTeamMemberSwap = async(srcParticipantId: string, destParticipantId: string) => {

    let teamArrangementListResult;
    try {
      teamArrangementListResult = await swapTeamMembersAsync(adminId, srcParticipantId, destParticipantId);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError, { autoHideDuration: 8000 });
      return;
    }

    const updatedTeams = exchangeTeams(teamArrangementListResult.teams);

    if (selectedTeam) {
      let selectedTeamWhichIsAffected = findEntityById(teamArrangementListResult.teams, selectedTeam.id);
      if (selectedTeamWhichIsAffected) {
        selectedTeamWhichIsAffected = findEntityById(updatedTeams, selectedTeam.id); // Use the team entity which will be put in our state (it may not be there now)
        openTeamDetails(selectedTeamWhichIsAffected);
      }
    }

    const allParticipants = teamArrangementListResult.teams.flatMap((t: Team) => t.teamMembers);
    const srcTeamMember = findEntityById(allParticipants, srcParticipantId);
    const destTeamMember = findEntityById(allParticipants, destParticipantId);
    const successNotfication = t('team_swap_success_text', { fullnameSrc: getFullname(srcTeamMember), fullnameDest: getFullname(destTeamMember) });
    showSuccess(successNotfication);
  };

  const updateTeamStateInList = (team: Team) => {
    exchangeTeams([team]);
    handleTeamClick(team);
    openTeamDetails(team)
  };

  const handleOpenChangeTeamHostDialog = (team: Team) => {
    openChangeTeamHostDialog(team);
  };

  if (!teamsExisting) {
    return (
        <Box>
          <TeamsTitle hasTeams={false}/>
          <TeamsNotExisting runningDinner={runningDinner} />
        </Box>
    );
  }

  return (
      <DndProvider backend={HTML5Backend}>
        <Box>
          { !showBackToListViewButton && <TeamsTitle hasTeams={true}/> }
          <Grid container spacing={2}>
            { showListView &&
                <>
                  <Grid item xs={12} md={isBigTablet ? 12 : 7} sx={{ textAlign: 'right' }}>
                    <SendTeamMessagsDropdown adminId={adminId} />
                  </Grid>
                  <Grid item xs={12} md={isBigTablet ? 12 :5 } sx={{ textAlign: 'right' }}>
                    <TeamArrangementActionsButton adminId={adminId} />
                  </Grid>
                  <Grid item xs={12} md={isBigTablet ? 12 : 7}>
                    <TeamsList teams={incomingTeams} onClick={handleTeamClick} onTeamMemberSwap={handleTeamMemberSwap}
                               onOpenChangeTeamHostDialog={handleOpenChangeTeamHostDialog} selectedTeam={selectedTeam} />
                  </Grid>
                </>
            }
            <Grid item xs={12} md={isBigTablet ? 12 : 5}>
              { showDetailsView && selectedTeam
                  ? <>
                      { showBackToListViewButton && <BackToListButton onBackToList={() => setShowDetailsView(false)} />}
                      <TeamDetails team={selectedTeam}
                                   onMealsSwapSuccess={handleMealsSwapped}
                                   onOpenChangeTeamHostDialog={handleOpenChangeTeamHostDialog}
                                   teamMemberIdToCancel={teamMemberIdToCancel}
                                   onUpdateTeamState={updateTeamStateInList} />
                    </>
                  : <EmptyDetails labelI18n='teams_no_selection' />
              }
            </Grid>
          </Grid>
        </Box>
        { isChangeTeamHostDialogOpen && <ChangeTeamHostDialog isOpen={isChangeTeamHostDialogOpen}
                                                              onClose={closeChangeTeamHostDialog}
                                                              team={getTeamForChangeTeamHostDialog()}
                                                              adminId={adminId}
                                                              onTeamHostChanged={updateTeamStateInList} /> }
      </DndProvider>
  );
}


interface TeamsTitleProps {
  hasTeams: boolean;
}

function TeamsTitle({hasTeams}: TeamsTitleProps) {

  const {t} = useTranslation(['admin']);
  return (
      <>
        <BrowserTitle titleI18nKey={"headline_teams"} namespaces={"admin"}/>
        <PageTitle>{t('headline_teams')}</PageTitle>
        { hasTeams && <p style={{ fontWeight: 100 }}>{t("admin:teams_drag_drop_hint")}</p> }
      </>
  );
}


interface SendMessagesDropdownProps {
  adminId: string;
}
function SendTeamMessagsDropdown({adminId}: SendMessagesDropdownProps) {

  const {t} = useTranslation('admin');
  const {navigateToTeamMessages, navigateToDinnerRouteMessages} = useAdminNavigation();

  return (
    <DropdownButton label={t('messages_send_general')}>
      <DropdownButtonItem onClick={() => navigateToTeamMessages(adminId)}>{t('messages_send_teams')}</DropdownButtonItem>
      <DropdownButtonItem onClick={() => navigateToDinnerRouteMessages(adminId)}>{t('messages_send_dinnerroutes')}</DropdownButtonItem>
    </DropdownButton>
  );
}

export default TeamsContainer;

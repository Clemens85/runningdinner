import {useParams} from "react-router-dom";
import {Box, Grid} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import TeamsNotExisting from "./TeamsNotExisting";
import {Helmet} from "react-helmet-async";
import TeamsList from "./TeamsList";
import {EmptyDetails} from "../common/EmptyDetails";
import TeamDetails from "./TeamDetails";
import {Fetch, RenderArg} from "../../common/Fetch";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {ChangeTeamHostDialog} from "./ChangeTeamHostDialog";
import {PageTitle} from "../../common/theme/typography/Tags";
import {useQuery} from "../../common/hooks/QueryHook";
import {
  createTeamArrangementsAsync,
  exchangeEntityInList,
  findEntityById,
  findTeamsAsync,
  getFullname,
  swapTeamMembersAsync,
  Team,
  useDisclosure
} from "@runningdinner/shared";
import {useAdminContext} from "../AdminContext";
import {TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM, useAdminNavigation} from "../AdminNavigationHook";
import { useCustomSnackbar } from "../../common/theme/CustomSnackbarHook";
import DropdownButton from "../../common/theme/dropdown/DropdownButton";
import DropdownButtonItem from "../../common/theme/dropdown/DropdownButtonItem";
import useCommonStyles from "../../common/theme/CommonStyles";
import {BackToListButton, useMasterDetailView} from "../../common/hooks/MasterDetailViewHook";

const TeamsContainer = () => {

  const query = useQuery();

  const {runningDinner} = useAdminContext();

  const params = useParams<Record<string, string>>();
  const teamId = params.teamId;
  const teamMemberIdToCancel = query.get(TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM);

  return <Fetch asyncFunction={findTeamsAsync}
                parameters={[runningDinner.adminId]}
                render={(resultObj: RenderArg<Team[]>) => <Teams teamId={teamId}
                                                                 teamMemberIdToCancel={teamMemberIdToCancel}
                                                                 incomingTeams={resultObj.result} />} />;
};

interface TeamsProps {
  incomingTeams: Team[];
  teamId?: string;
  teamMemberIdToCancel: string | null;
}

function Teams({incomingTeams, teamId, teamMemberIdToCancel}: TeamsProps) {

  const {runningDinner} = useAdminContext();

  const [teams, setTeams] = useState(incomingTeams);
  const [selectedTeam, setSelectedTeam] = useState<Team>();

  const {isOpen: isChangeTeamHostDialogOpen,
         close: closeChangeTeamHostDialog,
         open: openChangeTeamHostDialog,
         getIsOpenData: getTeamForChangeTeamHostDialog} = useDisclosure();

  const {navigateToTeam} = useAdminNavigation();
  const {t} = useTranslation('admin');

  const {showSuccess} = useCustomSnackbar();

  const commonClasses = useCommonStyles();

  const {showBackToListViewButton, setShowDetailsView, showListView, showDetailsView} = useMasterDetailView();

  useEffect(() => {
    if (teamId) {
      const foundTeam = findEntityById(teams, teamId);
      if (foundTeam && foundTeam.id !== selectedTeam?.id) {
        openTeamDetails(foundTeam);
      }
    }
    // eslint-disable-next-line
  }, [teamId, teams, selectedTeam]);

  const { adminId } = runningDinner;
  const teamsExisting = teams.length > 0;

  function handleTeamClick(team: Team) {
    navigateToTeam(adminId, team.id!);
  }

  function openTeamDetails(team: Team) {
    setSelectedTeam(team);
    setShowDetailsView(true);
  }

  const handleGenerateTeams = async () => {
    const teamGenerationResult = await createTeamArrangementsAsync(adminId);
    setTeams(teamGenerationResult.teams);
  };

  const handleTeamMemberSwap = async(srcParticipantId: string, destParticipantId: string) => {
    const teamArrangementListResult = await swapTeamMembersAsync(adminId, srcParticipantId, destParticipantId);

    let updatedTeams = teams;
    for (let i = 0; i < teamArrangementListResult.teams.length; i++) {
      const affectedTeam = teamArrangementListResult.teams[i];
      updatedTeams = exchangeEntityInList(updatedTeams, affectedTeam);
    }
    setTeams(updatedTeams);

    if (selectedTeam) {
      let selectedTeamWhichIsAffected = findEntityById(teamArrangementListResult.teams, selectedTeam.id);
      if (selectedTeamWhichIsAffected) {
        selectedTeamWhichIsAffected = findEntityById(updatedTeams, selectedTeam.id); // Use the team entity which will be put in our state (it may not be there now)
        openTeamDetails(selectedTeamWhichIsAffected);
      }
    }

    const allParticipants = teamArrangementListResult.teams
                                  .flatMap(t => t.teamMembers);
    const srcTeamMember = findEntityById(allParticipants, srcParticipantId);
    const destTeamMember = findEntityById(allParticipants, destParticipantId);
    const successNotfication = t('team_swap_success_text', { fullnameSrc: getFullname(srcTeamMember), fullnameDest: getFullname(destTeamMember) });
    showSuccess(successNotfication);
  };

  const updateTeamStateInList = (team: Team) => {
    const updatedTeamsList = exchangeEntityInList(teams, team);
    setTeams(updatedTeamsList);
    handleTeamClick(team);
    openTeamDetails(team)
  };

  const handleOpenChangeTeamHostDialog = (team: Team) => {
    openChangeTeamHostDialog(team);
  };

  if (!teamsExisting) {
    return (
        <Box>
          <TeamsTitle/>
          <TeamsNotExisting runningDinner={runningDinner} onGenerateTeams={handleGenerateTeams} />
        </Box>
    );
  }

  return (
      <DndProvider backend={HTML5Backend}>
        <Box>
          <TeamsTitle/>
          <Grid container spacing={2}>
            { showListView &&
                <>
                  <Grid item xs={12} md={7} className={commonClasses.textAlignRight}>
                    <SendTeamMessagsDropdown adminId={adminId} />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <TeamsList teams={teams} onClick={handleTeamClick} onTeamMemberSwap={handleTeamMemberSwap}
                               onOpenChangeTeamHostDialog={handleOpenChangeTeamHostDialog} selectedTeam={selectedTeam} />
                  </Grid>
                </>
            }
            <Grid item xs={12} md={5}>
              { showDetailsView && selectedTeam
                  ? <>
                      { showBackToListViewButton && <BackToListButton onBackToList={() => setShowDetailsView(false)} />}
                      <TeamDetails team={selectedTeam}
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

function TeamsTitle() {

  const {t} = useTranslation(['admin']);
  return (
      <>
        <Helmet><title>{t('headline_teams')}</title></Helmet>
        <PageTitle>{t('headline_teams')}</PageTitle>
      </>
  );
}


interface SendMessagesDropdownProps {
  adminId: string;
}
function SendTeamMessagsDropdown({adminId}: SendMessagesDropdownProps) {

  const {t} = useTranslation('admin');
  const {navigateToTeamMessages} = useAdminNavigation();

  return (
    <DropdownButton label={t('messages_send_general')}>
      <DropdownButtonItem onClick={() => navigateToTeamMessages(adminId)}>{t('messages_send_teams')}</DropdownButtonItem>
      <DropdownButtonItem onClick={() => navigateToTeamMessages(adminId)}>{t('messages_send_dinnerroutes')}</DropdownButtonItem>
    </DropdownButton>
  );
}

export default TeamsContainer;

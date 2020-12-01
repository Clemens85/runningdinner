import {useParams, useHistory} from "react-router-dom";
import {Box, Grid, useMediaQuery, useTheme} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import TeamService from "../../shared/admin/TeamService";
import TeamsNotExisting from "./TeamsNotExisting";
import {Helmet} from "react-helmet-async";
import TeamsList from "./TeamsList";
import {EmptyDetails} from "../common/EmptyDetails";
import TeamDetails from "./TeamDetails";
import Fetch from "../../common/Fetch";
import {DndProvider} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import {exchangeEntityInList, findEntityById} from "../../shared/Utils";
import {ChangeTeamHostDialog} from "./ChangeTeamHostDialog";
import {useDisclosure} from "shared/DisclosureHook";
import {PageTitle} from "common/theme/typography/Tags";
import {useQuery} from "common/hooks/QueryHook";
import {TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM} from "common/NavigationService";

const TeamsContainer = ({runningDinner}) => {

  const query = useQuery();

  const {adminId} = runningDinner;

  const params = useParams();
  const teamId = params.teamId;
  const teamMemberIdToCancel = query.get(TEAM_MEMBER_ID_TO_CANCEL_QUERY_PARAM);

  return <Fetch asyncFunction={TeamService.findTeamsAsync}
                parameters={[adminId]}
                render={resultObj => <Teams teamId={teamId} teamMemberIdToCancel={teamMemberIdToCancel}
                                         incomingTeams={resultObj.result.teams} runningDinner={runningDinner} />} />;
};


function Teams({runningDinner, incomingTeams, teamId, teamMemberIdToCancel}) {

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('md'));

  const [teams, setTeams] = useState(incomingTeams);
  const [showTeamDetails, setShowTeamDetails] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState();
  const {isOpen: isChangeTeamHostDialogOpen, close: closeChangeTeamHostDialog, open: openChangeTeamHostDialog, data: teamForChangeTeamHostDialog} = useDisclosure();

  const history = useHistory();

  useEffect(() => {
    if (teamId) {
      const foundTeam = findEntityById(teams, teamId);
      if (foundTeam && foundTeam.id !== selectedTeam?.id) {
        openTeamDetails(foundTeam);
      }
    }
  }, [teamId, teams, selectedTeam]);

  const { adminId } = runningDinner;
  const showTeamsList = !isSmallDevice || !showTeamDetails;
  const teamsExisting = teams.length > 0;

  function handleTeamClick(team) {
    history.push(`/admin/${adminId}/teams/${team.id}`);
  }

  function openTeamDetails(team) {
    setSelectedTeam(team);
    setShowTeamDetails(true);
  }

  const handleGenerateTeams = async () => {
    const teamGenerationResult = await TeamService.createTeamArrangementsAsync(adminId);
    setTeams(teamGenerationResult.teams);
  };

  const handleTeamMemberSwap = async(srcParticipantId, destParticipantId) => {
    const teamArrangementListResult = await TeamService.swapTeamMembersAsync(adminId, srcParticipantId, destParticipantId);

    let updatedTeams = teams;
    for (var i = 0; i < teamArrangementListResult.teams.length; i++) {
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
  };

  const updateTeamStateInList = (team) => {
    const updatedTeamsList = exchangeEntityInList(teams, team);
    setTeams(updatedTeamsList);
    handleTeamClick(team);
    openTeamDetails(team)
  };

  const handleOpenChangeTeamHostDialog = (team) => {
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
            { showTeamsList &&
                <Grid item xs={12} md={7}>
                  <TeamsList teams={teams} onClick={handleTeamClick} onTeamMemberSwap={handleTeamMemberSwap}
                             onOpenChangeTeamHostDialog={handleOpenChangeTeamHostDialog} selectedTeam={selectedTeam} />
                </Grid>
            }
            <Grid item xs={12} md={5}>
              { showTeamDetails
                  ? <TeamDetails team={selectedTeam}
                                 runningDinner={runningDinner}
                                 onOpenChangeTeamHostDialog={handleOpenChangeTeamHostDialog}
                                 teamMemberIdToCancel={teamMemberIdToCancel}
                                 onUpdateTeamState={updateTeamStateInList} />
                  : <EmptyDetails labelI18n='teams_no_selection' />
              }
            </Grid>
          </Grid>
        </Box>
        { teamForChangeTeamHostDialog && <ChangeTeamHostDialog isOpen={isChangeTeamHostDialogOpen}
                                                               onClose={closeChangeTeamHostDialog}
                                                               team={teamForChangeTeamHostDialog}
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
        <Box mb={2}><PageTitle>{t('headline_teams')}</PageTitle></Box>
      </>
  );
}

export default TeamsContainer;

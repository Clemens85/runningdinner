package org.runningdinner.dinnerroute.teamhostlocation;

import java.util.List;

import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamAccessor;
import org.runningdinner.participant.TeamService;
import org.springframework.stereotype.Service;

@Service
public class TeamHostLocationService {
	
	private final TeamService teamService;

	public TeamHostLocationService(TeamService teamService) {
		this.teamService = teamService;
	}

	public TeamHostLocationList findTeamHostLocations(String adminId) {

		List<Team> teamArrangements = teamService.findTeamArrangements(adminId, false);
    
    List<Team> clonedTeams = teamArrangements
    													.stream()
    													.map(team -> {
    														Team teamClone = team.createDetachedClone(false);
    														preserveDatabaseIds(teamClone, team);
    														return teamClone;
    													})
    													.toList();
    
    List<TeamHostLocation> result = clonedTeams.stream().map(t -> new TeamHostLocation(t)).toList();
    return newTeamHostLocationList(result);
	}
	
	public static TeamHostLocationList newTeamHostLocationList(List<TeamHostLocation> incomingTeamHostLocations) {
    List<TeamHostLocation> cancelledTeams = incomingTeamHostLocations.stream().filter(TeamHostLocation::isCancelled).toList();   
    List<TeamHostLocation> teamHostLocationsMissingGeocodes = incomingTeamHostLocations.stream().filter(thl -> !TeamHostLocation.isValid(thl) && !thl.isCancelled()).toList();
    List<TeamHostLocation> teamHostLocationsValid = incomingTeamHostLocations.stream().filter(thl -> TeamHostLocation.isValid(thl) && !thl.isCancelled()).toList(); 
    return new TeamHostLocationList(teamHostLocationsValid, teamHostLocationsMissingGeocodes, cancelledTeams);
	}
	
	 // We need IDs (as teams would be in database) later on for dinner route building
	static void preserveDatabaseIds(Team detachedTeamClone, Team originalTeam) {
		List<Participant> originalParticipants = originalTeam.getTeamMembersOrdered();
		TeamAccessor.newAccessor(detachedTeamClone)
			.setId(originalTeam.getId())
			.setMealClassId(originalTeam.getMealClass().getId())
			.setTeamMemberIds(originalParticipants);
	}
}

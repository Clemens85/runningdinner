package org.runningdinner.dinnerroute.optimization;

import java.util.List;

import org.runningdinner.dinnerroute.DinnerRouteCalculator;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
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

	public TeamHostLocationList mapToTeamHostLocations(String adminId, GeocodedAddressEntityListTO addressEntityList) {
    List<Team> teamArrangements = teamService.findTeamArrangements(adminId, false);
    
    List<TeamHostLocation> allTeamHostLocations = addressEntityList
                                                  	.getAddressEntities()
                                                  	.stream()
                                                  	.map(addressEntity -> {
                                                  		Team foundTeam = DinnerRouteCalculator.findTeamForTeamNumber(addressEntity.getId(), teamArrangements);
                                                  		Team teamClone = foundTeam.createDetachedClone(false);
                                                  		preserveDatabaseIds(teamClone, foundTeam);
                                                  		return new TeamHostLocation(teamClone, addressEntity);
                                                  	})
                                                  	.toList();
    
    return newTeamHostLocationList(allTeamHostLocations);
	}
	
	public static TeamHostLocationList newTeamHostLocationList(List<TeamHostLocation> incomingTeamHostLocations) {
    List<TeamHostLocation> cancelledTeams = incomingTeamHostLocations.stream().filter(TeamHostLocation::isCancelled).toList();   
    List<TeamHostLocation> teamHostLocationsMissingGeocodes = incomingTeamHostLocations.stream().filter(thl -> !TeamHostLocation.isValid(thl) && !thl.isCancelled()).toList();
    List<TeamHostLocation> teamHostLocationsValid = incomingTeamHostLocations.stream().filter(thl -> TeamHostLocation.isValid(thl) && !thl.isCancelled()).toList(); 
    return new TeamHostLocationList(teamHostLocationsValid, teamHostLocationsMissingGeocodes, cancelledTeams);
	}
	
	 // We need IDs (as teams would be in database) later on for dinner route building
	private static void preserveDatabaseIds(Team detachedTeamClone, Team originalTeam) {
		List<Participant> originalParticipants = originalTeam.getTeamMembersOrdered();
		TeamAccessor.newAccessor(detachedTeamClone)
			.setId(originalTeam.getId())
			.setMealClassId(originalTeam.getMealClass().getId())
			.setTeamMemberIds(originalParticipants);
	}
}

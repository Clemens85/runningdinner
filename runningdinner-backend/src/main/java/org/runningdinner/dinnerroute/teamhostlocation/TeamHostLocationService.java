package org.runningdinner.dinnerroute.teamhostlocation;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntity;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityIdType;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamAccessor;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.rest.TeamTO;
import org.springframework.stereotype.Service;

@Service
public class TeamHostLocationService {
	
	private final TeamService teamService;

	public TeamHostLocationService(TeamService teamService) {
		this.teamService = teamService;
	}

	public TeamHostLocationList mapToTeamHostLocations(String adminId, GeocodedAddressEntityListTO addressEntityList) {

    List<TeamHostLocation> result = new ArrayList<>();
    
		List<Team> teamArrangements = teamService.findTeamArrangements(adminId, false);
    
    List<Team> clonedTeams = teamArrangements
    													.stream()
    													.map(team -> {
    														Team teamClone = team.createDetachedClone(false);
    														preserveDatabaseIds(teamClone, team);
    														return teamClone;
    													})
    													.toList();
    
    List<GeocodedAddressEntity> addressEntities = addressEntityList.getAddressEntities();
    for (Team clonedTeam : clonedTeams) {
    	GeocodedAddressEntity addressEntity = findGeocodedAddressEntity(clonedTeam, addressEntities).orElse(null);
    	result.add(new TeamHostLocation(clonedTeam, addressEntity));
    }
    
    return newTeamHostLocationList(result);
	}
	
	public static TeamHostLocationList newTeamHostLocationList(List<TeamHostLocation> incomingTeamHostLocations) {
    List<TeamHostLocation> cancelledTeams = incomingTeamHostLocations.stream().filter(TeamHostLocation::isCancelled).toList();   
    List<TeamHostLocation> teamHostLocationsMissingGeocodes = incomingTeamHostLocations.stream().filter(thl -> !TeamHostLocation.isValid(thl) && !thl.isCancelled()).toList();
    List<TeamHostLocation> teamHostLocationsValid = incomingTeamHostLocations.stream().filter(thl -> TeamHostLocation.isValid(thl) && !thl.isCancelled()).toList(); 
    return new TeamHostLocationList(teamHostLocationsValid, teamHostLocationsMissingGeocodes, cancelledTeams);
	}
	
  public static GeocodedAddressEntity findGeocodedAddressEntityMandatory(TeamTO team, List<? extends GeocodedAddressEntity> addressEntities) {
    return addressEntities
            .stream()
            .filter(a -> isEqualTeam(team, a))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Could not find team " + team + " within addressEntities " + addressEntities));
  }
  
  public static Optional<? extends GeocodedAddressEntity> findGeocodedAddressEntity(Team team, List<? extends GeocodedAddressEntity> addressEntities) {
    return addressEntities
            .stream()
            .filter(a -> isEqualTeam(team, a))
            .findFirst();
  }

  private static boolean isEqualTeam(TeamTO team, GeocodedAddressEntity addressEntity) {
  	return (addressEntity.getIdType() == GeocodedAddressEntityIdType.TEAM_NR && StringUtils.equals(addressEntity.getId(), String.valueOf(team.getTeamNumber()))) ||
  				 (addressEntity.getIdType() == GeocodedAddressEntityIdType.TEAM_ID && StringUtils.equals(addressEntity.getId(), team.getId().toString())); 
  }
	
  private static boolean isEqualTeam(Team team, GeocodedAddressEntity addressEntity) {
  	return (addressEntity.getIdType() == GeocodedAddressEntityIdType.TEAM_NR && StringUtils.equals(addressEntity.getId(), String.valueOf(team.getTeamNumber()))) ||
  				 (addressEntity.getIdType() == GeocodedAddressEntityIdType.TEAM_ID && StringUtils.equals(addressEntity.getId(), team.getId().toString())); 
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

package org.runningdinner.dinnerroute.neighbours;


import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.core.util.LogSanitizer;
import org.runningdinner.dinnerroute.DinnerRouteCalculator;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.dinnerroute.distance.DistanceEntry;
import org.runningdinner.dinnerroute.distance.DistanceMatrix;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntity;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityIdType;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.rest.TeamTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TeamNeighbourClusterCalculationService {

  private static final Logger LOGGER = LoggerFactory.getLogger(TeamNeighbourClusterCalculationService.class);
  
	private final TeamService teamService;
	
  public TeamNeighbourClusterCalculationService(TeamService teamService) {
		this.teamService = teamService;
	}

	public List<TeamNeighbourCluster> calculateTeamNeighbourClusters(@ValidateAdminId String adminId, List<GeocodedAddressEntity> addressEntities, double rangeInMeters) {
    DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(addressEntities, rangeInMeters);
    List<Team> teams = findTeamsForEntries(adminId, distanceMatrix.getEntries().keySet(), addressEntities);
    return mapToTeamNeighbourClusters(distanceMatrix, teams, addressEntities);
  }

  public static List<TeamNeighbourCluster> mapToTeamNeighbourClusters(DistanceMatrix distanceMatrix, List<Team> teams, List<? extends GeocodedAddressEntity> addressEntities) {
    List<TeamNeighbourCluster> result = new ArrayList<>();
    for (var entry : distanceMatrix.getEntries().entrySet()) {
    	TeamTO srcTeam = new TeamTO(DinnerRouteCalculator.findTeamForTeamNumber(entry.getKey().srcId(), teams));
    	TeamTO destTeam = new TeamTO(DinnerRouteCalculator.findTeamForTeamNumber(entry.getKey().destId(), teams));

    	List<TeamTO> resultingTeams = new ArrayList<>(List.of(srcTeam, destTeam));
    	resultingTeams.sort((a, b) -> Integer.compare(a.getTeamNumber(), b.getTeamNumber()));
    	addMissingGeocodesIfNeeded(resultingTeams, addressEntities);
    	
    	Double distance = entry.getValue(); 
      result.add(new TeamNeighbourCluster(resultingTeams.get(0), resultingTeams.get(1), distance));
    }
    result.sort((a, b) -> Double.compare(b.distance(), a.distance()));
    return result;
  }
  

  private static void addMissingGeocodesIfNeeded(List<TeamTO> teams, List<? extends GeocodedAddressEntity> addressEntities) {
  	for (var team : teams) {
  		if (GeocodingResult.isValid(team.getHostTeamMember().getGeocodingResult())) {
  			continue;
  		}
  		GeocodedAddressEntity matchedAddressEntity = findGeocodedAddressEntity(team, addressEntities);
  		team.getHostTeamMember().setGeocodingResult(matchedAddressEntity);
  	}
	}

	private List<Team> findTeamsForEntries(String adminId, Set<DistanceEntry> distanceEntries, List<GeocodedAddressEntity> addressEntities) {

    if (CollectionUtils.isEmpty(distanceEntries) || CollectionUtils.isEmpty(addressEntities)) {
      return Collections.emptyList();
    }

    GeocodedAddressEntityIdType idType = addressEntities.get(0).getIdType();
    if (idType != GeocodedAddressEntityIdType.TEAM_NR) {
      LOGGER.error("Only TEAM_NR is supported as GeocodedAddressEntityIdType but got {}  in event {}",
                   idType, LogSanitizer.sanitize(adminId));
      return Collections.emptyList();
    }

    Set<Integer> teamNumbers = new HashSet<>();
    distanceEntries
      .forEach(entry -> {
        teamNumbers.add(DinnerRouteCalculator.parseIntSafe(entry.srcId()));
        teamNumbers.add(DinnerRouteCalculator.parseIntSafe(entry.destId()));
      });
    return teamService.findTeamsWithMembersOrderedByTeamNumbers(adminId, teamNumbers);
  }
	
  public static GeocodedAddressEntity findGeocodedAddressEntity(TeamTO team, List<? extends GeocodedAddressEntity> addressEntities) {
    return addressEntities
            .stream()
            .filter(a -> isEqualTeam(team, a))
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Could not find team " + team + " within addressEntities " + addressEntities));
  }

  private static boolean isEqualTeam(TeamTO team, GeocodedAddressEntity addressEntity) {
  	return (addressEntity.getIdType() == GeocodedAddressEntityIdType.TEAM_NR && StringUtils.equals(addressEntity.getId(), String.valueOf(team.getTeamNumber()))) ||
  				 (addressEntity.getIdType() == GeocodedAddressEntityIdType.TEAM_ID && StringUtils.equals(addressEntity.getId(), team.getId().toString())); 
  }
	
}
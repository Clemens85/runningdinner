package org.runningdinner.dinnerroute.distance;

import java.util.List;
import java.util.Objects;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.rest.TeamTO;

public record DistanceEntry(String srcId, String destId) {
  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }

    DistanceEntry that = (DistanceEntry) o;
    return (Objects.equals(srcId, that.srcId) && Objects.equals(destId, that.destId)) ||
           (Objects.equals(srcId, that.destId) && Objects.equals(destId, that.srcId));
  }

  @Override
  public int hashCode() {
    String hashCodeString = srcId + destId;
    if (srcId.compareTo(destId) > 0) {
      hashCodeString = destId + srcId;
    }
    return Objects.hash(hashCodeString);
  }
  
  public List<Team> mapSrcAndDestToTeams(List<Team> teams) {
  	Team srcTeam = findTeamByIdOrTeamNumber(teams, srcId);  	
  	Team destTeam = findTeamByIdOrTeamNumber(teams, destId);
  	return List.of(srcTeam, destTeam);
  }
  
  public List<TeamTO> mapSrcAndDestToTeamTOs(List<Team> teams) {
  	List<Team> mappedTeams = mapSrcAndDestToTeams(teams);
  	return TeamTO.convertTeamList(mappedTeams);
  }
  
  private static Team findTeamByIdOrTeamNumber(List<Team> teams, String teamIdOrTeamNumber) {
  	return teams
        		.stream()
      			.filter(t -> isEqual(t, teamIdOrTeamNumber))
      			.findFirst()
      			.orElseThrow(() -> new IllegalStateException("Could not find team for " + teamIdOrTeamNumber + " within teams " + teams));
  }
  
  private static boolean isEqual(Team team, String teamIdOrTeamNumber) {
  	return StringUtils.equals(teamIdOrTeamNumber, String.valueOf(team.getTeamNumber())) ||
				 	 StringUtils.equals(teamIdOrTeamNumber, team.getId().toString()); 
  }
}

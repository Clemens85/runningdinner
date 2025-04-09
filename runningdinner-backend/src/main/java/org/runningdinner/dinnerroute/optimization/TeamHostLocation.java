package org.runningdinner.dinnerroute.optimization;

import java.util.List;

import org.runningdinner.core.MealClass;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntity;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityIdType;
import org.runningdinner.participant.Team;

/**
 * Represents a team host in a dinner route with a geocoded address.
 */
public class TeamHostLocation extends GeocodedAddressEntity {

	private final Team team;

	public TeamHostLocation(Team team, GeocodedAddressEntity geocodedAddress) {
		this.team = team;
		this.setId(String.valueOf(team.getTeamNumber()));
		this.setIdType(GeocodedAddressEntityIdType.TEAM_NR);
		this.copyGeocodeData(geocodedAddress);
	}

	public int getTeamNumber() {
		return team.getTeamNumber();
	}

	public MealClass getMeal() {
		return team.getMealClass();
	}

	public Team getTeam() {
		return team;
	}
	
	public static List<Team> mapToTeams(List<TeamHostLocation> teamHostLocations) {
		return teamHostLocations
						.stream()
						.map(TeamHostLocation::getTeam)
						.toList();
	}
	
}

package org.runningdinner.dinnerroute.optimization;

import java.util.List;
import java.util.Objects;

import org.runningdinner.core.MealClass;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntity;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityIdType;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamStatus;

/**
 * Represents a team host in a dinner route with a geocoded address.
 */
public class TeamHostLocation extends GeocodedAddressEntity {

	private final Team team;

	public TeamHostLocation(Team team, GeocodedAddressEntity geocodedAddress) {
		this.team = team;
		this.setId(String.valueOf(team.getTeamNumber()));
		this.setIdType(GeocodedAddressEntityIdType.TEAM_NR);
		if (geocodedAddress != null) {
			this.copyGeocodeData(geocodedAddress);
		}
	}

	public TeamHostLocation copyWithHostLocationDataFrom(TeamHostLocation newHostLocationData) {
		Team teamClone = this.team.createDetachedClone(false); // TODO We need to copy WITH guest/host data!!!
		TeamHostLocation result = new TeamHostLocation(teamClone, newHostLocationData);
		result.getTeam().removeAllTeamMembers();
		result.getTeam().setTeamMembers(newHostLocationData.getTeam().getTeamMembers());
		return result;
	}
	
	public boolean hasEqualHostLocationData(TeamHostLocation other) {
		List<Participant> thisTeamMembers = this.getTeam().getTeamMembersOrdered();
		List<Participant> otherTeamMembers = other.getTeam().getTeamMembersOrdered();
		return Objects.equals(thisTeamMembers, otherTeamMembers);
	}

	public static TeamHostLocation findLocationWithEqualTeamMembers(List<TeamHostLocation> teamHostLocations, List<Participant> hostingTeamMembers) {
		return teamHostLocations
						.stream()
						.filter(thl -> Objects.equals(thl.getTeam().getTeamMembersOrdered(), hostingTeamMembers))
						.findFirst()
						.orElseThrow(() -> new IllegalStateException("Could not find host-location with members " + hostingTeamMembers + " in " + teamHostLocations));
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
	
	public boolean isCancelled() {
		return team.getStatus() == TeamStatus.CANCELLED;
	}
	
	public static List<Team> mapToTeams(List<TeamHostLocation> teamHostLocations) {
		return teamHostLocations
						.stream()
						.map(TeamHostLocation::getTeam)
						.toList();
	}

}

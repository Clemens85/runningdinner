package org.runningdinner.dinnerroute.teamhostlocation;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

import org.runningdinner.core.MealClass;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.HasGeocodingResult;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamStatus;

/**
 * Represents a team host in a dinner route with a geocoded address.
 */
public class TeamHostLocation extends GeocodingResult implements HasGeocodingResult {

	private final Team team;

	public TeamHostLocation(Team team) {
		this.team = team;
		if (team.getGeocodingResult() != null) {
			this.copyGeocodeData(team.getGeocodingResult());
		}
	}

	public TeamHostLocation copyWithHostLocationDataFrom(TeamHostLocation newHostLocationData) {
		Team teamClone = cloneTeamWithHostAndGuestTeams();
		TeamHostLocation result = new TeamHostLocation(teamClone);
		result.getTeam().removeAllTeamMembers();
		result.getTeam().setTeamMembers(newHostLocationData.getTeam().getTeamMembers());
		return result;
	}
	
	/**
	 * We need to preserve guest / host teams due to they form the actual info about the dinner routes. <br/>
	 * This is really a weird method...
	 */
	private Team cloneTeamWithHostAndGuestTeams() {
		Set<Team> clonedHostTeams = new HashSet<>();
		Set<Team> clonedGuestTeams = new HashSet<>();
		
		for (Team hostTeam : team.getHostTeams()) {
			Team hostTeamClone = hostTeam.createDetachedClone(false); // Important to prevent endless recursions (we don't need the host-host information
			TeamHostLocationService.preserveDatabaseIds(hostTeamClone, hostTeam);
			clonedHostTeams.add(hostTeamClone);
		}
		for (Team guestTeam : team.getGuestTeams()) {
			Team guestTeamClone = guestTeam.createDetachedClone(false); // Important to prevent endless recursions (we don't need the guest-guest information
			TeamHostLocationService.preserveDatabaseIds(guestTeamClone, guestTeam);
			clonedGuestTeams.add(guestTeamClone);
		}
		
		Team result = this.team.createDetachedClone(false);
		TeamHostLocationService.preserveDatabaseIds(result, this.team);
		for (Team clonedHostTeam : clonedHostTeams) {
			result.addHostTeam(clonedHostTeam);
		}
		for (Team clonedGuestTeam : clonedGuestTeams) {
			clonedGuestTeam.addHostTeam(result);
		}
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

	@Override
	public UUID getId() {
		return team.getId();
	}

	@Override
	public GeocodingResult getGeocodingResult() {
		return new GeocodingResult(this);
	}

}

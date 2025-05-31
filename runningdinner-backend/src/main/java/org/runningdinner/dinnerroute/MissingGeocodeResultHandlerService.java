package org.runningdinner.dinnerroute;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.GeocodingResult.GeocodingSyncStatus;
import org.runningdinner.geocoder.http.GeocodeHttpFetchService;
import org.runningdinner.geocoder.response.GeocodeResponse;
import org.runningdinner.geocoder.response.GeocodeResponsePersistenceService;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MissingGeocodeResultHandlerService {
	
	private final GeocodeHttpFetchService geocodeHttpFetchService;
	
	private final GeocodeResponsePersistenceService geocodeResponsePersistenceService;

	public MissingGeocodeResultHandlerService(GeocodeHttpFetchService geocodeHttpFetchService, GeocodeResponsePersistenceService geocodeResponsePersistenceService) {
		this.geocodeHttpFetchService = geocodeHttpFetchService;
		this.geocodeResponsePersistenceService = geocodeResponsePersistenceService;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public int fetchAndPersistMissingGeocodeResults(String adminId, List<Team> teams) {
		
		List<Team> unsychnronizedTeams = teams.stream().filter(t -> isUnsynchronized(t)).toList();
		List<Participant> teamHosts = unsychnronizedTeams.stream().map(Team::getHostTeamMember).toList();
		
		if (teamHosts.isEmpty()) {
			return 0;
		}
		
		List<GeocodeResponse> geocodesForTeamHosts = geocodeHttpFetchService.fetchGeocodesForParticipants(adminId, teamHosts);
		int numPersistedTeamHosts = 0;
		for (var teamHost : teamHosts) {
			GeocodeResponse matchingGeocodeResponse = findGeocodeResponse(geocodesForTeamHosts, teamHost);
			if (matchingGeocodeResponse != null) {
				geocodeResponsePersistenceService.persistGeocodeResponse(matchingGeocodeResponse);
				numPersistedTeamHosts++;
			}
		}
		return numPersistedTeamHosts;
	}
	
	private static GeocodeResponse findGeocodeResponse(List<GeocodeResponse> geocodesForTeamHosts, Participant teamHost) {
		return geocodesForTeamHosts //
						.stream() //
    				.filter(geocodeResponse -> StringUtils.equals(geocodeResponse.entityId(), teamHost.getId().toString())) //
    				.findFirst() //
    				.orElse(null); //		
	}
	
	private boolean isUnsynchronized(Team team) {
		if (team.getStatus() == TeamStatus.CANCELLED) {
			return false;
		}
		if (team.getHostTeamMember().getGeocodingResult() == null) {
			return true;
		}
		GeocodingResult geocodingResult = team.getHostTeamMember().getGeocodingResult();
		return geocodingResult.getSyncStatus() == GeocodingSyncStatus.UNSYNCHRONIZED && !GeocodingResult.isValid(geocodingResult);
	}
	
}

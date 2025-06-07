package org.runningdinner.dinnerroute;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.GeocodingResult.GeocodingSyncStatus;
import org.runningdinner.geocoder.base.GeocodeResponse;
import org.runningdinner.geocoder.base.GeocodeResponsePersistenceService;
import org.runningdinner.geocoder.http.GeocodeHttpFetchService;
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
	public Map<UUID, GeocodingResult> fetchAndPersistMissingGeocodeResults(String adminId, List<Team> teams) {
		
		List<Team> unsychnronizedTeams = teams.stream().filter(t -> isUnsynchronized(t)).toList();
		List<Participant> teamHosts = unsychnronizedTeams.stream().map(Team::getHostTeamMember).toList();
		
		if (teamHosts.isEmpty()) {
			return Collections.emptyMap();
		}
		
		Map<UUID, GeocodingResult>  result = new HashMap<>();
		List<GeocodeResponse> geocodesForTeamHosts = geocodeHttpFetchService.fetchGeocodesForParticipants(adminId, teamHosts);
		for (var teamHost : teamHosts) {
			GeocodeResponse matchingGeocodeResponse = findGeocodeResponse(geocodesForTeamHosts, teamHost);
			if (matchingGeocodeResponse != null) {
				geocodeResponsePersistenceService.persistGeocodeResponse(matchingGeocodeResponse);
				result.put(UUID.fromString(matchingGeocodeResponse.entityId()), matchingGeocodeResponse.geocodingResult());
			}
		}
		return result;
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

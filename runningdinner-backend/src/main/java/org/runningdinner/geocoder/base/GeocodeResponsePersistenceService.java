package org.runningdinner.geocoder.base;

import java.util.UUID;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.geocoder.GeocodeEntityType;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.GeocodingResult.GeocodingSyncStatus;
import org.runningdinner.participant.ParticipantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class GeocodeResponsePersistenceService {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(GeocodeResponsePersistenceService.class);
	
	private final ParticipantService participantService;
	
	private final AfterPartyLocationService afterPartyLocationService;
	
	public GeocodeResponsePersistenceService(ParticipantService participantService, AfterPartyLocationService afterPartyLocationService) {
		this.participantService = participantService;
		this.afterPartyLocationService = afterPartyLocationService;
	}

	public void persistGeocodeResponse(GeocodeResponse response) {
		GeocodingResult geocodingResult = GeocodeResponsePersistenceService.extractSynchronizedGeocodingResult(response);
		if (StringUtils.equals(response.entityType(), GeocodeEntityType.PARTICIPANT.toString())) {
			UUID participantId = UUID.fromString(response.entityId());
			this.participantService.updateParticipantGeocode(response.adminId(), participantId, geocodingResult);
		} else if (StringUtils.equals(response.entityType(), GeocodeEntityType.AFTER_PARTY_LOCATION.toString())) {
			this.afterPartyLocationService.updateAfterPartyLocationGeocode(response.adminId(), geocodingResult);
		} else {
			throw new IllegalStateException("Unexpected entityType: " + response.entityType());
		}
	}
	
	protected static GeocodingResult extractSynchronizedGeocodingResult(GeocodeResponse response) {
		GeocodingResult geocodingResult = null;
		if (response.geocodingResult() == null) {
			LOGGER.warn("Received empty geocode respone {}, treating this as unresolvable address", response);
			// Create empty result (= not resolved, which is yielded below by setting sync-status to SYNCHRONIZED
			geocodingResult = new GeocodingResult();
		} else {
			geocodingResult = response.geocodingResult();
		}
		
		geocodingResult.setSyncStatus(GeocodingSyncStatus.SYNCHRONIZED);
		return geocodingResult;
	}
}

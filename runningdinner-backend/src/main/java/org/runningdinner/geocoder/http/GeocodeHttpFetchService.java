package org.runningdinner.geocoder.http;

import java.util.Collections;
import java.util.List;

import org.runningdinner.geocoder.GeocodeEntityType;
import org.runningdinner.geocoder.base.GeocodeResponse;
import org.runningdinner.participant.Participant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class GeocodeHttpFetchService {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(GeocodeHttpFetchService.class);
	
	private final RestClient restClient;
	
	private final String restEndpoint;

	public GeocodeHttpFetchService(@Value("${aws.http.geocode.request.url}") String restEndpoint) {
		this.restEndpoint = restEndpoint;
		this.restClient = RestClient.create();
	}
	
	public List<GeocodeResponse> fetchGeocodesForParticipants(String adminId, List<Participant> participants) {
		
		LOGGER.info("Fetching geocodes for participants {} by using URL {} in runningdinner {}", participants, restEndpoint, adminId);
		
		List<HttpGeocodeRequestLine> requestLines = participants.stream() //
																									.map(participant -> new HttpGeocodeRequestLine(participant.getAddress(), participant.getId().toString(), GeocodeEntityType.PARTICIPANT)) //
																									.toList(); //
		
		HttpGeocodeBatchRequest httpGeocodeBatchRequest = new HttpGeocodeBatchRequest(adminId, requestLines);
		
		List<GeocodeResponse> geocodeResponses = restClient
																							.put()
																							.uri(restEndpoint)
																							.contentType(MediaType.APPLICATION_JSON)
																							.body(httpGeocodeBatchRequest)
																							.retrieve()
																							.body(new ParameterizedTypeReference<>() {});
		
		return geocodeResponses != null ? geocodeResponses : Collections.emptyList();
	}
}

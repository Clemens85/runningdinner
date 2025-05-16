package org.runningdinner.dinnerroute.optimization;

import java.util.List;

import org.runningdinner.dinnerroute.distance.GeocodedAddressEntity;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityIdType;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
import org.runningdinner.geocoder.GeocodingResult.GeocodingResultType;
import org.runningdinner.participant.Team;

public final class GeocodeTestUtil {

	private GeocodeTestUtil() {
		// NOP
	}
	
	static GeocodedAddressEntityListTO mapToGeocodedAddressEntityList(List<Team> teams) {
		GeocodedAddressEntityListTO geocodedAddressEntityList = new GeocodedAddressEntityListTO();
		geocodedAddressEntityList.setAddressEntities(teams.stream().map(t -> newGeocodedAddressEntity(t)).toList());
		return geocodedAddressEntityList;
	}
	
	static GeocodedAddressEntity newGeocodedAddressEntity(Team t) {
		GeocodedAddressEntity result = new GeocodedAddressEntity();
		result.setIdType(GeocodedAddressEntityIdType.TEAM_NR);
		result.setId(String.valueOf(t.getTeamNumber()));
		setGeocodeData(result, t.getTeamNumber(), t.getTeamNumber());
		return result;
	}
	
	static void setGeocodeData(GeocodedAddressEntity result, double lat, double lng) {
		result.setLat(lat);
		result.setLng(lng);
		result.setResultType(GeocodingResultType.EXACT);
	}	
	
	static void setGeocodeDataInvalid(GeocodedAddressEntity result) {
		result.setLat(-1);
		result.setLng(-1);
		result.setResultType(GeocodingResultType.NONE);
	}
}

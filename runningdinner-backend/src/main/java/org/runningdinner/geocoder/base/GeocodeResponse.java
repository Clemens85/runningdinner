package org.runningdinner.geocoder.base;

import org.runningdinner.geocoder.GeocodingResult;

public record GeocodeResponse(GeocodingResult geocodingResult, String adminId, String entityId, String entityType) {

}

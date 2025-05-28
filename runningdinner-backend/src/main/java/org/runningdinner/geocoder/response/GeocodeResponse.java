package org.runningdinner.geocoder.response;

public record GeocodeResponse(GeocodeResponseBody body, String adminId, String entityId, String entityType) {

}

package org.runningdinner.geocoder.request;

public record GeocodeRequestBody(String street, String streetNr, String cityName, String zip) {

}

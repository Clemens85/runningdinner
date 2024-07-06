package org.runningdinner.geocoder;

import org.runningdinner.core.Identifiable;

public interface HasGeocodingResult extends Identifiable {

  GeocodingResult getGeocodingResult();

}

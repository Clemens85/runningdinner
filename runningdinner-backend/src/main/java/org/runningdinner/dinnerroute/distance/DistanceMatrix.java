package org.runningdinner.dinnerroute.distance;

import java.util.HashMap;
import java.util.Map;

import org.runningdinner.geocoder.HasGeocodingResult;

public class DistanceMatrix {

  private final Map<DistanceEntry, Double> entries = new HashMap<>();

  public void addDistanceEntry(HasGeocodingResult a, HasGeocodingResult b, double distance) {
    entries.putIfAbsent(new DistanceEntry(a.getId().toString(), b.getId().toString()), distance);
  }

  public Map<DistanceEntry, Double> getEntries() {
    return entries;
  }

	public Double getDistance(HasGeocodingResult a, HasGeocodingResult b) {
		DistanceEntry entry = new DistanceEntry(a.getId().toString(), b.getId().toString());
		return entries.get(entry);
	}
}




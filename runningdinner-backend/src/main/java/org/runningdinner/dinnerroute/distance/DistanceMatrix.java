package org.runningdinner.dinnerroute.distance;

import java.util.HashMap;
import java.util.Map;

public class DistanceMatrix {

  private final Map<DistanceEntry, Double> entries = new HashMap<>();

  public void addDistanceEntry(GeocodedAddressEntity a, GeocodedAddressEntity b, double distance) {

    entries.putIfAbsent(new DistanceEntry(a.getId(), b.getId()), distance);
//    entries.putIfAbsent(new DistanceEntry(b.getId(), a.getId()), distance);
  }

  public Map<DistanceEntry, Double> getEntries() {
    return entries;
  }
}




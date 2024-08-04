package org.runningdinner.geocoder.distance;

import java.util.Objects;

public record DistanceEntry(String srcId, String destId) {
  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }

    DistanceEntry that = (DistanceEntry) o;
    return (Objects.equals(srcId, that.srcId) && Objects.equals(destId, that.destId)) ||
           (Objects.equals(srcId, that.destId) && Objects.equals(destId, that.srcId));
  }

  @Override
  public int hashCode() {
    String hashCodeString = srcId + destId;
    if (srcId.compareTo(destId) > 0) {
      hashCodeString = destId + srcId;
    }
    return Objects.hash(hashCodeString);
  }
}

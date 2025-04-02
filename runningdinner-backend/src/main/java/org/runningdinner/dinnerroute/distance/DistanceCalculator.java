package org.runningdinner.dinnerroute.distance;

import org.runningdinner.geocoder.GeocodingResult;

import java.util.List;

public final class DistanceCalculator {
//  private static final int EARTH_RADIUS = 6371;

  private static final double A = 6378137; // WGS-84 Haupt-Halbachse in Metern
  private static final double F = 1 / 298.257223563; // WGS-84 Abplattung
  private static final double B = 6356752.314245; // WGS-84 Neben-Halbachse in Metern

  private DistanceCalculator() {
    // NOP
  }

  //  public static double calculateDistanceHaversine(GeocodedAddressEntity a, GeocodedAddressEntity b) {
//    if (!GeocodingResult.isValid(a) || !GeocodingResult.isValid(b)) {
//    return -1;
//  }
//
//    double distanceLat = Math.toRadians(lat(b) - lat(a));
//    double distanceLng = Math.toRadians(lng(b) - lng(a));
//
//    double tmp = Math.sin(distanceLat / 2) * Math.sin(distanceLat / 2) +
//                 Math.cos(Math.toRadians(lat(a))) * Math.cos(Math.toRadians(lng(b))) *
//                 Math.sin(distanceLng / 2) * Math.sin(distanceLng / 2);
//
//    double c = 2 * Math.atan2(Math.sqrt(tmp), Math.sqrt(1 - tmp));
//
//    return EARTH_RADIUS * c; // Distance in kilometers
//  }

  public static double calculateDistanceVincenty(GeocodedAddressEntity a, GeocodedAddressEntity b) {

    if (!GeocodingResult.isValid(a) || !GeocodingResult.isValid(b)) {
      return -1;
    }

    double U1 = Math.atan((1 - F) * Math.tan(Math.toRadians(lat(a))));
    double U2 = Math.atan((1 - F) * Math.tan(Math.toRadians(lat(b))));
    double L = Math.toRadians(lng(b) - lng(a));
    double sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
    double sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

    double lambda = L, lambdaP, iterLimit = 100;
    double cosSigma, sinSigma, sigma, sinAlpha, cos2Alpha, cos2SigmaM, C;
    do {
      double sinLambda = Math.sin(lambda), cosLambda = Math.cos(lambda);
      sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) +
        (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) *
          (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
      if (sinSigma == 0) return 0;  // Co-incident points
      cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
      sigma = Math.atan2(sinSigma, cosSigma);
      sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
      cos2Alpha = 1 - sinAlpha * sinAlpha;
      if (cos2Alpha == 0) cos2SigmaM = 0; // Equatorial line
      else cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cos2Alpha;
      C = F / 16 * cos2Alpha * (4 + F * (4 - 3 * cos2Alpha));
      lambdaP = lambda;
      lambda = L + (1 - C) * F * sinAlpha *
        (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma *
          (-1 + 2 * cos2SigmaM * cos2SigmaM)));
    } while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

    if (iterLimit == 0) {
      return -1;  // Formula failed to converge
    }

    double uSquared = cos2Alpha * (A * A - B * B) / (B * B);
    double A_ = 1 + uSquared / 16384 * (4096 + uSquared * (-768 + uSquared *
      (320 - 175 * uSquared)));
    double B_ = uSquared / 1024 * (256 + uSquared * (-128 + uSquared *
      (74 - 47 * uSquared)));
    double deltaSigma = B_ * sinSigma * (cos2SigmaM + B_ / 4 *
      (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
        B_ / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) *
          (-3 + 4 * cos2SigmaM * cos2SigmaM)));

    double s = B * A_ * (sigma - deltaSigma);
    return s / 1000; // Distance in Kilometers
  }


  public static DistanceMatrix calculateDistanceMatrix(List<GeocodedAddressEntity> locations) {
    return calculateDistanceMatrix(locations, -1);
  }

  public static DistanceMatrix calculateDistanceMatrix(List<GeocodedAddressEntity> locations, double maxRangeInMetersToInclude) {

    DistanceMatrix result = new DistanceMatrix();

    int size = locations.size();

    double maxRangeInKilometersToInclude = -1;
    if (maxRangeInMetersToInclude >= 0) {
      maxRangeInKilometersToInclude = maxRangeInMetersToInclude / 1000;
    }

    for (int i = 0; i < size; i++) {
      for (int j = i; j < size; j++) {
        GeocodedAddressEntity a = locations.get(i);
        GeocodedAddressEntity b = locations.get(j);
        if (i != j) {
          double distance = calculateDistanceVincenty(locations.get(i), locations.get(j));
          if (maxRangeInKilometersToInclude < 0 || distance <= maxRangeInKilometersToInclude) {
            result.addDistanceEntry(a, b, distance);
          }
        }
//        if (i == j) {
//          result.addDistanceEntry(a, b, 0);
//        } else {
//          double distance = calculateDistanceVincenty(locations.get(i), locations.get(j));
//          result.addDistanceEntry(a, b, distance);
//        }
      }
    }
    return result;
  }

  private static double lat(GeocodedAddressEntity g) {
    return g.getLat();
  }

  private static double lng(GeocodedAddressEntity g) {
    return g.getLng();
  }
}

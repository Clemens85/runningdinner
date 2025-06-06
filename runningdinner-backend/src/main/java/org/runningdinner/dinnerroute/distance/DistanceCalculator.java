package org.runningdinner.dinnerroute.distance;

import java.util.List;

import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.HasGeocodingResult;

public class DistanceCalculator {
	private static final double A = 6378137; // WGS-84 Haupt-Halbachse in Metern
	private static final double F = 1 / 298.257223563; // WGS-84 Abplattung
	private static final double B = 6356752.314245; // WGS-84 Neben-Halbachse in Metern

	private DistanceCalculator() {
		// NOP
	}

	public static double calculateDistanceVincentyInMeters(HasGeocodingResult positionA, HasGeocodingResult positionB) {

		GeocodingResult a = positionA.getGeocodingResult();
		GeocodingResult b = positionB.getGeocodingResult();
		
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
			sinSigma = Math.sqrt((cosU2 * sinLambda) * (cosU2 * sinLambda) + (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) * (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda));
			if (sinSigma == 0) {
				return 0; // Co-incident points
			}
			cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
			sigma = Math.atan2(sinSigma, cosSigma);
			sinAlpha = cosU1 * cosU2 * sinLambda / sinSigma;
			cos2Alpha = 1 - sinAlpha * sinAlpha;
			if (cos2Alpha == 0) {
				cos2SigmaM = 0; // Equatorial line
			} else { // Equatorial line
				cos2SigmaM = cosSigma - 2 * sinU1 * sinU2 / cos2Alpha;
			}
			C = F / 16 * cos2Alpha * (4 + F * (4 - 3 * cos2Alpha));
			lambdaP = lambda;
			lambda = L + (1 - C) * F * sinAlpha * (sigma + C * sinSigma * (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
		} while (Math.abs(lambda - lambdaP) > 1e-12 && --iterLimit > 0);

		if (iterLimit == 0) {
			return -1; // Formula failed to converge
		}

		double uSquared = cos2Alpha * (A * A - B * B) / (B * B);
		double A_ = 1 + uSquared / 16384 * (4096 + uSquared * (-768 + uSquared * (320 - 175 * uSquared)));
		double B_ = uSquared / 1024 * (256 + uSquared * (-128 + uSquared * (74 - 47 * uSquared)));
		double deltaSigma = B_ * sinSigma
				* (cos2SigmaM + B_ / 4 * (cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) - B_ / 6 * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) * (-3 + 4 * cos2SigmaM * cos2SigmaM)));

		double s = B * A_ * (sigma - deltaSigma);
		return s;
	}

	public static DistanceMatrix calculateDistanceMatrix(List<? extends HasGeocodingResult> locations, boolean removeInvalidGeocodings) {
		return calculateDistanceMatrix(locations, -1, removeInvalidGeocodings);
	}

	public static DistanceMatrix calculateDistanceMatrix(List<? extends HasGeocodingResult> locations, double maxRangeInMetersToInclude, boolean removeInvalidGeocodings) {

		List<? extends HasGeocodingResult> locationsToUse = locations
																													.stream()
																													.filter(loc -> GeocodingResult.isValid(loc.getGeocodingResult()))
																													.toList();
		
		DistanceMatrix result = new DistanceMatrix();

		int size = locationsToUse.size();

		for (int i = 0; i < size; i++) {
			for (int j = i; j < size; j++) {
				HasGeocodingResult a = locationsToUse.get(i);
				HasGeocodingResult b = locationsToUse.get(j);
				if (i != j) {
					double distance = calculateDistanceVincentyInMeters(a, b);
					if (maxRangeInMetersToInclude < 0 || distance <= maxRangeInMetersToInclude) {
						result.addDistanceEntry(a, b, distance);
					}
				}
			}
		}
		return result;
	}

	private static double lat(GeocodingResult g) {
		return g.getLat();
	}

	private static double lng(GeocodingResult g) {
		return g.getLng();
	}
}

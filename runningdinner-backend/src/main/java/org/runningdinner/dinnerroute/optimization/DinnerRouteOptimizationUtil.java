package org.runningdinner.dinnerroute.optimization;

import org.runningdinner.dinnerroute.DinnerRouteCalculator;
import org.runningdinner.dinnerroute.DinnerRouteTO;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.dinnerroute.optimization.data.TeamReference;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.HasGeocodingResult;
import org.runningdinner.participant.Team;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

public class DinnerRouteOptimizationUtil {

	private DinnerRouteOptimizationUtil() {
		// NOP
	}

	public static double[][] mapToDistanceMatrix(List<? extends HasGeocodingResult> teamReferences) {

		var numLocations = teamReferences.size();

		double[][] result = new double[numLocations][numLocations];

		for (int i = 0; i < numLocations; i++) {
			for (int j = i + 1; j < numLocations; j++) {
				double distance = DistanceCalculator.calculateDistanceVincentyInMeters(teamReferences.get(i), teamReferences.get(j));
				result[i][j] = result[j][i] = distance;
			}
		}

		return result;
	}

	public static boolean hasEnoughValidGeocodingResults(List<TeamReference> teamReferences) {
		long validGeocodingCount = teamReferences.stream()
						.filter(DinnerRouteOptimizationUtil::hasValidGeocoding)
						.filter(teamReference -> teamReference.getGeocodingResult().getResultType() != GeocodingResult.GeocodingResultType.NONE)
						.count();

		double validRatio = (double) validGeocodingCount / teamReferences.size();

		return validRatio >= 0.6; // At least 60% must have valid geocoding
	}

	public static List<TeamReference> imputeMissingGeocodingResults(List<TeamReference> teamReferences) {

		// Step 1: Separate valid and invalid teams
		List<TeamReference> invalidTeams = teamReferences
						.stream()
						.filter(team -> !hasValidGeocoding(team))
						.toList();

		List<TeamReference> validTeams = teamReferences
						.stream()
						.filter(DinnerRouteOptimizationUtil::hasValidGeocoding)
						.toList();

		if (invalidTeams.isEmpty()) {
			return new ArrayList<>(teamReferences); // No imputation needed
		}

		// Step 2: Calculate center and spread of valid coordinates
		double centerLat = validTeams.stream().mapToDouble(TeamReference::lat).average().orElse(0.0);
		double centerLng = validTeams.stream().mapToDouble(TeamReference::lng).average().orElse(0.0);

		// Calculate standard deviation to determine appropriate jitter radius
		double latStdDev = calculateStandardDeviation(validTeams.stream().mapToDouble(TeamReference::lat).toArray());
		double lngStdDev = calculateStandardDeviation(validTeams.stream().mapToDouble(TeamReference::lng).toArray());

		// Use 1.5 times the standard deviation as jitter radius to ensure good distribution
		double jitterRadiusLat = Math.max(latStdDev * 1.5, 0.01); // Minimum 0.01 degrees (~1km)
		double jitterRadiusLng = Math.max(lngStdDev * 1.5, 0.01);

		// Step 3: Generate imputed coordinates for invalid teams
		Random random = new Random();

		Map<UUID, TeamReference> teamMappings = new HashMap<>();
		List<TeamReference> tmpResult = new ArrayList<>();
		for (TeamReference teamReference : teamReferences) {
			if (!invalidTeams.contains(teamReference)) {
				tmpResult.add(teamReference);
				teamMappings.put(teamReference.teamId(), teamReference);
				continue;
			}
			// Generate random offset with normal distribution
			double offsetLat = random.nextGaussian() * jitterRadiusLat;
			double offsetLng = random.nextGaussian() * jitterRadiusLng;

			double imputedLat = centerLat + offsetLat;
			double imputedLng = centerLng + offsetLng;

			// Create new TeamReference with imputed coordinates
			TeamReference imputedTeam = teamReference.cloneTeamReference(GeocodingResult.newInstance(imputedLat, imputedLng, GeocodingResult.GeocodingResultType.NONE));

			teamMappings.put(imputedTeam.teamId(), imputedTeam);
			tmpResult.add(imputedTeam);
		}

		// We must also adapt the teamsOnRoute here, as they might still reference the old team references with invalid geocoding results:
		List<TeamReference> result = new ArrayList<>(tmpResult.size());
		for (TeamReference teamReference : tmpResult) {
			// Use teamReferences from above mapping to ensure that teamsOnRoute contains valid TeamReferences in terms of geocoding
			List<TeamReference> teamsOnRoute = teamReference.teamsOnRoute()
							.stream()
							.map(t -> teamMappings.get(t.teamId()))
							.toList();
			TeamReference updatedTeamReference = teamReference.cloneTeamReference(teamsOnRoute);
			result.add(updatedTeamReference);
		}
		return result;
	}

	public static boolean hasValidGeocoding(TeamReference teamReference) {
		return GeocodingResult.isValid(teamReference.getGeocodingResult());
	}

	private static double calculateStandardDeviation(double[] values) {
		if (values.length == 0) {
			return 0.0;
		}

		double mean = Arrays.stream(values).average().orElse(0.0);
		double variance = Arrays.stream(values)
						.map(x -> Math.pow(x - mean, 2))
						.average()
						.orElse(0.0);

		return Math.sqrt(variance);
	}

	public static List<DinnerRouteTO> buildDinnerRoute(List<Team> teams, DinnerRouteCalculator dinnerRouteCalculator) {
		List<DinnerRouteTO> optimizedDinnerRoutes = new ArrayList<>();
		for (Team team : teams) {
			DinnerRouteTO dinnerRoute = dinnerRouteCalculator.buildDinnerRoute(team);
			optimizedDinnerRoutes.add(dinnerRoute);
		}
		return optimizedDinnerRoutes;
	}
	

}

package org.runningdinner.dinnerroute.optimization;

import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public record CalculateDinnerRouteOptimizationRequest(@Valid @NotNull GeocodedAddressEntityListTO addressEntityList, 
																											Double currentSumDistanceInMeters, 
																											Double currentAverageDistanceInMeters) {

}

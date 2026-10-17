package org.runningdinner.dinnerroute.optimization.data;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

public record RouteOptimizationSettings(@JsonProperty Double currentSumDistanceInMeters,
                                        @JsonProperty Double currentAverageDistanceInMeters,
                                        @JsonProperty Boolean ignoreMealAssignments,
                                        @JsonProperty Integer minimumDistanceInMeters,
                                        @JsonProperty @JsonSetter(nulls = Nulls.AS_EMPTY) boolean ignoreAccessibilityRequirements) {

}

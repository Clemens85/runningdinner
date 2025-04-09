package org.runningdinner.dinnerroute;

import java.util.List;

public record AllDinnerRoutesWithDistancesListTO(List<DinnerRouteWithDistancesTO> dinnerRoutes, Double averageDistanceInMeters, Double sumDistanceInMeters) {
}

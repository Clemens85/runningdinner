package org.runningdinner.dinnerroute.optimization;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import org.runningdinner.dinnerroute.DinnerRouteTO;

public record SaveDinnerRouteOptimizationRequest(@Valid @NotEmpty List<DinnerRouteTO> optimizedDinnerRoutes,
                                                 @Valid @NotEmpty List<TeamMemberChange> teamMemberChangesToPerform) {
}

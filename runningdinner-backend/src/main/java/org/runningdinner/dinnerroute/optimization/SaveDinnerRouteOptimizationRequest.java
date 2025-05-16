package org.runningdinner.dinnerroute.optimization;

import java.util.List;

import org.runningdinner.dinnerroute.DinnerRouteTO;
import org.runningdinner.dinnerroute.optimization.local.TeamMemberChange;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record SaveDinnerRouteOptimizationRequest(@Valid @NotEmpty List<DinnerRouteTO> optimizedDinnerRoutes,
                                                 @Valid @NotNull List<TeamMemberChange> teamMemberChangesToPerform) {
}

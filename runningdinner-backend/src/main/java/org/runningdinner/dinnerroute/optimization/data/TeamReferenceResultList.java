package org.runningdinner.dinnerroute.optimization.data;

import org.runningdinner.dinnerroute.DinnerRouteListTO;

import java.util.List;

public record TeamReferenceResultList(List<TeamReference> teamReferences, DinnerRouteListTO dinnerRouteList) {
}

package org.runningdinner.dinnerroute;

import java.util.Comparator;
import java.util.Objects;

final class DinnerRouteTeamWithDistanceComparator implements Comparator<DinnerRouteWithDistancesTO> {

  static final DinnerRouteTeamWithDistanceComparator INSTANCE = new DinnerRouteTeamWithDistanceComparator();

  @Override
  public int compare(DinnerRouteWithDistancesTO o1, DinnerRouteWithDistancesTO o2) {
    Double o1MaxDistance = getMaxDistanceInRoute(o1);
    Double o2MaxDistance = getMaxDistanceInRoute(o2);
    if (o1MaxDistance == null && o2MaxDistance == null) {
      return 0;
    }
    if (o2MaxDistance == null) {
      return 1;
    }
    if (o1MaxDistance == null) {
      return -1;
    }
    return o2MaxDistance.compareTo(o1MaxDistance);
  }

  private Double getMaxDistanceInRoute(DinnerRouteWithDistancesTO route) {
    return route.teams()
            .stream()
            .map(DinnerRouteTeamWithDistanceTO::getDistanceToNextTeam)
            .filter(Objects::nonNull)
            .max(Comparator.naturalOrder())
            .orElse(null);
  }
}
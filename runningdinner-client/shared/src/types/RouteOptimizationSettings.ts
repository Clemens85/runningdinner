export type RouteOptimizationSettings = {
  ignoreMealAssignments: boolean;
  minimumDistanceInMeters: number;
};

export function newRouteOptimizationSettings(): RouteOptimizationSettings {
  return {
    ignoreMealAssignments: false,
    minimumDistanceInMeters: 0,
  };
}

export type RouteOptimizationSettings = {
  ignoreMealAssignments: boolean;
  minimumDistanceInMeters: number;
  ignoreAccessibilityRequirements: boolean;
};

export function newRouteOptimizationSettings(): RouteOptimizationSettings {
  return {
    ignoreMealAssignments: false,
    minimumDistanceInMeters: 0,
    ignoreAccessibilityRequirements: false,
  };
}

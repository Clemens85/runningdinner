export class DinnerRouteDistanceUtil {
  public static getDistancePretty(distanceInMeters: number): number {
    if (DinnerRouteDistanceUtil.isDistanceLessOneKilometer(distanceInMeters)) {
      return Math.round(distanceInMeters);
    }
    // Convert to kilometers and round to one decimal place
    return Math.round(distanceInMeters / 100) / 10;
  }

  public static getDistancePrettyFormatted(distanceInMeters: number): string {
    const distance = DinnerRouteDistanceUtil.getDistancePretty(distanceInMeters);
    if (DinnerRouteDistanceUtil.isDistanceLessOneKilometer(distanceInMeters)) {
      return `${distance} m`;
    }
    return `${distance} km`;
  }

  private static isDistanceLessOneKilometer(distanceInMeters: number): boolean {
    return distanceInMeters < 1000;
  }
}

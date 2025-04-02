package org.runningdinner.dinnerroute;

public class DinnerRouteTeamWithDistanceTO extends DinnerRouteTeamTO {

  private Double distanceToNextTeam;

  private boolean currentTeam;

  private boolean largestDistanceInRoute;

  public DinnerRouteTeamWithDistanceTO() {
    // NOP
  }

  public DinnerRouteTeamWithDistanceTO(DinnerRouteTeamTO src,
                                       Double distanceToNextTeam,
                                       boolean currentTeam) {
    this.distanceToNextTeam = distanceToNextTeam;
    this.setTeamNumber(src.getTeamNumber());
    this.setHostTeamMember(src.getHostTeamMember());
    this.setMeal(src.getMeal());
    this.setStatus(src.getStatus());
    this.setContactInfo(src.getContactInfo());
    this.currentTeam = currentTeam;
    // rawTeam attribute does not matter within the use-case of this class, hence we don't set it
  }

  public Double getDistanceToNextTeam() {
    return distanceToNextTeam;
  }

  public void setDistanceToNextTeam(Double distanceToNextTeam) {
    this.distanceToNextTeam = distanceToNextTeam;
  }

  public boolean isCurrentTeam() {
    return currentTeam;
  }

  public boolean isLargestDistanceInRoute() {
    return largestDistanceInRoute;
  }

  public void setLargestDistanceInRoute(boolean largestDistanceInRoute) {
    this.largestDistanceInRoute = largestDistanceInRoute;
  }
}

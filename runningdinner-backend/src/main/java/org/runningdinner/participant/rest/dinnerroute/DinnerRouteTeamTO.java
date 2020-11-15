
package org.runningdinner.participant.rest.dinnerroute;

import com.google.common.base.MoreObjects;
import org.runningdinner.admin.rest.MealTO;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamStatus;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class DinnerRouteTeamTO {

  private int teamNumber;

  private TeamStatus status;

  private MealTO meal;

  private DinnerRouteTeamHostTO hostTeamMember;
  
  @JsonIgnore
  private Team rawTeam;
  
  protected DinnerRouteTeamTO() {
    
    // JSON
  }
  
  public DinnerRouteTeamTO(Team team) {
    
    this.setStatus(team.getStatus());
    this.setTeamNumber(team.getTeamNumber());
    this.setMeal(new MealTO(team.getMealClass()));
    
    Participant hostTeamMemberTmp = team.getHostTeamMember();
    if (hostTeamMemberTmp != null) {
      this.setHostTeamMember(new DinnerRouteTeamHostTO(hostTeamMemberTmp));
    }
    
    this.rawTeam = team;
  }

  public int getTeamNumber() {

    return teamNumber;
  }

  public void setTeamNumber(int teamNumber) {

    this.teamNumber = teamNumber;
  }

  public TeamStatus getStatus() {

    return status;
  }

  public void setStatus(TeamStatus status) {

    this.status = status;
  }

  public MealTO getMeal() {

    return meal;
  }

  public void setMeal(MealTO meal) {

    this.meal = meal;
  }

  public DinnerRouteTeamHostTO getHostTeamMember() {

    return hostTeamMember;
  }

  public void setHostTeamMember(DinnerRouteTeamHostTO hostTeamMember) {

    this.hostTeamMember = hostTeamMember;
  }
  
  public Team getRawTeam() {
  
    return rawTeam;
  }

  @Override public String toString() {

    return MoreObjects.toStringHelper(this)
            .addValue(rawTeam)
            .toString();
  }
}


package org.runningdinner.dinnerroute;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.runningdinner.admin.rest.MealTO;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.HasGeocodingResult;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamStatus;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.MoreObjects;

public class DinnerRouteTeamTO implements HasGeocodingResult {

  private int teamNumber;

  private TeamStatus status;

  private MealTO meal;

  private DinnerRouteTeamHostTO hostTeamMember;
  
  private List<String> contactInfo = new ArrayList<>();
  
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
    
    this.setContactInfo(TeamRouteBuilder.getMobileNumbers(team));
    
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
  
	public List<String> getContactInfo() {
		
		return new ArrayList<>(contactInfo);
	}

	public void setContactInfo(List<String> contactInfo) {
		
		this.contactInfo = contactInfo;
	}

	@Override 
  public String toString() {

    return MoreObjects.toStringHelper(this)
            .addValue(rawTeam)
            .toString();
  }

	@Override
	@JsonIgnore
	public UUID getId() {
		return rawTeam != null ? rawTeam.getId() : null; 
	}

	@Override
	@JsonIgnore
	public GeocodingResult getGeocodingResult() {
		return this.getHostTeamMember() != null ? this.getHostTeamMember().getGeocodingResult() : null;
	}
}


package org.runningdinner.participant;

import java.util.List;

import org.runningdinner.admin.rest.MealTO;
import org.runningdinner.core.AfterPartyLocation;

import com.google.common.base.MoreObjects;

public class TeamLocationsEventData {
  
  private String adminId;
  
  private List<MealTO> meals;
  
  private List<TeamLocation> teamHostLocations;
  
  private AfterPartyLocation afterPartyLocation;
  
  protected TeamLocationsEventData() {
    
  }
  
  public TeamLocationsEventData(String adminId, List<MealTO> meals, List<TeamLocation> teamLocations) {
    this.adminId = adminId;
    this.meals = meals;
    this.teamHostLocations = teamLocations;
  }
  
  public String getAdminId() {
    return adminId;
  }

  public void setAdminId(String adminId) {
    this.adminId = adminId;
  }

  public List<MealTO> getMeals() {
    return meals;
  }

  public void setMeals(List<MealTO> meals) {
    this.meals = meals;
  }

  public List<TeamLocation> getTeamHostLocations() {
    return teamHostLocations;
  }

  public void setTeamHostLocations(List<TeamLocation> teamHostLocations) {
    this.teamHostLocations = teamHostLocations;
  }

  public AfterPartyLocation getAfterPartyLocation() {
    return afterPartyLocation;
  }

  public void setAfterPartyLocation(AfterPartyLocation afterPartyLocation) {
    this.afterPartyLocation = afterPartyLocation;
  }


  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("adminId", adminId)
      .add("meals", meals)
      .add("teamHostLocations", teamHostLocations)
      .add("afterPartyLocation", afterPartyLocation)
      .toString();
  }
}

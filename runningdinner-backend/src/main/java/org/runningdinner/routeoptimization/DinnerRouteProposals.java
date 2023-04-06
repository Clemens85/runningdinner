package org.runningdinner.routeoptimization;

import java.util.List;

import org.runningdinner.admin.rest.MealTO;

public class DinnerRouteProposals {
  
  private String adminId;
  
  private List<MealTO> meals;
  
  private List<DinnerRouteProposal> dinnerRoutes;

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

  public List<DinnerRouteProposal> getDinnerRoutes() {
    return dinnerRoutes;
  }

  public void setDinnerRoutes(List<DinnerRouteProposal> dinnerRoutes) {
    this.dinnerRoutes = dinnerRoutes;
  }
  
}


package org.runningdinner.admin.rest;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.validator.constraints.NotEmpty;
import org.runningdinner.core.MealClass;

public class UpdateMealsRequestTO {

  @NotEmpty
  private List<MealClass> meals = new ArrayList<>();

  public List<MealClass> getMeals() {

    return meals;
  }

  public void setMeals(List<MealClass> meals) {

    this.meals = meals;
  }

  @Override
  public String toString() {

    return "meals=" + meals;
  }

}

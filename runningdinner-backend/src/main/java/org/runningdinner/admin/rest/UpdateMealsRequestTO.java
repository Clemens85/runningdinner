
package org.runningdinner.admin.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import org.runningdinner.core.MealClass;

import java.util.ArrayList;
import java.util.List;

public class UpdateMealsRequestTO {

  @NotEmpty
  @Valid
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

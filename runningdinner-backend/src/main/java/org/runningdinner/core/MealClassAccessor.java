package org.runningdinner.core;

import java.util.UUID;

import org.springframework.util.Assert;

public final class MealClassAccessor {

  private final MealClass wrappedMealClass;

  private MealClassAccessor(final MealClass wrappedMealClass) {
    this.wrappedMealClass = wrappedMealClass;
  }
  
  public MealClassAccessor setId(UUID id) {
  	Assert.state(wrappedMealClass.isNew(), "Can only set ID for MealClass if it has none set so far, but ID was " + wrappedMealClass.getId());
  	wrappedMealClass.setId(id);
    return this;
  }
  
  public static MealClassAccessor newAccessor(MealClass mealClass) {

    return new MealClassAccessor(mealClass);
  }
}

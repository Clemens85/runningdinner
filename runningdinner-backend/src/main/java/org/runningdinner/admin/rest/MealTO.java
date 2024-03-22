
package org.runningdinner.admin.rest;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import jakarta.validation.constraints.NotNull;

import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.common.rest.BaseTO;
import org.runningdinner.core.MealClass;

public class MealTO extends BaseTO {

  private static final long serialVersionUID = -1301290310204401329L;

  @SafeHtml
  private String label;

  @NotNull
  private LocalDateTime time;

  public MealTO() {
  }

  public MealTO(MealClass mealClass) {
    super(mealClass);
    this.label = mealClass.getLabel();
    this.time = mealClass.getTime();
  }

  public String getLabel() {

    return label;
  }

  public void setLabel(String label) {

    this.label = label;
  }

  public LocalDateTime getTime() {

    return time;
  }

  public void setTime(LocalDateTime time) {

    this.time = time;
  }

  @Override
  public String toString() {

    return label;
  }

  public static List<MealTO> fromMeals(Collection<MealClass> meals) {

    List<MealTO> result = meals.stream().map(m -> new MealTO(m)).collect(Collectors.toList());
    return result;
  }
}

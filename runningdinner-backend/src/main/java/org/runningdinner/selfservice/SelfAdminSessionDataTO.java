package org.runningdinner.selfservice;

import org.runningdinner.admin.rest.MealTO;

import java.util.List;
import java.util.UUID;

public class SelfAdminSessionDataTO {

  private final UUID selfAdministrationId;
  
  private final String languageCode;

  private final List<MealTO> meals;

  public SelfAdminSessionDataTO(UUID selfAdministrationId, String languageCode, List<MealTO> meals) {

    super();
    this.selfAdministrationId = selfAdministrationId;
    this.languageCode = languageCode;
    this.meals = meals;
  }

  public UUID getSelfAdministrationId() {
  
    return selfAdministrationId;
  }
  
  public String getLanguageCode() {
  
    return languageCode;
  }

  public List<MealTO> getMeals() {
    return meals;
  }
}

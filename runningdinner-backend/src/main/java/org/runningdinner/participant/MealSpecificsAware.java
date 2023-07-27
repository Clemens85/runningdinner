package org.runningdinner.participant;

import org.runningdinner.core.MealSpecifics;

import com.fasterxml.jackson.annotation.JsonIgnore;

public interface MealSpecificsAware {

   boolean isVegetarian();

   boolean isLactose();

   boolean isVegan();

   boolean isGluten();

   String getMealSpecificsNote();
   
   @JsonIgnore
   default MealSpecifics getMealSpecifics() {
     return new MealSpecifics(this.isLactose(), this.isGluten(), this.isVegetarian(), this.isVegan(), this.getMealSpecificsNote());
   }
}

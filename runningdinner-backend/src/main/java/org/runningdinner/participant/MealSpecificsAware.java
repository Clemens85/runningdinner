package org.runningdinner.participant;

import org.runningdinner.core.MealSpecifics;

public interface MealSpecificsAware {

   boolean isVegetarian();

   boolean isLactose();

   boolean isVegan();

   boolean isGluten();

   String getMealSpecificsNote();
   
   default MealSpecifics getMealSpecifics() {
     return new MealSpecifics(this.isLactose(), this.isGluten(), this.isVegetarian(), this.isVegan(), this.getMealSpecificsNote());
   }
}

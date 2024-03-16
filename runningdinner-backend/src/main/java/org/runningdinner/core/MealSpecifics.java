package org.runningdinner.core;

import jakarta.persistence.Embeddable;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;
import org.runningdinner.core.util.CoreUtil;

@Embeddable
public class MealSpecifics {

  private boolean lactose;

  private boolean gluten;

  private boolean vegetarian;

  private boolean vegan;

  private String mealSpecificsNote = StringUtils.EMPTY;

  public static final MealSpecifics NONE = new MealSpecifics();

  public MealSpecifics(boolean lactose, boolean gluten, boolean vegetarian, boolean vegan, String note) {
    this.lactose = lactose;
    this.gluten = gluten;
    this.vegetarian = vegetarian;
    this.vegan = vegan;
    this.setNote(note);
  }

  public MealSpecifics() {
  }

  public boolean isLactose() {
    return lactose;
  }

  public void setLactose(boolean lactose) {
    this.lactose = lactose;
  }

  public boolean isGluten() {
    return gluten;
  }

  public void setGluten(boolean gluten) {
    this.gluten = gluten;
  }

  public boolean isVegetarian() {
    return vegetarian;
  }

  public void setVegetarian(boolean vegetarian) {
    this.vegetarian = vegetarian;
  }

  public boolean isVegan() {
    return vegan;
  }

  public void setVegan(boolean vegan) {
    this.vegan = vegan;
  }

  public String getMealSpecificsNote() {
    return mealSpecificsNote;
  }

  public void setNote(String mealSpecificsNote) {
    if (mealSpecificsNote == null) {
      this.mealSpecificsNote = StringUtils.EMPTY;
    } else {
      this.mealSpecificsNote = StringUtils.trim(mealSpecificsNote);
    }
  }

  public MealSpecifics createDetachedClone() {

    MealSpecifics result = new MealSpecifics();
    result.gluten = gluten;
    result.lactose = lactose;
    result.mealSpecificsNote = mealSpecificsNote;
    result.vegan = vegan;
    result.vegetarian = vegetarian;
    return result;
  }

  public void unionWith(MealSpecifics incomingMealSpecifics) {

    this.vegan = this.vegan || incomingMealSpecifics.isVegan();
    this.vegetarian = this.vegetarian || incomingMealSpecifics.isVegetarian();
    this.gluten = this.gluten || incomingMealSpecifics.isGluten();
    this.lactose = this.lactose || incomingMealSpecifics.isLactose();
  }

  public boolean isOneSelected() {

    return CoreUtil.isOneTrue(vegan, vegetarian, gluten, lactose);
  }

  @Override
  public int hashCode() {
    return new HashCodeBuilder(17, 113)
                .append(isLactose())
                .append(isGluten())
                .append(isVegan())
                .append(isVegetarian())
                .append(getMealSpecificsNote()).toHashCode();
	}

	@Override
	public boolean equals(Object obj) {
		if (obj == null) {
			return false;
		}
		if (obj == this) {
			return true;
		}
		if (obj.getClass() != getClass()) {
			return false;
		}
		MealSpecifics other = (MealSpecifics)obj;
		return new EqualsBuilder().append(isGluten(), other.isGluten()).append(isLactose(), other.isLactose()).append(isVegan(),
				other.isVegan()).append(isVegetarian(), other.isVegetarian()).append(getMealSpecificsNote(), other.getMealSpecificsNote()).isEquals();
	}

	@Override
	public String toString() {
		return "lactose=" + lactose + ", gluten=" + gluten + ", vegetarian=" + vegetarian + ", vegan=" + vegan + ", notes=" + mealSpecificsNote;
	}

}

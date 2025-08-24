
package org.runningdinner.core;

import jakarta.persistence.Access;
import jakarta.persistence.AccessType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.apache.commons.lang3.builder.EqualsBuilder;
import org.apache.commons.lang3.builder.HashCodeBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Represents a meal-type in a running diner like e.g. dessert.
 * 
 * @author Clemens Stich
 * 
 */
@Entity
@Access(AccessType.FIELD)
public final class MealClass extends AbstractEntity {

  private static final long serialVersionUID = 8167694721190832584L;

  @Column(nullable = false)
  @NotBlank
  private String label;

  @Column(nullable = false, columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  @NotNull
  private LocalDateTime time;

  private MealClass() {
    // JPA
  }

  public MealClass(String label) {
    this.label = label;
  }

  public MealClass(String label, LocalDateTime time) {
    this.label = label;
    this.time = time;
  }

  /**
   * Returns the name of this meal (the meal is actually identified by this name).
   * 
   * @return
   */
  public String getLabel() {
    return label;
  }

  public void setLabel(String label) {
    this.label = label;
  }

  /**
   * The time for ingesting this meal.<br>
   * This time is returned as a whole date, although the time is the actual important data.
   * 
   * @return
   */
  public LocalDateTime getTime() {

    return time;
  }

  public void setTime(LocalDateTime time) {

    this.time = time;
  }

  public MealClass createDetachedClone() {
    return new MealClass(this.getLabel(), this.getTime());
  }

  @Override
  public int hashCode() {

    return new HashCodeBuilder(13, 11).append(getLabel()).hashCode();
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

    MealClass other = (MealClass) obj;
    return new EqualsBuilder().append(getLabel(), other.getLabel()).isEquals();
  }

  @Override
  public String toString() {

    return label;
  }
  

  @Override
	protected void setId(UUID id) {
  	super.setId(id);
  }

  // Convenience methods for standalone scenario

  public static MealClass APPETIZER() {

    return new MealClass("Vorspeise");
  }

  public static MealClass MAINCOURSE() {

    return new MealClass("Hauptgericht");
  }

  public static MealClass DESSERT() {

    return new MealClass("Nachspeise");
  }

}

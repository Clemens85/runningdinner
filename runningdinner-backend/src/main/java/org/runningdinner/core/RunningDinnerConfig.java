
package org.runningdinner.core;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

import org.runningdinner.participant.Participant;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;

/**
 * Contains the options for a running dinner (e.g. which meals to cook, size of the teams, ...)
 * 
 * @author Clemens Stich
 * 
 */
@Embeddable
public class RunningDinnerConfig implements BasicRunningDinnerConfiguration {

  @OneToMany(cascade = CascadeType.REMOVE, fetch = FetchType.EAGER)
  @JoinColumn(name = "dinnerId")
  @OrderBy("time ASC")
  private Set<MealClass> mealClasses;

  @Column(nullable = false)
  private int teamSize;

  @Column(nullable = false)
  private boolean considerShortestPaths;

  @Enumerated(EnumType.STRING)
  @Column(length = 32, nullable = false)
  private GenderAspect genderAspects;

  @Column(nullable = false)
  private boolean forceEqualDistributedCapacityTeams;
  
  @Column(nullable = false)
  private boolean teamPartnerWishDisabled;

  public RunningDinnerConfig() {
    // Needed for JPA
  }

  public RunningDinnerConfig(Set<MealClass> mealClasses, 
                             int teamSize, 
                             boolean considerShortestPaths, 
                             GenderAspect genderAspects, 
                             boolean forceEqualDistributedCapacityTeams,
                             boolean teamPartnerWishDisabled) {
    this.considerShortestPaths = considerShortestPaths;
    this.forceEqualDistributedCapacityTeams = forceEqualDistributedCapacityTeams;
    this.mealClasses = mealClasses;
    this.teamSize = teamSize;
    this.genderAspects = genderAspects;
    this.teamPartnerWishDisabled = teamPartnerWishDisabled;
  }

  /**
   * Determines whether teams shall be mixed up by using certain gender aspects.<br>
   * Currently not supported by calculation.
   * 
   * @return
   */
  public GenderAspect getGenderAspects() {

    return genderAspects;
  }

  /**
   * Determines whether teams shall be mixed up based on the hosting capabilities of single participants
   * 
   * @return
   */
  public boolean isForceEqualDistributedCapacityTeams() {

    return forceEqualDistributedCapacityTeams;
  }

  /**
   * Determines whether dinner-routes between teams shall be generated based up on nearest distances.<br>
   * Currently not supported by calculation
   * 
   * @return
   */
  public boolean isConsiderShortestPaths() {

    return considerShortestPaths;
  }

  /**
   * Contains all meals to cook for a running dinner
   * 
   * @return
   */
  @Override
  public List<MealClass> getMealClasses() {

    return new ArrayList<>(mealClasses);
  }

  /**
   * Determines how many participants are mixed up into one team. Typcially this should be 2.
   * 
   * @return
   */
  @Override
  public int getTeamSize() {

    return teamSize;
  }

  @Override
  public int getNumberOfMealClasses() {

    return mealClasses != null ? mealClasses.size() : 0;
  }

  public void setMealClasses(List<MealClass> mealClasses) {

    this.mealClasses = new LinkedHashSet<>(mealClasses);
  }

  public void setTeamSize(int teamSize) {

    this.teamSize = teamSize;
  }

  public void setConsiderShortestPaths(boolean considerShortestPaths) {

    this.considerShortestPaths = considerShortestPaths;
  }

  public void setGenderAspects(GenderAspect genderAspects) {

    this.genderAspects = genderAspects;
  }

  public void setForceEqualDistributedCapacityTeams(boolean forceEqualDistributedCapacityTeams) {

    this.forceEqualDistributedCapacityTeams = forceEqualDistributedCapacityTeams;
  }
  
  
  public boolean isTeamPartnerWishDisabled() {
  
    return teamPartnerWishDisabled;
  }

  
  public void setTeamPartnerWishDisabled(boolean teamPartnerWishDisabled) {
  
    this.teamPartnerWishDisabled = teamPartnerWishDisabled;
  }

  /**
   * Checks whether the passed participant can act as host based upon the current dinner-options.<br>
   * It may happen that the hosting-capabilities of the participant is not known. In such a case FuzzyBoolean.UNKNOWN will be returned.
   * 
   * @param participant
   * @return
   */
  public FuzzyBoolean canHost(final Participant participant) {

    if (participant.getNumSeats() == Participant.UNDEFINED_SEATS) {
      return FuzzyBoolean.UNKNOWN;
    }
    int numSeatsNeeded = getTeamSize() * getMealClasses().size();
    return participant.getNumSeats() >= numSeatsNeeded ? FuzzyBoolean.TRUE : FuzzyBoolean.FALSE;
  }

  /**
   * Create a new running dinner configuration instance
   * 
   * @return
   */
  public static ConfigBuilder newConfigurer() {

    return new ConfigBuilder();
  }

  /**
   * Create a new running dinner configuration instance containing only the basic infos
   * 
   * @return
   */
  public static BasicConfigBuilder newBasicConfigurer() {

    return new BasicConfigBuilder();
  }

  public static class ConfigBuilder {

    // Defaults:
    private GenderAspect genderAspects = GenderAspect.IGNORE_GENDER;
    private boolean forceEqualDistributedCapacityTeams = true; // What is the effect of this?!
    private boolean considerShortestPaths = true;
    private Set<MealClass> mealClasses = null;
    private int teamSize = 2;
    private boolean teamPartnerWishDisabled = false;
    
    public ConfigBuilder() {
    }

    public ConfigBuilder withTeamSize(final int teamSize) {

      this.teamSize = teamSize;
      return this;
    }

    public ConfigBuilder havingMeals(final Collection<MealClass> meals) {

      if (this.mealClasses == null) {
        this.mealClasses = new LinkedHashSet<MealClass>(meals);
      } else {
        this.mealClasses.clear();
        this.mealClasses.addAll(meals);
      }

      return this;
    }

    public ConfigBuilder withEqualDistributedCapacityTeams(boolean forceEqualDistributedCapacityTeams) {

      this.forceEqualDistributedCapacityTeams = forceEqualDistributedCapacityTeams;
      return this;
    }

    public ConfigBuilder withGenderAspects(GenderAspect genderAspects) {

      this.genderAspects = genderAspects;
      return this;
    }

    public ConfigBuilder withTeamPartnerWishDisabled(boolean teamPartnerWishDisabled) {
      this.teamPartnerWishDisabled = teamPartnerWishDisabled;
      return this;
    }
    
    public RunningDinnerConfig build() {

      if (mealClasses == null) {
        // Add standard courses:
        mealClasses = new LinkedHashSet<MealClass>(3);
        mealClasses.add(MealClass.APPETIZER());
        mealClasses.add(MealClass.MAINCOURSE());
        mealClasses.add(MealClass.DESSERT());
      }
      return new RunningDinnerConfig(mealClasses, teamSize, considerShortestPaths, genderAspects, forceEqualDistributedCapacityTeams, teamPartnerWishDisabled);
    }
  }

  public static class BasicConfigBuilder {

    private Set<MealClass> mealClasses = null;
    private int teamSize = 2;

    public BasicConfigBuilder() {
    }

    public BasicConfigBuilder withTeamSize(final int teamSize) {

      this.teamSize = teamSize;
      return this;
    }

    public BasicConfigBuilder havingMeals(final Collection<MealClass> meals) {

      if (this.mealClasses == null) {
        this.mealClasses = new LinkedHashSet<MealClass>(meals);
      } else {
        this.mealClasses.clear();
        this.mealClasses.addAll(meals);
      }

      return this;
    }

    public BasicConfigBuilder havingNumberOfDummyMeals(int numberOfMeals) {

      Set<MealClass> dummyMeals = new HashSet<>();
      for (int i = 0; i < numberOfMeals; i++) {
        dummyMeals.add(new MealClass("Meal " + (i + 1)));
      }
      return havingMeals(dummyMeals);
    }

    public BasicRunningDinnerConfiguration build() {

      if (mealClasses == null) {
        // Add standard courses:
        mealClasses = new LinkedHashSet<MealClass>(3);
        mealClasses.add(MealClass.APPETIZER());
        mealClasses.add(MealClass.MAINCOURSE());
        mealClasses.add(MealClass.DESSERT());
      }
      return new RunningDinnerConfig(mealClasses, teamSize, false, GenderAspect.IGNORE_GENDER, true, false);
    }
  }
}

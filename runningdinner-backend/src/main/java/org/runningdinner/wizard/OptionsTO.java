package org.runningdinner.wizard;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import org.runningdinner.core.GenderAspect;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.RunningDinnerConfig;

public class OptionsTO implements Serializable {

	private static final long serialVersionUID = 1L;

	private int teamSize = 2;

	@NotNull
	private GenderAspect genderAspects;

	private boolean considerShortestPaths = false;

	private boolean forceEqualDistributedCapacityTeams = true;
	
	private boolean teamPartnerWishDisabled = false;

	@NotEmpty
	private List<MealClass> meals;

	public OptionsTO() {

	}

	public OptionsTO(RunningDinnerConfig config) {
		this.teamSize = config.getTeamSize();
		this.genderAspects = config.getGenderAspects();
		this.considerShortestPaths = config.isConsiderShortestPaths();
		this.forceEqualDistributedCapacityTeams = config.isForceEqualDistributedCapacityTeams();
		this.meals = new ArrayList<>(config.getMealClasses());
		this.teamPartnerWishDisabled = config.isTeamPartnerWishDisabled();
	}

	public int getTeamSize() {
		return teamSize;
	}

	public void setTeamSize(int teamSize) {
		this.teamSize = teamSize;
	}

	public GenderAspect getGenderAspects() {
		return genderAspects;
	}

	public void setGenderAspects(GenderAspect genderAspects) {
		this.genderAspects = genderAspects;
	}

	public boolean isConsiderShortestPaths() {
		return considerShortestPaths;
	}

	public void setConsiderShortestPaths(boolean considerShortestPaths) {
		this.considerShortestPaths = considerShortestPaths;
	}

	public boolean isForceEqualDistributedCapacityTeams() {
		return forceEqualDistributedCapacityTeams;
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

  public List<MealClass> getMeals() {
		return meals;
	}

	public void setMeals(List<MealClass> meals) {
		this.meals = meals;
	}

  public RunningDinnerConfig toRunningDinnerConfigDetached() {

    RunningDinnerConfig result = new RunningDinnerConfig(new LinkedHashSet<>(meals), teamSize, considerShortestPaths, 
                                                         genderAspects, forceEqualDistributedCapacityTeams, teamPartnerWishDisabled);
    return result;
  }
}

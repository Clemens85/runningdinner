package org.runningdinner.core.test.helper;

import java.util.Arrays;

import org.runningdinner.core.GenderAspect;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.RunningDinnerConfig;

public class Configurations {

	public static RunningDinnerConfig standardConfig = RunningDinnerConfig.newConfigurer().withEqualDistributedCapacityTeams(true).build();
	
  public static RunningDinnerConfig standardConfigWithMixedGender = RunningDinnerConfig
                                                                    .newConfigurer()
                                                                    .withEqualDistributedCapacityTeams(true)
                                                                    .withGenderAspects(GenderAspect.FORCE_GENDER_MIX)
                                                                    .build();
  
  public static RunningDinnerConfig standardConfigWithSameGender = RunningDinnerConfig
                                                                    .newConfigurer()
                                                                    .withEqualDistributedCapacityTeams(true)
                                                                    .withGenderAspects(GenderAspect.FORCE_SAME_GENDER)
                                                                    .build();
	
	public static RunningDinnerConfig standardConfigWithoutDistributing = RunningDinnerConfig.newConfigurer().withEqualDistributedCapacityTeams(
			false).withGenderAspects(GenderAspect.IGNORE_GENDER).build();
	
	 public static RunningDinnerConfig standardConfigWithoutDistributingButMixedGender = RunningDinnerConfig.newConfigurer().withEqualDistributedCapacityTeams(
     false).withGenderAspects(GenderAspect.FORCE_GENDER_MIX).build();
	
	public static RunningDinnerConfig customConfig = RunningDinnerConfig.newConfigurer().havingMeals(
			Arrays.asList(MealClass.APPETIZER(), MealClass.MAINCOURSE())).build();

}

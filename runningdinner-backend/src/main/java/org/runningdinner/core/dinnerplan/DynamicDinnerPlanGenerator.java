//package org.runningdinner.core.dinnerplan;
//
//import java.util.ArrayDeque;
//import java.util.ArrayList;
//import java.util.Collection;
//import java.util.HashMap;
//import java.util.HashSet;
//import java.util.LinkedHashSet;
//import java.util.List;
//import java.util.Map;
//import java.util.Map.Entry;
//import java.util.Queue;
//import java.util.Set;
//
//import org.runningdinner.core.GeneratedTeamsResult;
//import org.runningdinner.core.MealClass;
//import org.runningdinner.core.NoPossibleRunningDinnerException;
//import org.runningdinner.core.RunningDinnerConfig;
//import org.runningdinner.core.Team;
//import org.runningdinner.core.TeamCombinationInfo;
//import org.runningdinner.core.VisitationPlan;
//import org.runningdinner.core.util.CoreUtil;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//
//public class DynamicDinnerPlanGenerator implements DinnerPlanGenerator {
//
//	private static Logger LOGGER = LoggerFactory.getLogger(DynamicDinnerPlanGenerator.class);
//
//	@Override
//	public void generateDinnerExecutionPlan(GeneratedTeamsResult generatedTeams, RunningDinnerConfig runningDinnerConfig)
//			throws NoPossibleRunningDinnerException {
//		List<Team> regularTeams = generatedTeams.getRegularTeams();
//
//		TeamCombinationInfo teamCombinationInfo = generatedTeams.getTeamCombinationInfo();
//		final int teamSegmentSize = teamCombinationInfo.getTeamSegmentSize();
//
//		// Segment teams by meal to cook:
//		Map<MealClass, Queue<Team>> completeMealTeamMapping = new HashMap<MealClass, Queue<Team>>();
//		for (Team team : regularTeams) {
//			addTeamToMealMapping(team, completeMealTeamMapping);
//		}
//
//		// completeTealMapping contains now MealClass A, MealClass B, MealClass C, ... as keys.
//		// For every key there is mapped the list with teams that are assigned to the MealClass which is backed by the key.
//
//		final int numMealClasses = runningDinnerConfig.getMealClasses().size();
//		CoreUtil.assertSmaller(0, numMealClasses, "There must exist more than zero MealClasses");
//
//		// This should always equal to 3:
//		final int numTeamsNeededPerMealClass = teamSegmentSize / numMealClasses;
//
//		// Ensure that all teams are run through:
//		for (int totalUsedTeamCounter = 0; totalUsedTeamCounter < regularTeams.size();) {
//
//			// Take teams per meal-class, so that we reach #teamSegmentSize teams:
//			int usedTeamCounterPerSegment = 0;
//			Map<MealClass, Queue<Team>> segmentedMealTeamMapping = new HashMap<MealClass, Queue<Team>>(); // TODO: Actually we don't need a
//			// queue in here...
//			for (MealClass mealClass : completeMealTeamMapping.keySet()) {
//
//				Queue<Team> mappedTeamList = completeMealTeamMapping.get(mealClass);
//
//				// This a very small loop, as we have typically a very small numnber (in almost any case it should be 2)
//				for (int i = 0; i < numTeamsNeededPerMealClass; i++) {
//					// remove() throws exception if queue is empty, which should however not occur. Nevertheless we prevent endless loops by
//					// using this method:
//					Team team = mappedTeamList.remove();
//					addTeamToMealMapping(team, segmentedMealTeamMapping);
//					totalUsedTeamCounter++;
//					usedTeamCounterPerSegment++;
//				}
//
//				CoreUtil.assertSmallerOrEq(usedTeamCounterPerSegment, teamSegmentSize, "Number of used teams (" + usedTeamCounterPerSegment
//						+ ") may never exceed the teamSegmentSize which is " + teamSegmentSize);
//
//				if (usedTeamCounterPerSegment == teamSegmentSize) {
//					buildVisitationPlans(segmentedMealTeamMapping, runningDinnerConfig);
//					usedTeamCounterPerSegment = 0;
//				}
//
//			}
//		}
//
//		validateAllTeamsAreConsumed(completeMealTeamMapping);
//	}
//
//	// TODO: Must completely be revised!
//	private <T extends Collection<Team>> void buildVisitationPlans(final Map<MealClass, ? extends Collection<Team>> teamMealMapping,
//			final RunningDinnerConfig runningDinnerConfig) throws NoPossibleRunningDinnerException {
//
//		// Algorithm:
//		// Iterate through all teams:
//		// Rule #1: References between two teams are not permitted to be bidirectional (no parallel housing and guest reference)
//		// Rule #2: For every iterated team: Consider only teams from other meal-classes
//		// Rule #3 and goal: Every Team must have exactly #(meal-classes.size() -1) references in each direction (meaning e.g. 2
//		// host-references and 2 guest-references)
//
//		Set<MealClass> allMealClasses = teamMealMapping.keySet();
//		// Every team needs this number for both outgoing references (= active visits of other teams) and incoming references (= hosting of
//		// other teams)
//		final int numReferencesNeeded = allMealClasses.size() - 1; // for rule #3
//		if (numReferencesNeeded <= 0) {
//			throw new NoPossibleRunningDinnerException("There must be at least two meal types for having a running-dinner!");
//		}
//
//		List<LinkedHashSet<Team>> allTeamTupels = new ArrayList<LinkedHashSet<Team>>();
//
//		// Iterate thorough all teams by meal-class
//		for (Entry<MealClass, ? extends Collection<Team>> entry : teamMealMapping.entrySet()) {
//			MealClass currentMealClass = entry.getKey();
//			Collection<Team> teamsOfCurrentMealClass = entry.getValue();
//
//			Set<MealClass> otherMealClasses = CoreUtil.excludeFromSet(currentMealClass, allMealClasses); // for rule #2
//
//			// Iterate through all teams of current meal-class
//			for (Team teamOfCurrentMealClass : teamsOfCurrentMealClass) {
//				LOGGER.debug("Build Visitation-Plan for {}", teamOfCurrentMealClass);
//				VisitationPlan currentTeamVisitationPlan = teamOfCurrentMealClass.getVisitationPlan();
//
//				// Rule #3 is satisfied for this team:
//				if (numReferencesNeeded == currentTeamVisitationPlan.getNumberOfGuests()
//						&& numReferencesNeeded == currentTeamVisitationPlan.getNumberOfHosts()) {
//					LOGGER.debug("Visitation-Plan for {} is already built", teamOfCurrentMealClass);
//					// Visitation plan for this team is already complete
//					break;
//				}
//
//				LOGGER.debug("Iterate through teams of other meal-classes {}", otherMealClasses);
//
//				LinkedHashSet<Team> currentTeamTupel = new LinkedHashSet<Team>(3);
//				currentTeamTupel.add(teamOfCurrentMealClass);
//
//				// Iterate through all teams of other meal-classes:
//				for (MealClass otherMealClass : otherMealClasses) {
//
//					Collection<Team> teamsOfOtherMealClass = teamMealMapping.get(otherMealClass);
//					for (Team teamOfOtherMealClass : teamsOfOtherMealClass) {
//
//						LOGGER.debug("Check {}", teamOfOtherMealClass);
//						VisitationPlan otherClassifiedTeamVisitationPlan = teamOfOtherMealClass.getVisitationPlan();
//
//						if (otherClassifiedTeamVisitationPlan.containsGuestOrHostReference(teamOfCurrentMealClass)) {
//							LOGGER.debug("{} is already contained in Visitation-Plan of team {}", teamOfOtherMealClass,
//									teamOfCurrentMealClass);
//							continue; // Rule #1
//						}
//
//						if (canAddAsGuestReference(currentTeamVisitationPlan, otherClassifiedTeamVisitationPlan, currentMealClass,
//								numReferencesNeeded)) {
//
//							if (!haveTeamsMeetupAlready(teamOfCurrentMealClass, teamOfOtherMealClass, allTeamTupels, currentTeamTupel)) {
//								LOGGER.debug("Adding {} as guest to current team {}", teamOfOtherMealClass, teamOfCurrentMealClass);
//								// This makes current team the host of other meal-class team:
//								// teamOfOtherMealClass.getVisitationPlan().addHostTeam(teamOfCurrentMealClass);
//								currentTeamTupel.add(teamOfOtherMealClass);
//								break;
//							}
//							else {
//								LOGGER.debug("Team {} meets current team {} already", teamOfOtherMealClass, teamOfCurrentMealClass);
//							}
//						}
//					}
//
//				} // End iteration through teams with other meal-classes
//
//				Set<Team> blackList = new HashSet<Team>();
//				while (currentTeamTupel.size() < 3) { // TODO: 3 is hardcoded
//					Team lastTeamTupel = getAndRemoveLastTeamTupelElement(currentTeamTupel);
//					blackList.add(lastTeamTupel);
//
//					currentTeamTupel.clear();
//					currentTeamTupel.add(teamOfCurrentMealClass);
//
//					LOGGER.debug("Not enough teams found, reiterate with blackliust {}", blackList);
//					buildNewTeamTupel(teamOfCurrentMealClass, allTeamTupels, currentTeamTupel, otherMealClasses, teamMealMapping,
//							numReferencesNeeded, blackList);
//				}
//
//				LOGGER.debug("Add 3-tupel {} to allTeamTupels", currentTeamTupel);
//				allTeamTupels.add(currentTeamTupel);
//
//				Set<Team> guestTeams = CoreUtil.excludeFromSet(teamOfCurrentMealClass, currentTeamTupel);
//				for (Team guestTeam : guestTeams) {
//					guestTeam.getVisitationPlan().addHostTeam(teamOfCurrentMealClass);
//				}
//
//			} // End iteration through all teams of current meal-class
//		}
//	}
//
//	private Team getAndRemoveLastTeamTupelElement(LinkedHashSet<Team> teamTupel) {
//		Team result = null;
//		for (Team team : teamTupel) {
//			result = team;
//		}
//		return result;
//	}
//
//	private boolean haveTeamsMeetupAlready(Team teamOfCurrentMealClass, Team teamOfOtherMealClass, List<LinkedHashSet<Team>> allTeamTupels,
//			LinkedHashSet<Team> currentTeamTupel) {
//		Set<Team> alreadyMeetedTeams = getAlreadyMeetedTeams(teamOfCurrentMealClass, allTeamTupels);
//		if (alreadyMeetedTeams.contains(teamOfOtherMealClass)) {
//			return true;
//		}
//
//		Set<Team> alreadyMeetedTeamsOfOtherTeam = getAlreadyMeetedTeams(teamOfOtherMealClass, allTeamTupels);
//		if (alreadyMeetedTeamsOfOtherTeam.contains(teamOfCurrentMealClass)) {
//			return true;
//		}
//
//		Set<Team> currentTeamsToTest = CoreUtil.excludeFromSet(teamOfCurrentMealClass, currentTeamTupel);
//		for (Team currentTeamToTest : currentTeamsToTest) {
//			Set<Team> currentAlreadyMeetedTeams = getAlreadyMeetedTeams(currentTeamToTest, allTeamTupels);
//			if (currentAlreadyMeetedTeams.contains(teamOfOtherMealClass)) {
//				return true;
//			}
//		}
//
//		return false;
//	}
//
//	private Set<Team> getAlreadyMeetedTeams(final Team teamToTest, final List<LinkedHashSet<Team>> allTeamTupels) {
//		Set<Team> result = new HashSet<Team>();
//		for (Set<Team> teamTupel : allTeamTupels) {
//			if (teamTupel.contains(teamToTest)) {
//				result.addAll(teamTupel);
//			}
//		}
//
//		// When we added some tupels we also added the current testing team. So remove it again:
//		if (result.size() > 0) {
//			result.remove(teamToTest);
//		}
//
//		return result;
//	}
//
//	private void buildNewTeamTupel(final Team teamOfCurrentMealClass, List<LinkedHashSet<Team>> allTeamTupels,
//			final LinkedHashSet<Team> currentTeamTupel, final Set<MealClass> otherMealClasses,
//			final Map<MealClass, ? extends Collection<Team>> teamMealMapping, final int numReferencesNeeded, final Set<Team> blackList) {
//
//		// Iterate through all teams of other meal-classes:
//		for (MealClass otherMealClass : otherMealClasses) {
//
//			Collection<Team> teamsOfOtherMealClass = teamMealMapping.get(otherMealClass);
//			for (Team teamOfOtherMealClass : teamsOfOtherMealClass) {
//
//				LOGGER.debug("Check {}", teamOfOtherMealClass);
//				VisitationPlan otherClassifiedTeamVisitationPlan = teamOfOtherMealClass.getVisitationPlan();
//
//				if (otherClassifiedTeamVisitationPlan.containsGuestOrHostReference(teamOfCurrentMealClass)) {
//					LOGGER.debug("{} is already contained in Visitation-Plan of team {}", teamOfOtherMealClass, teamOfCurrentMealClass);
//					continue; // Rule #1
//				}
//
//				if (blackList.contains(teamOfOtherMealClass)) {
//					continue;
//				}
//
//				VisitationPlan currentTeamVisitationPlan = teamOfCurrentMealClass.getVisitationPlan();
//				if (canAddAsGuestReference(currentTeamVisitationPlan, otherClassifiedTeamVisitationPlan,
//						teamOfCurrentMealClass.getMealClass(), numReferencesNeeded)) {
//
//					if (!haveTeamsMeetupAlready(teamOfCurrentMealClass, teamOfOtherMealClass, allTeamTupels, currentTeamTupel)) {
//						LOGGER.debug("Adding {} as guest to current team {}", teamOfOtherMealClass, teamOfCurrentMealClass);
//						// This makes current team the host of other meal-class team:
//						// teamOfOtherMealClass.getVisitationPlan().addHostTeam(teamOfCurrentMealClass);
//						currentTeamTupel.add(teamOfOtherMealClass);
//						break;
//					}
//					else {
//						LOGGER.debug("Team {} meets current team {} already", teamOfOtherMealClass, teamOfCurrentMealClass);
//					}
//				}
//			}
//
//		} // End iteration through teams with other meal-classes
//
//	}
//
//	/**
//	 * Checks whether otherTeamPlan's team can be added as a guest to currentTeamPlan's team.
//	 *
//	 * @param currentTeamPlan The team for which to check that the passed otherTeam is added as guest
//	 * @param otherTeamPlan
//	 * @param mealClass
//	 * @param numReferencesNeeded
//	 * @return
//	 */
//	private boolean canAddAsGuestReference(VisitationPlan currentTeamPlan, VisitationPlan otherTeamPlan, MealClass mealClass,
//			int numReferencesNeeded) {
//		boolean needStillMoreReferences = currentTeamPlan.getNumberOfGuests() != numReferencesNeeded
//				&& otherTeamPlan.getNumberOfHosts() != numReferencesNeeded;
//		if (!needStillMoreReferences) {
//			return false;
//		}
//
//		if (otherTeamPlan.containsHostReferenceWithSameMealClass(mealClass)) {
//			return false;
//		}
//
//		return true;
//	}
//
//	private void addTeamToMealMapping(final Team team, final Map<MealClass, Queue<Team>> teamMealMapping) {
//		MealClass mealClass = team.getMealClass();
//		CoreUtil.assertNotNull(mealClass, "Team must have an assigned MealClass, but was null");
//		Queue<Team> mappedTeamList = teamMealMapping.get(mealClass);
//		if (mappedTeamList == null) {
//			mappedTeamList = new ArrayDeque<Team>();
//			teamMealMapping.put(mealClass, mappedTeamList);
//		}
//		mappedTeamList.add(team);
//	}
//
//	private static void validateAllTeamsAreConsumed(final Map<MealClass, Queue<Team>> completeMealTeamMapping) {
//		for (Entry<MealClass, Queue<Team>> entry : completeMealTeamMapping.entrySet()) {
//			Queue<Team> teamList = entry.getValue();
//			if (teamList.size() > 0) {
//				throw new RuntimeException("All teams must be consumed when building dinner visitation plans, but there still exist "
//						+ teamList.size() + " teams for MealClass " + entry.getKey());
//			}
//		}
//	}
//
//}

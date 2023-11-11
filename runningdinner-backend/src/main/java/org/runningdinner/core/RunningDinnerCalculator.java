package org.runningdinner.core;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.core.dinnerplan.DinnerPlanGenerator;
import org.runningdinner.core.dinnerplan.StaticTemplateDinnerPlanGenerator;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamAccessor;
import org.runningdinner.participant.rest.ParticipantTO;
import org.runningdinner.participant.rest.TeamTO;
import org.springframework.util.Assert;

/**
 * Stateless object for calculating running dinner scenarios.<br>
 * All needed items like the configuration of a dinner (meals, team-size, etc.) must be passed into the according methods.<br>
 * Main purpose is on the one hand to generate random teams out of the passed participants and on the other hand to create visitation-plans
 * (= dinner-routes) for each generated team.
 * 
 * @author Clemens Stich
 * 
 */
public class RunningDinnerCalculator {

  private DinnerPlanGenerator dinnerPlanGenerator;

  public RunningDinnerCalculator() {
    this(new StaticTemplateDinnerPlanGenerator());
  }

  public RunningDinnerCalculator(DinnerPlanGenerator dinnerPlanGenerator) {
    this.dinnerPlanGenerator = dinnerPlanGenerator;
  }

	/**
	 * Main entry point for calculation of a running dinner.<br>
	 * Based upon the passed participants and the dinner-options (e.g. team size, number of meals, ...) there is tried to assign each
	 * participant into teams.<br>
	 * If there are too few participants for at least one valid combination of teams then a NoPossiblerunningDinnerException is thrown. Thus
	 * the caller knows
	 * that it was not possible to assign any single passed participant into teams.<br>
	 * The returned GeneratedTeamsResult must be used afterwards for further operations like assigning meals to the teams or like finally
	 * building the dinner-execution-plan. <br>
	 * Note: The objects inside the GeneratedTeamsResult may be changed during other operations!
	 * 
	 * @param runningDinnerConfig The options for the running dinner
	 * @param participants All participants of the dinner
	 * @param existingTeamsToKeep Can be null or empty. Pass only if you have some already existing teams and want to keep those when now re-generating teams (useful for waitinglist)
	 * @return
	 * @throws NoPossibleRunningDinnerException If there are too few participants
	 */
	public GeneratedTeamsResult generateTeams(final RunningDinnerConfig runningDinnerConfig,
                                              final List<Participant> participants,
                                              final List<TeamTO> existingTeamsToKeep,
                                              final ParticipantListRandomizer participantListRandomizer) throws NoPossibleRunningDinnerException {

      int teamSize = runningDinnerConfig.getTeamSize();
      int numParticipants = participants.size();

      if (teamSize >= numParticipants) {
        throw new NoPossibleRunningDinnerException("There must be more participants as a team's size");
      }

      TeamCombinationInfo teamCombinationInfo = generateTeamCombinationInfo(participants, runningDinnerConfig);

      GeneratedTeamsResult result = new GeneratedTeamsResult();
      result.setTeamCombinationInfo(teamCombinationInfo);

      List<Participant> participantsToAssign = splitRegularAndIrregularParticipants(participants, result,
          runningDinnerConfig);

      List<Team> regularTeams;

      if (CollectionUtils.isEmpty(existingTeamsToKeep)) {
        regularTeams = buildRegularTeams(runningDinnerConfig, participantsToAssign, participantListRandomizer);
      } else {
        List<Participant> participantsFromExistingTeams = getParticipantsFromExistingTeams(participantsToAssign,
            existingTeamsToKeep);
        regularTeams = buildRegularTeams(runningDinnerConfig, participantsFromExistingTeams, participantListRandomizer);
        Set<Participant> newParticipantsFromWaitingList = CoreUtil.excludeMultipleFromSet(participantsFromExistingTeams,
            new HashSet<>(participantsToAssign));

        int teamNumberOffset = regularTeams.size() + 1;

        List<Team> newTeams = buildRegularTeams(runningDinnerConfig, new ArrayList<>(newParticipantsFromWaitingList),
            participantListRandomizer);
        for (Team newTeam : newTeams) {
          TeamAccessor
              .newAccessor(newTeam)
              .setTeamNumber(teamNumberOffset++);
          regularTeams.add(newTeam);
        }
      }

      result.setRegularTeams(regularTeams);

      return result;
    }

	private static List<Participant> getParticipantsFromExistingTeams(List<Participant> allParticipantsToUse, List<TeamTO> existingTeamInfosToRestore) {
		
		Set<Participant> allParticipantsAsSet = new HashSet<>(allParticipantsToUse);
		
		Set<Participant> result = existingTeamInfosToRestore
									.stream()
									.map(existingTeam -> findTeamMembersInGivenParticipants(existingTeam, allParticipantsAsSet))
									.flatMap(Set::stream)
									.collect(Collectors.toSet());

		return new ArrayList<>(result);
	}
	
	private static Set<Participant> findTeamMembersInGivenParticipants(TeamTO existingTeam, Set<Participant> givenParticipants) {
		
		Set<Participant> result = new HashSet<>();
		
		List<ParticipantTO> teamMembers = existingTeam.getTeamMembers();

		for (ParticipantTO teamMember : teamMembers) {
			for (Participant p : givenParticipants) {
				if (p.isSameId(teamMember.getId())) {
					result.add(p);
					break;
				}
			}
		}
			
		return result;
	}

	/**
	 * Returns a list with all participants that cannot be assigned into regular teams based upon the current dinner configuration.<br>
	 * It all participants can successfully be assigned, then an empty list is returned.<br>
	 * If not any participant can be assigned (e.g. too few participants) all passed participants are returned<br>
	 * 
	 * @param runningDinnerConfig
	 * @param participants
	 * @return
	 */
	public List<Participant> calculateNotAssignableParticipants(final BasicRunningDinnerConfiguration runningDinnerConfig,
			final List<Participant> participants) {
		try {
			TeamCombinationInfo teamCombinationInfo = generateTeamCombinationInfo(participants, runningDinnerConfig);
			int numOfNotAssignableParticipants = calculateNumberOfNotAssignableParticipants(participants, teamCombinationInfo,
					runningDinnerConfig);
			if (numOfNotAssignableParticipants <= 0) {
				return Collections.emptyList();
			}

			int splitIndex = participants.size() - numOfNotAssignableParticipants;
			CoreUtil.assertNotNegative(splitIndex, "SplitIndex may never be negative, but was " + splitIndex);
			return new ArrayList<Participant>(participants.subList(splitIndex, participants.size()));
		}
		catch (NoPossibleRunningDinnerException e) {
			// Return all participants
			return new ArrayList<Participant>(participants);
		}
	}

	/**
	 * Takes all participants and splits them (only if necessary) so that e.g. for an odd participant-list the last participant is excluded
	 * (if teamSize is e.g. 2).<br>
	 * Furthermore it is computed how many teams are needed for building a valid dinner execution plan that satifies all rules for a running
	 * dinner. It may happen that this also results in splitting some
	 * participants, so that the correct number of participants is returned for building the needed number of teams.
	 * 
	 * @param allParticipants All participants that were given in for building a running dinner
	 * @param generatedTeamsResult Is enriched with all participants that cannot be assigend to teams (if any).
	 * @param runningDinnerConfig
	 * @return
	 * @throws IllegalArgumentException If there occurs computation errors when splitting the list (should never happen actually)
	 */
	private List<Participant> splitRegularAndIrregularParticipants(final List<Participant> allParticipants,
			final GeneratedTeamsResult generatedTeamsResult, final RunningDinnerConfig runningDinnerConfig) {

		TeamCombinationInfo teamCombinationInfo = generatedTeamsResult.getTeamCombinationInfo();

		// This will be the count of participants that cannot be assigned and must therefore be substracted from the participant-list before
		// building teams:
		int numIrregularParticipants = calculateNumberOfNotAssignableParticipants(allParticipants, teamCombinationInfo, runningDinnerConfig);

		if (numIrregularParticipants > 0) {
			// Split participant list in participants that can be assigned to teams and those who must be excluded:
			List<Participant> participantsToAssign = allParticipants;
			int splitIndex = allParticipants.size() - numIrregularParticipants;
			CoreUtil.assertNotNegative(splitIndex, "SplitIndex may never be negative, but was " + splitIndex);
			participantsToAssign = allParticipants.subList(0, splitIndex);
			CoreUtil.assertSmaller(splitIndex, allParticipants.size(), "SplitIndex (" + splitIndex
					+ ") must be smaller as complete participant list-size (" + allParticipants.size() + ")");
			List<Participant> notAssignedParticipants = new ArrayList<Participant>(allParticipants.subList(splitIndex,
					allParticipants.size()));
			generatedTeamsResult.setNotAssignedParticipants(notAssignedParticipants);
			return participantsToAssign;
		}
		else {
			return allParticipants;
		}
	}

	protected TeamCombinationInfo generateTeamCombinationInfo(final List<Participant> allParticipants,
			final BasicRunningDinnerConfiguration runningDinnerConfig) throws NoPossibleRunningDinnerException {

		int numberOfTeams = allParticipants.size() / runningDinnerConfig.getTeamSize();
		TeamCombinationInfo teamCombinationInfo = runningDinnerConfig.generateTeamCombinationInfo(numberOfTeams);
		return teamCombinationInfo;
	}

	protected int calculateNumberOfNotAssignableParticipants(final List<Participant> allParticipants,
			final TeamCombinationInfo teamCombinationInfo, final BasicRunningDinnerConfiguration runningDinnerConfig) {

		// This will be the count of participants that cannot be assigned and must therefore be substracted from the participant-list before
		// building teams:
		int numIrregularParticipants = 0;

		// This is the number of teams that cannot be correctly assigned to a dinner execution plan without violating the rules:
		int numRemaindingTeams = teamCombinationInfo.getNumRemaindingTeams();
		if (numRemaindingTeams > 0) {
			int numRemaindingParticipants = numRemaindingTeams * runningDinnerConfig.getTeamSize();
			numIrregularParticipants = numRemaindingParticipants;
		}

		// This will typically be 0 (= all participants can put into teams => even number of participants) or 1 (odd number of
		// participants), or any other number for any teamSize != 2:
		int numParticipantOffset = allParticipants.size() % runningDinnerConfig.getTeamSize();
		if (numParticipantOffset > 0) {
			numIrregularParticipants += numParticipantOffset;
		}

		return numIrregularParticipants;
	}

	/**
	 * Uses the passed mealClasses and assigns randomly each team one mealClass.
	 * 
	 * @param generatedTeams Contains all regular teams that shall be assigned random meals
	 * @param mealClasses The Meals to be assigned
	 * @param existingTeamsToKeep Optional parameter if there existed already teams before (which is the case for waitinglist regeneration scenarios). 
	 * 														If passed then this method assignsthe same meals again to the teams that already existed.
	 * @throws NoPossibleRunningDinnerException Thrown if number of meals and number of teams are incompatible
	 */
	public void assignRandomMealClasses(final GeneratedTeamsResult generatedTeams, 
										final Collection<MealClass> mealClasses,
										final List<TeamTO> existingTeamsToKeep) throws NoPossibleRunningDinnerException {

      if (CollectionUtils.isEmpty(existingTeamsToKeep)) {
        assignRandomMealClasses(generatedTeams.getRegularTeams(), mealClasses);
        return;
      }

      // => Else: Keep meals for existing meals, but also assign random meals to new
      // generated teams:

      // Copy the list of teams...
      List<Team> regularTeamsListCopy = new ArrayList<>(generatedTeams.getRegularTeams());

      // ... And change the participants inside of this list
      // Note: all these changes are still reflected in the original list
      // (generatedTeams.regularTeams())!
      
      Set<Participant> allParticipantsOfGeneratedTeams = generatedTeams.getRegularTeams()
                                                                          .stream()
                                                                          .map(t -> t.getTeamMembers())
                                                                          .flatMap(Set::stream)
                                                                          .collect(Collectors.toSet());

      for (TeamTO existingTeam : existingTeamsToKeep) {
        // This whole logic works only if we have ensured that there exist no team with
        // cancelled team member(s), which is currently the case (-> WaitingListService)
        Team team = findTeamWithTeamNumber(regularTeamsListCopy, existingTeam.getTeamNumber());
        MealClass mealClassToAssign = IdentifierUtil.filterListForIdMandatory(mealClasses, existingTeam.getMeal().getId());
        team.setMealClass(mealClassToAssign);
        
        ensureSameTeamMembers(team, existingTeam, allParticipantsOfGeneratedTeams);
        
        regularTeamsListCopy.remove(team); // This removes the team only from our copied list, but not from the original list!
      }

      // regularTeamsListCopy should now contain only the new teams that did not exist before:
      assignRandomMealClasses(regularTeamsListCopy, mealClasses);
	}

    private void ensureSameTeamMembers(Team currentTeam, TeamTO originalTeam, Set<Participant> allParticipantsOfGeneratedTeams) {
      
      Set<UUID> originalTeamMemberIds = IdentifierUtil.getIds(originalTeam.getTeamMembers());
      Set<UUID> currentTeamMemberIds = IdentifierUtil.getIds(currentTeam.getTeamMembers());
      if (CoreUtil.setsAreEqual(originalTeamMemberIds, currentTeamMemberIds)) {
        return;
      }

      Set<Participant> originalTeamMembers = IdentifierUtil.filterListForIds(allParticipantsOfGeneratedTeams, originalTeamMemberIds);
      TeamAccessor.newAccessor(currentTeam).removeAllTeamMembers();
      currentTeam.setTeamMembers(originalTeamMembers);
      
      Assert.state(currentTeam.getTeamMembersOrdered().size() == originalTeamMemberIds.size(), "Expected curren team " + currentTeam + " to contain team members " + originalTeamMemberIds + 
                                                                                               " but contained " + currentTeam.getTeamMembersOrdered());
    }
    
    private void assignRandomMealClasses(final List<Team> regularTeams, final Collection<MealClass> mealClasses)
        throws NoPossibleRunningDinnerException {

      int numTeams = regularTeams.size();
      int numMealClasses = mealClasses.size();

      if (numTeams % numMealClasses != 0) {
        throw new NoPossibleRunningDinnerException(
            "Size of passed teams (" + numTeams + ") doesn't match expected size (" + numMealClasses + " x N)");
      }

      if (numMealClasses == 0) {
        throw new NoPossibleRunningDinnerException("Need at least one mealClass for assigning mealClasses to teams");
      }

      int segmentionSize = numTeams / numMealClasses;

      Collections.shuffle(regularTeams); // Randomize List

      // Now, with the randomized list, we iterate this list, and assign one mealClass
      // to the current iterating list-segment
      // (e.g.: // [0..8] => APPETIZER, [9..17] => MAINCOURSE, [18..26] => DESSERT)
      // for 18 teams and a segmentionSize of 3:
      int startIndex = 0;
      int endIndex = segmentionSize;
      for (MealClass mealClassToAssign : mealClasses) {
        for (int teamIndex = startIndex; teamIndex < endIndex; teamIndex++) {
          Team team = regularTeams.get(teamIndex);
          team.setMealClass(mealClassToAssign);
        }

        startIndex = endIndex;
        endIndex = endIndex + segmentionSize;
      }

      // Sort list by teamNumber as the list is currently passed in already sorted by
      // teamNumber
      Collections.sort(regularTeams);
    }

    protected List<Team> buildRegularTeams(final RunningDinnerConfig runningDinnerConfig,
                                           final List<Participant> participantsToAssign,
                                           final ParticipantListRandomizer participantListRandomizer) {

      if (CoreUtil.isEmpty(participantsToAssign)) {
        return new ArrayList<Team>(0);
      }

      participantListRandomizer.shuffle(participantsToAssign);

      TeamDistributorHosting teamDistributorHosting = new TeamDistributorHosting(participantsToAssign,
          runningDinnerConfig);
      List<Team> teams = teamDistributorHosting.calculateTeams();

      TeamDistributorGender teamDistributorGender = new TeamDistributorGender(teams, runningDinnerConfig);
      teams = teamDistributorGender.calculateTeams();

      for (Team team : teams) {
        setHostingParticipant(team, runningDinnerConfig);
      }

      return teams;
    }

	/**
	 * Sets one participant in the team as the hosting participant.
	 * This is done with some intelligence so it is firstly tried to set a participant as hosting participant if he has enough seats.<br>
	 * As a fallback the first participant is just taken.
	 * 
	 * @param team
	 * @param runningDinnerConfig
	 */
	public void setHostingParticipant(Team team, RunningDinnerConfig runningDinnerConfig) {
		Participant participantWithUnknownHostingStatus = null;

		for (Participant teamMember : team.getTeamMembers()) {
			FuzzyBoolean canHost = runningDinnerConfig.canHost(teamMember);
			if (FuzzyBoolean.TRUE == canHost) {
				teamMember.setHost(true);
				return;
			}
			if (FuzzyBoolean.UNKNOWN == canHost) {
				participantWithUnknownHostingStatus = teamMember;
			}
		}

		// First fallback: Take one participant with unknown hosting status:
		if (participantWithUnknownHostingStatus != null) {
			participantWithUnknownHostingStatus.setHost(true);
			return;
		}

		// Last fallback, just pick up the first matching participant:
		Participant firstTeamMember = team.getTeamMembers().iterator().next();
		firstTeamMember.setHost(true);
	}

	/**
	 * Final (and main) method which assigns every regular team a VisitationPlan which indicats which teams are guests and hosts for every
	 * regular team.
	 *
	 * @param generatedTeams
	 * @param runningDinnerConfig
	 * @throws NoPossibleRunningDinnerException
	 * @throws IllegalArgumentException If some pre-condition is not met in the passed parameters
	 */
	public void generateDinnerExecutionPlan(final GeneratedTeamsResult generatedTeams, final RunningDinnerConfig runningDinnerConfig)
			throws NoPossibleRunningDinnerException {

		dinnerPlanGenerator.generateDinnerExecutionPlan(generatedTeams, runningDinnerConfig);
	}

	public interface ParticipantListRandomizer {

	  void shuffle(List<Participant> participants);
  }
	
	private static Team findTeamWithTeamNumber(List<Team> incomingTeams, int teamNumber) {

		return incomingTeams
						.stream()	
						.filter(t -> t.getTeamNumber() == teamNumber)
						.findFirst()
						.orElseThrow(() -> new IllegalStateException("Could not find team with number " + teamNumber + " in " + incomingTeams));
	}

}

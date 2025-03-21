package org.runningdinner.participant;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.RunningDinnerSessionData;
import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.activity.ActivityType;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerCalculator;
import org.runningdinner.event.WaitingListParticipantsAssignedEvent;
import org.runningdinner.event.WaitingListTeamsGeneratedEvent;
import org.runningdinner.event.publisher.EventPublisher;
import org.runningdinner.participant.rest.ParticipantTO;
import org.runningdinner.participant.rest.TeamParticipantsAssignmentTO;
import org.runningdinner.participant.rest.TeamTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

import java.util.*;
import java.util.Map.Entry;
import java.util.stream.Collectors;

@Service
public class WaitingListService {

    private static final Logger LOGGER = LoggerFactory.getLogger(WaitingListService.class);
  
	private final TeamService teamService;
	
	private final RunningDinnerService runningDinnerService;
	
	private final ParticipantService participantService;

	private final LocalizationProviderService localizationProviderService;

	private final RunningDinnerCalculator runningDinnerCalculator;

	private final TeamRepository teamRepository;

	private final ActivityService activityService;

	private final EventPublisher eventPublisher;

    private final ParticipantRepository participantRepository;

    public WaitingListService(TeamService teamService,
                              TeamRepository teamRepository,
                              ParticipantRepository participantRepository,
                              RunningDinnerService runningDinnerService,
                              ParticipantService participantService,
                              LocalizationProviderService localizationProviderService,
                              RunningDinnerCalculator runningDinnerCalculator,
                              ActivityService activityService,
                              EventPublisher eventPublisher) {

		this.teamService = teamService;
		this.teamRepository = teamRepository;
		this.participantRepository = participantRepository;
		this.runningDinnerService = runningDinnerService;
		this.participantService = participantService;
		this.localizationProviderService = localizationProviderService;
		this.runningDinnerCalculator = runningDinnerCalculator;
		this.activityService = activityService;
		this.eventPublisher = eventPublisher;
	}

	public WaitingListData findWaitingListData(@ValidateAdminId String adminId) {
    
		WaitingListData result = new WaitingListData();
		
    final RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    final List<Participant> participantsWithoutTeam = participantService.findActiveParticipantsNotAssignedToTeam(adminId);
		
		int nextParticipantsOffsetSize = getNextParticipantsOffsetSize(runningDinner);
		
		final int factor = participantsWithoutTeam.size() / nextParticipantsOffsetSize;
		
		int numMissingParticipantsForFullTeamArrangement;
	  List<Participant> remainingParticipants;
	  List<Participant> participtantsForTeamArrangement;
		
	  if (factor == 0) {
	  	numMissingParticipantsForFullTeamArrangement = nextParticipantsOffsetSize - participantsWithoutTeam.size();
	  	participtantsForTeamArrangement = Collections.emptyList();
	  	remainingParticipants = participantsWithoutTeam;
	  } else {
	  	int numParticipantsToTake = factor * nextParticipantsOffsetSize;
		  Assert.state(numParticipantsToTake <= participantsWithoutTeam.size(), "numParticipantsToTake " + numParticipantsToTake + " is greather than size of participants without a team (" + participantsWithoutTeam.size() + "). " +
		  																																		  "(Factor was " + factor + ")");
		  remainingParticipants = Collections.emptyList();
		  if (numParticipantsToTake != participantsWithoutTeam.size()) {
		  	remainingParticipants = participantsWithoutTeam.subList(numParticipantsToTake, participantsWithoutTeam.size());
		  }
		  
		  participtantsForTeamArrangement = participantsWithoutTeam.subList(0, numParticipantsToTake);
		  
		  numMissingParticipantsForFullTeamArrangement = remainingParticipants.size() == 0 ? 0 : nextParticipantsOffsetSize - remainingParticipants.size();
	  }
	  
	  List<Team> teamsWithCancelStatusOrCancelledMembers = teamService.findTeamArrangementsWaitingListFillable(adminId);
	  int numberOfTeams = teamService.getNumberOfTeams(adminId);

	  int teamSize = runningDinner.getConfiguration().getTeamSize();
	  
	  result.setNumMissingParticipantsForFullTeamArrangement(numMissingParticipantsForFullTeamArrangement);
	  result.setParticiptantsForTeamArrangement(ParticipantTO.convertParticipantList(participtantsForTeamArrangement));
	  result.setRemainingParticipants(ParticipantTO.convertParticipantList(remainingParticipants));
	  result.setTeamsWithCancelStatusOrCancelledMembers(TeamTO.convertTeamList(teamsWithCancelStatusOrCancelledMembers));
		result.setTotalNumberOfMissingTeamMembers(calculateTotalNumberOfMissingTeamMembers(teamsWithCancelStatusOrCancelledMembers, teamSize));
	  result.setTeamsGenerated(numberOfTeams > 0);
	  result.setPossibleActions(calculatePossibleActions(result));
	  return result;
	  
	}
	
	@Transactional
	public WaitingListActionResult generateNewTeams(@ValidateAdminId String adminId, List<ParticipantTO> incomingParticipants) {
		
      Set<UUID> participantIds = IdentifierUtil.getIds(incomingParticipants);
      List<Participant> participants = participantService.findParticipantsByIds(adminId, participantIds);
      Assert.state(participants.size() == incomingParticipants.size(), "Not all participants were found for " + participantIds + ": " + participants);

      for (Participant p : participants) {
        Assert.isNull(p.getTeamId(), "Expected " + p + " to have no team assigenment, but is in team " + p.getTeamId());
      }

      RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
      int nextParticipantsOffsetSize = getNextParticipantsOffsetSize(runningDinner);
		
      List<Team> teamsWithCancelStatusOrCancelledMembers = teamService.findTeamArrangementsWaitingListFillable(adminId);
      int totalNumberOfMissingTeamMembers = calculateTotalNumberOfMissingTeamMembers(teamsWithCancelStatusOrCancelledMembers, runningDinner.getConfiguration().getTeamSize());

      int numParticipantsForNewTeams = participants.size();
      if (numParticipantsForNewTeams < (nextParticipantsOffsetSize + totalNumberOfMissingTeamMembers)) {
        throw new ValidationException(new IssueList(new Issue(IssueKeys.INVALID_SIZE_WAITINGLIST_PARTICIPANTS_TO_GENERATE_TEAMS_TOO_FEW, IssueType.VALIDATION)));
      }

      int remainder = (numParticipantsForNewTeams - totalNumberOfMissingTeamMembers) % nextParticipantsOffsetSize;
      if (remainder != 0) {
        throw new ValidationException(new IssueList(new Issue(IssueKeys.INVALID_SIZE_WAITINGLIST_PARTICIPANTS_TO_GENERATE_TEAMS, IssueType.VALIDATION)));
      }

      checkTeamGenerationWithParticipantsDoesNotDestroyTeamPartnerRegistrations(participants);
      
      List<Activity> activities = findRelevantActivities(adminId);

      List<TeamTO> affectedTeams = teamService.dropAndReCreateTeamAndVisitationPlans(adminId, participants).getTeams();
      if (needToKeepExistingTeams(activities)) {
        affectedTeams = filterTeamsByContainedTeamMembers(affectedTeams, participantIds);
      } 

      emitWaitingListEventAfterCommit(new WaitingListTeamsGeneratedEvent(this, affectedTeams, runningDinner));

      return new WaitingListActionResult(affectedTeams, activities);
    }

	private static void checkTeamGenerationWithParticipantsDoesNotDestroyTeamPartnerRegistrations(List<Participant> participants) {
      
	  List<Participant> participantsWithTeamPartnerRegistration = ParticipantService.filterParticipantsWithTeamPartnerRegistration(participants);
	  
	  Map<UUID, List<Participant>> participantsByTeamPartnerRegistrationOriginatorId = new HashMap<>();
	  for (Participant p : participantsWithTeamPartnerRegistration) {
	    List<Participant> participantList = participantsByTeamPartnerRegistrationOriginatorId.getOrDefault(p.getTeamPartnerWishOriginatorId(), new ArrayList<>(2));
	    participantsByTeamPartnerRegistrationOriginatorId.put(p.getTeamPartnerWishOriginatorId(), participantList);
	    participantList.add(p);
	  }
	  
	  for (Entry<UUID, List<Participant>> entry : participantsByTeamPartnerRegistrationOriginatorId.entrySet()) {
	    List<Participant> teamPartnerRegistationParticipants = entry.getValue();
	    if (teamPartnerRegistationParticipants.size() != 2) {
	      LOGGER.error("Cannot use {} for new teams generation in waitinglist, due to the teamPartnerWishOriginatorIds are not consistent (tpwoid = {})", 
	                    teamPartnerRegistationParticipants, entry.getKey());
	      throw new ValidationException(new IssueList(new Issue(IssueKeys.INVALID_WAITINGLIST_TEAMGENERATION_INCONSISTENT_TEAMPARTNER_WISH, IssueType.VALIDATION)));
	    }
	  }
    }

	@Transactional
	public WaitingListActionResult assignParticipantsToExistingTeams(@ValidateAdminId String adminId, List<TeamParticipantsAssignmentTO> teamParticipantsAssignments) {
		
		List<TeamParticipantsAssignmentTO> teamParticipantsAssignmentsToApply = teamParticipantsAssignments
																					.stream()
																					.filter(tpa -> CollectionUtils.isNotEmpty(tpa.getParticipantIds()))
																					.collect(Collectors.toList());
		
		validateNoDuplicatedParticipantIds(teamParticipantsAssignmentsToApply);

		validateAtLeastOneIncomingParticipantId(teamParticipantsAssignmentsToApply);
		
		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
		
		List<Team> affectedTeams = new ArrayList<>();
		for (TeamParticipantsAssignmentTO singleTeamParticipantsAssignment : teamParticipantsAssignmentsToApply) {
		  affectedTeams.add(assignParticipantsToExistingTeam(runningDinner, singleTeamParticipantsAssignment.getTeamId(), singleTeamParticipantsAssignment.getParticipantIds()));
		}
		
		List<Activity> activities = findRelevantActivities(adminId);
		
		emitWaitingListEventAfterCommit(new WaitingListParticipantsAssignedEvent(this, affectedTeams, runningDinner));
		
		return new WaitingListActionResult(TeamTO.convertTeamList(affectedTeams), activities);
	}
	
	private void validateAtLeastOneIncomingParticipantId(List<TeamParticipantsAssignmentTO> teamParticipantsAssignmentsToApply) {

		if (CollectionUtils.isEmpty(teamParticipantsAssignmentsToApply)) {
			throw new ValidationException(new IssueList(new Issue(IssueKeys.INVALID_SIZE_WAITINGLIST_PARTICIPANTS_TO_ASSIGN, IssueType.VALIDATION)));
		}
	}

	private static void validateNoDuplicatedParticipantIds(List<TeamParticipantsAssignmentTO> teamParticipantsAssignments) {
		
		List<UUID> allSentParticipantIds = teamParticipantsAssignments
																				.stream()
																				.map(TeamParticipantsAssignmentTO::getParticipantIds)
																				.flatMap(List::stream)
																				.collect(Collectors.toList());

		Set<UUID> allSentParticipantIdsAsSet = new HashSet<>(allSentParticipantIds);
		Assert.state(allSentParticipantIdsAsSet.size() == allSentParticipantIds.size(), teamParticipantsAssignments + " contained duplicated participantIds");
	}

	private Team assignParticipantsToExistingTeam(RunningDinner runningDinner, UUID teamId, List<UUID> participantIds) {
		
      String adminId = runningDinner.getAdminId();

      final int teamSize = runningDinner.getConfiguration().getTeamSize();

      Team team = teamService.findTeamByIdWithTeamMembers(adminId, teamId);
      Assert.state(team.getTeamMembersOrdered().size() < teamSize,
          team + " is not allowed to be in status OK, but must either be cancelled or have a cancelled team member");

      List<Participant> participantsToAssign = findParticipantsToAssign(adminId, participantIds);
      teamService.checkReplacementNotDestroyingTeamPartnerRegistration(participantsToAssign);
      
      List<Participant> teamMembers = team.getTeamMembersOrdered();
      teamMembers.addAll(participantsToAssign);
      Assert.state(teamMembers.size() <= teamSize,
          "Team " + teamId + " can not have more than " + teamSize + " members, but tried to set " + teamMembers);
		
      team.setTeamMembers(new HashSet<>(teamMembers));
      runningDinnerCalculator.setHostingParticipant(team, runningDinner.getConfiguration());
      team.setStatus(team.getStatus() == TeamStatus.CANCELLED ? TeamStatus.REPLACED : TeamStatus.OK);
    
      Assert.notNull(team.getHostTeamMember(), "Expected " + team + " to have one host team member");
      Participant hostTeamMember = team.getHostTeamMember();
      participantRepository.save(hostTeamMember);
      return teamRepository.save(team);
	}
	
	private List<Participant> findParticipantsToAssign(String adminId, List<UUID> participantIds) {

		List<Participant> participantsToAssign = participantService.findParticipantsByIds(adminId, new HashSet<>(participantIds));
		Assert.state(participantsToAssign.size() == participantIds.size(), "Could not find all participants for " + participantIds);
		
		for (Participant p : participantsToAssign) {
			Assert.isNull(p.getTeamId(), "Expected " + p + " to be not member of a team, but is in " + p.getTeamId());
		}
		
		return participantsToAssign;
	}
	
	private List<WaitingListAction> calculatePossibleActions(WaitingListData waitingListData) {
		
		List<WaitingListAction> result = new ArrayList<>();
		
		boolean hasParticipantsOnWaitingList = CollectionUtils.isNotEmpty(waitingListData.getParticiptantsForTeamArrangement()) || CollectionUtils.isNotEmpty(waitingListData.getRemainingParticipants());
		if (!hasParticipantsOnWaitingList || !waitingListData.isTeamsGenerated()) {
			return result;
		}
		
		if (CollectionUtils.isNotEmpty(waitingListData.getTeamsWithCancelStatusOrCancelledMembers())) {
			result.add(WaitingListAction.ASSIGN_TO_EXISTING_TEAMS);
		}
		if (CollectionUtils.isNotEmpty(waitingListData.getParticiptantsForTeamArrangement())) {
			result.add(WaitingListAction.GENERATE_NEW_TEAMS);
		}

		if (result.size() == 0) {
			result.add(WaitingListAction.DISTRIBUTE_TO_TEAMS);
		}
		
		return result;
	}

	private int getNextParticipantsOffsetSize(RunningDinner runningDinner) {
		
		RunningDinnerSessionData runningDinnerSessionData = runningDinnerService.calculateSessionData(runningDinner, localizationProviderService.getLocaleOfDinner(runningDinner));
		int nextParticipantsOffsetSize = runningDinnerSessionData.getAssignableParticipantSizes().getNextParticipantsOffsetSize();
		Assert.state(nextParticipantsOffsetSize > 0, "Unexpected Error: nextParticipantsOffsetSize was <= 0");
		return nextParticipantsOffsetSize;
	}
	
	private int calculateTotalNumberOfMissingTeamMembers(List<Team> teams, int teamSize) {
		
		Integer result = teams
											.stream()
											.map(t -> Math.max(0, teamSize - t.getTeamMembersOrdered().size()))
											.reduce(0, Integer::sum);
		return result;
	}
	

	private static List<TeamTO> filterTeamsByContainedTeamMembers(List<TeamTO> teams, Set<UUID> teamMemberIdsToFilter) {
		
		List<TeamTO> result = new ArrayList<TeamTO>();
		
		for (TeamTO team : teams) {
			Set<UUID> teamMemberIds = IdentifierUtil.getIds(team.getTeamMembers());
			if (CollectionUtils.containsAny(teamMemberIds, teamMemberIdsToFilter)) {
				result.add(team);
			}
		}
		
		return result;
	}

  protected void emitWaitingListEventAfterCommit(ApplicationEvent event) {

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
      @Override
      public void afterCommit() {
        eventPublisher.notifyEvent(event);
      }
    });
  }
	
	private List<Activity> findRelevantActivities(String adminId) {
		return activityService.findActivitiesByTypes(adminId, ActivityType.DINNERROUTE_MAIL_SENT, ActivityType.TEAMARRANGEMENT_MAIL_SENT, ActivityType.CUSTOM_ADMIN_CHANGE);
	}

	private static boolean needToKeepExistingTeams(List<Activity> activities) {
		
		if (ActivityService.containsActivityType(activities, ActivityType.TEAMARRANGEMENT_MAIL_SENT) ||
				ActivityService.containsActivityType(activities, ActivityType.DINNERROUTE_MAIL_SENT)) {
			return true;
		}

		boolean hasRelevantAdminChange = activities
																			.stream()
																			.anyMatch(ac -> StringUtils.equals(ac.getActivityHeadline(), ActivityService.TEAM_MEMBERS_SWAPPED_HEADLINE) || 
																											StringUtils.equals(ac.getActivityHeadline(), ActivityService.TEAM_HOST_CHANGED_BY_ADMIN_HEADLINE));
		return hasRelevantAdminChange;
	}
	
}

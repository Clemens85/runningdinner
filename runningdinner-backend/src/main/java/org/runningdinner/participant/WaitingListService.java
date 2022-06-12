package org.runningdinner.participant;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.admin.RepositoryUtil;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.RunningDinnerSessionData;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerCalculator;
import org.runningdinner.participant.rest.ParticipantTO;
import org.runningdinner.participant.rest.TeamParticipantsAssignmentTO;
import org.runningdinner.participant.rest.TeamTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

@Service
public class WaitingListService {

	private TeamService teamService;
	
	private RunningDinnerService runningDinnerService;
	
	private ParticipantService participantService;

	private LocalizationProviderService localizationProviderService;

	private RunningDinnerCalculator runningDinnerCalculator;

	private TeamRepository teamRepository;
	
	@Autowired
	public WaitingListService(TeamService teamService, 
			 										  TeamRepository teamRepository,
														RunningDinnerService runningDinnerService, 
														ParticipantService participantService, 
														LocalizationProviderService localizationProviderService,
													  RunningDinnerCalculator runningDinnerCalculator) {

		this.teamService = teamService;
		this.teamRepository = teamRepository;
		this.runningDinnerService = runningDinnerService;
		this.participantService = participantService;
		this.localizationProviderService = localizationProviderService;
		this.runningDinnerCalculator = runningDinnerCalculator;
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
	
	public void generateNewTeams(@ValidateAdminId String adminId, List<ParticipantTO> incomingParticipants) {
		
		Set<UUID> participantIds = RepositoryUtil.getIds(incomingParticipants);
		List<Participant> participants = participantService.findParticipantsByIds(adminId, participantIds);
		Assert.state(participants.size() == incomingParticipants.size(), "Not all participants were found for " + participantIds  + ": " +  participants);
		
		for (Participant p : participants) {
			Assert.isNull(p.getTeamId(), "Expected " + p + " to have no team assigenment, but is in team " + p.getTeamId());
		}
		
		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
		int nextParticipantsOffsetSize = getNextParticipantsOffsetSize(runningDinner);
		
		int numParticipantsForNewTeams = participants.size();
		if (numParticipantsForNewTeams < nextParticipantsOffsetSize) {
			throw new ValidationException(new IssueList(new Issue("Too few", IssueType.VALIDATION)));
		}
		
		int remainder = numParticipantsForNewTeams % nextParticipantsOffsetSize;
		if (remainder != 0) {
			throw new ValidationException(new IssueList(new Issue("Must be nth of 6", IssueType.VALIDATION)));
		}
		
		try {
			teamService.dropAndReCreateTeamAndVisitationPlans(adminId);
		} catch (NoPossibleRunningDinnerException e) { // TODO
			throw new TechnicalException(e);
		}
	}

	@Transactional
	public List<Team> assignParticipantsToExistingTeams(@ValidateAdminId String adminId, List<TeamParticipantsAssignmentTO> teamParticipantsAssignments) {
		
		List<TeamParticipantsAssignmentTO> teamParticipantsAssignmentsToApply = teamParticipantsAssignments
																																							.stream()
																																							.filter(tpa -> CollectionUtils.isNotEmpty(tpa.getParticipantIds()))
																																							.collect(Collectors.toList());
		
		validateNoDuplicatedParticipantIds(teamParticipantsAssignmentsToApply);
		
		RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
		
		List<Team> affectedTeams = new ArrayList<>();
		for (TeamParticipantsAssignmentTO singleTeamParticipantsAssignment : teamParticipantsAssignmentsToApply) {
			affectedTeams.add(assignParticipantsToExistingTeam(runningDinner, singleTeamParticipantsAssignment.getTeamId(), singleTeamParticipantsAssignment.getParticipantIds()));
		}
		return affectedTeams;
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
		Assert.state(team.getTeamMembersOrdered().size() < teamSize, team + " is not allowed to be in status OK, but must either be cancelled or have a cancelled team member");
		
		List<Participant> participantsToAssign = findParticipantsToAssign(adminId, participantIds); 
		
		List<Participant> teamMembers = team.getTeamMembersOrdered();
		teamMembers.addAll(participantsToAssign);
		Assert.state(teamMembers.size() <= teamSize, "Team " + teamId + " can not have more than " + teamSize + " members, but tried to set " + teamMembers);
		
    team.setTeamMembers(new HashSet<>(teamMembers));
    runningDinnerCalculator.setHostingParticipant(team, runningDinner.getConfiguration());
    team.setStatus(team.getStatus() == TeamStatus.CANCELLED ? TeamStatus.REPLACED : TeamStatus.OK);
    
    Assert.notNull(team.getHostTeamMember(), "Expected " + team + " to have one host team member");
    return teamRepository.save(team);
    
    // TODO: Emit event for activity
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

}

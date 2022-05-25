package org.runningdinner.participant;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.persistence.EntityNotFoundException;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.admin.RepositoryUtil;
import org.runningdinner.admin.RunningDinnerService;
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
import org.runningdinner.common.service.ValidatorService;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.core.GeneratedTeamsResult;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerCalculator;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.event.publisher.EventPublisher;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.partnerwish.TeamPartnerWishService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishTuple;
import org.runningdinner.participant.rest.TeamArrangementListTO;
import org.runningdinner.participant.rest.TeamTO;
import org.runningdinner.participant.rest.dinnerroute.DinnerRouteTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

@Service
public class TeamService {

  private static Logger LOGGER = LoggerFactory.getLogger(TeamService.class);

  @Autowired
  private TeamRepository teamRepository;

  @Autowired
  private ValidatorService validatorService;

  @Autowired
  private EventPublisher eventPublisher;

  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private ParticipantRepository participantRepository;

  @Autowired
  private ActivityService activityService;

  @Autowired
  private RunningDinnerService runningDinnerService;

  @Autowired
  private RunningDinnerCalculator runningDinnerCalculator;
  
  @Autowired
  private DinnerRouteMessageFormatter dinnerRouteMessageFormatter;

  @Autowired
  private LocalizationProviderService localizationProviderService;
  
  public List<Team> findTeamArrangements(@ValidateAdminId String adminId, boolean excludeCancelledTeams) {

    List<Team> teams = teamRepository.findWithTeamMembersAndMealClassDistinctByAdminIdOrderByTeamNumber(adminId);
    if (excludeCancelledTeams) {
      teams = filterCancelledTeams(teams);
    }
    return teams;
  }

	public List<Team> findTeamArrangementsWaitingListFillable(@ValidateAdminId String adminId) {
		
		final List<Team> teams = findTeamArrangements(adminId, false);
		
    final RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
		List<Team> result = teams
													.stream()
													.filter(t -> t.getStatus() == TeamStatus.CANCELLED || hasCancelledTeamMember(t, runningDinner.getConfiguration()))
													.distinct()
													.collect(Collectors.toList());
		
		return result;
	}
  
  private boolean hasCancelledTeamMember(Team team, RunningDinnerConfig configuration) {
  	
  	return configuration.getTeamSize() > team.getTeamMembers().size();
	}

	public TeamMeetingPlan findTeamMeetingPlan(@ValidateAdminId String adminId, UUID teamId) {

    Team team = teamRepository.findWithVisitationPlanByIdAndAdminId(teamId, adminId);
    Set<Team> hostTeamReferencess = team.getHostTeams();
    Set<Team> guestTeamReferences = team.getGuestTeams();

    List<Team> hostTeams = teamRepository.findWithVisitationPlanDistinctByIdInAndAdminIdOrderByTeamNumber(RepositoryUtil.getEntityIds(hostTeamReferencess), adminId);
    List<Team> guestTeams = teamRepository.findWithVisitationPlanDistinctByIdInAndAdminIdOrderByTeamNumber(RepositoryUtil.getEntityIds(guestTeamReferences), adminId);

    TeamMeetingPlan result = new TeamMeetingPlan(team);
    result.setGuestTeams(guestTeams);

    for (Team hostTeam : hostTeams) {

      HostTeamInfo hostTeamInfo = new HostTeamInfo(hostTeam);

      Set<Team> guestTeamReferencesOfHostTeam = hostTeam.getGuestTeams();
      for (Team guestTeamReferenceOfHostTeam : guestTeamReferencesOfHostTeam) {
        // The current team is of course also a host team and shall not be added
        if (!guestTeamReferenceOfHostTeam.equals(team)) {
          Team guestTeamOfHostTeam = teamRepository.findWithTeamMembersAndMealClassDistinctByIdAndAdminId(guestTeamReferenceOfHostTeam.getId(), adminId);
          hostTeamInfo.addMeetedTeam(guestTeamOfHostTeam);
        }
      }

      result.addHostTeamInfo(hostTeamInfo);
    }

    return result;
  }
  
  public DinnerRouteTO findDinnerRoute(@ValidateAdminId String adminId, UUID teamId) {

    TeamMeetingPlan teamMeetingPlan = findTeamMeetingPlan(adminId, teamId);
    Assert.notNull(teamMeetingPlan, "teamMeetingPlan");
    Assert.notNull(teamMeetingPlan.getTeam(), "teamMeetingPlan.getDestTeam()");
    
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    List<Team> dinnerRoute = TeamRouteBuilder.generateDinnerRoute(teamMeetingPlan.getTeam());
    
    Team dinnerRouteTeam = Team.filterListForId(dinnerRoute, teamId); 

    Locale localeOfDinner = localizationProviderService.getLocaleOfDinner(runningDinner);
    
    String mealSpecificsOfGuestTeams = dinnerRouteMessageFormatter.getMealSpecificsOfGuestTeams(dinnerRouteTeam, localeOfDinner);
    
    DinnerRouteTO result = DinnerRouteTO.newInstance(teamId, dinnerRoute, mealSpecificsOfGuestTeams);
    
    return result;
  }

  public Team findTeamById(@ValidateAdminId String adminId, UUID teamId) {

    Team team = teamRepository.findByIdAndAdminId(teamId, adminId);
    validatorService.checkEntityNotNull(team);
    return team;
  }
  
  public Team findTeamByIdWithTeamMembers(@ValidateAdminId String adminId, UUID teamId) {

    Team team = teamRepository.findWithTeamMembersAndMealClassDistinctByIdAndAdminId(teamId, adminId);
    validatorService.checkEntityNotNull(team);
    return team;
  }
  
  public List<Team> findTeamsWithMembersOrdered(@ValidateAdminId String adminId, Collection<UUID> teamIds) {
   
    return teamRepository.findWithTeamMembersAndMealClassDistinctByIdInAndAdminIdOrderByTeamNumber(teamIds, adminId);
  }
  

  /**
   * Randomly creates teams for the running dinner identified by the passed id.<br>
   * This method assumes that there exist no teams till now.
   * 
   * @param adminId
   * @return
   * @throws NoPossibleRunningDinnerException
   */
  @Transactional(rollbackFor = { NoPossibleRunningDinnerException.class, RuntimeException.class })
  public TeamArrangementListTO createTeamAndVisitationPlans(@ValidateAdminId String adminId) throws NoPossibleRunningDinnerException {

    final RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    LOGGER.info("Create random teams and visitation-plans for dinner {}", adminId);
    
    Assert.state(getNumberOfTeams(adminId) == 0, "createTeamAndVisitationPlans can only be called with no teams already created");
    
    List<Team> savedTeams = createTeamsAndVisitationPlan(runningDinner);
    
    emitTeamsArrangedEvent(runningDinner, savedTeams);
    
    return newTeamArrangementList(savedTeams, adminId);
  }
  

  @Transactional(rollbackFor = { NoPossibleRunningDinnerException.class, RuntimeException.class })
  public TeamArrangementListTO dropAndReCreateTeamAndVisitationPlans(@ValidateAdminId String adminId) throws NoPossibleRunningDinnerException {

    final RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    LOGGER.info("Drop existing teams and re-create teams and visitation-plans for dinner {}", adminId);

    participantRepository.updateTeamReferenceAndHostToNull(adminId);
    teamRepository.deleteByAdminId(adminId);

    List<Team> teams = createTeamsAndVisitationPlan(runningDinner);
    
    emitTeamsReCreatedEvent(runningDinner, teams);
    
    return newTeamArrangementList(teams, adminId);
  }

  private List<Team> createTeamsAndVisitationPlan(RunningDinner runningDinner) throws NoPossibleRunningDinnerException {
    
    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);

    // create new team- and visitation-plans
    LOGGER.info("Generating teams for {}", runningDinner);
    GeneratedTeamsResult result = generateTeamPlan(runningDinner.getConfiguration(), participants);

    List<Team> regularTeams = result.getRegularTeams();

    // #1 Set dinner to team:
    regularTeams.forEach(t -> t.setRunningDinner(runningDinner));
    
    // #2 Save teams:
    LOGGER.debug("Save {} generated teams for dinner {}", regularTeams.size(), runningDinner.getAdminId());
    List<Team> savedTeams = teamRepository.saveAll(regularTeams);

    // #3 Set participant relationship:
    for (Team savedTeam : savedTeams) {
      savedTeam.getTeamMembers().forEach(p -> p.setTeam(savedTeam));
      participantRepository.saveAll(savedTeam.getTeamMembers());
    }
    
    return savedTeams;
  }
  
  private TeamArrangementListTO newTeamArrangementList(List<Team> teams, String adminId) {

    List<TeamTO> teamTOs = teams
            .stream()
            .map(team -> new TeamTO(team))
            .collect(Collectors.toList());
    
    return new TeamArrangementListTO(teamTOs, adminId);
  }

  protected void emitTeamsArrangedEvent(final RunningDinner dinner, final List<Team> teams) {

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

      @Override
      public void afterCommit() {

        eventPublisher.notifyTeamsArranged(teams, dinner);
      }
    });
  }
  
  protected void emitTeamsReCreatedEvent(final RunningDinner dinner, final List<Team> teams) {

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

      @Override
      public void afterCommit() {

        eventPublisher.notifyTeamsReCreated(teams, dinner);
      }
    });
  }

  protected GeneratedTeamsResult generateTeamPlan(final RunningDinnerConfig runningDinnerConfig, final List<Participant> participants)
    throws NoPossibleRunningDinnerException {

    GeneratedTeamsResult generatedTeams = runningDinnerCalculator.generateTeams(runningDinnerConfig, participants, Collections::shuffle);
    runningDinnerCalculator.assignRandomMealClasses(generatedTeams, runningDinnerConfig.getMealClasses());
    runningDinnerCalculator.generateDinnerExecutionPlan(generatedTeams, runningDinnerConfig);
    return generatedTeams;
  }

  @Transactional
  public List<Team> swapTeamMembers(@ValidateAdminId String adminId, UUID firstParticipantId, UUID secondParticipantId) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    LOGGER.info("Calling SwitchTeamMembers for dinner {}", runningDinner);

    Set<UUID> participantIds = new HashSet<>(Arrays.asList(firstParticipantId, secondParticipantId));
    List<Team> parentTeams = teamRepository.findTeamsByParticipantIds(participantIds, runningDinner.getAdminId());
  
    Assert.state(parentTeams.size() == 2, "Retrieved " + parentTeams.size() + " teams, but expected 2 teams");

    Participant firstParticipant = null;
    Team teamOfFirstParticipant = null;
    Participant secondParticipant = null;
    Team teamOfSecondParticipant = null;

    for (Team parentTeam : parentTeams) {
      Set<Participant> teamMembers = parentTeam.getTeamMembers();
      for (Participant teamMember : teamMembers) {
        if (teamMember.isSameId(firstParticipantId)) {
          firstParticipant = teamMember;
          teamOfFirstParticipant = parentTeam;
        } else if (teamMember.isSameId(secondParticipantId)) {
          secondParticipant = teamMember;
          teamOfSecondParticipant = parentTeam;
        }
      }
    }
    LOGGER.debug("Found first participant {} and second participant {}", firstParticipant, secondParticipant);

    if (firstParticipant == null || secondParticipant == null) {
      throw new EntityNotFoundException("At least one participant could not be fetched");
    }

    if (teamOfFirstParticipant.equals(teamOfSecondParticipant)) {
      LOGGER.debug("Parent-Team {} of both participants is the same", teamOfFirstParticipant);
      return parentTeams; // Nothing to do
    }

    checkTeamSwapDoesNotViolateTeamPartnerWish(teamOfFirstParticipant, runningDinner);
    checkTeamSwapDoesNotViolateTeamPartnerWish(teamOfSecondParticipant, runningDinner);
    
    LOGGER.debug("Removing both participants from their parent teams");
    teamOfFirstParticipant.removeTeamMember(firstParticipant);
    teamOfSecondParticipant.removeTeamMember(secondParticipant);
    
    // Check hosts:
    // As the host-flag may be changed during the checkHostingForTeam calls, we have to save it before:
    LOGGER.debug("Re-Assign hosting flag to both participants");
    checkHostingForTeam(teamOfFirstParticipant, secondParticipant, runningDinner.getConfiguration());
    checkHostingForTeam(teamOfSecondParticipant, firstParticipant, runningDinner.getConfiguration());

    LOGGER.debug("Assign participant {} to new parent team {}", secondParticipant, teamOfFirstParticipant);
    teamOfFirstParticipant.addTeamMember(secondParticipant);
    LOGGER.debug("Assign participant {} to new parent team {}", firstParticipant, teamOfSecondParticipant);
    teamOfSecondParticipant.addTeamMember(firstParticipant);

    emitTeamMembersSwappedEvent(firstParticipant, secondParticipant, parentTeams, runningDinner);

    return parentTeams;
  }

  private void checkTeamSwapDoesNotViolateTeamPartnerWish(Team team, RunningDinner runningDinner) {
    
    List<Participant> participants = team.getTeamMembersOrdered();
    List<TeamPartnerWishTuple> teamPartnerWishTuplesTeam1 = TeamPartnerWishService.getTeamPartnerWishTuples(participants, runningDinner.getConfiguration());
    if (TeamPartnerWishTuple.isTeamReflectedByTeamPartnerWishTuples(team, teamPartnerWishTuplesTeam1)) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.TEAM_SWAP_VIOLATES_TEAM_PARTNER_WISH, IssueType.VALIDATION)));
    }
  }

  protected void emitTeamMembersSwappedEvent(Participant firstParticipant, Participant secondParticipant, List<Team> parentTeams, RunningDinner runningDinner) {

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

      @Override
      public void afterCommit() {

        eventPublisher.notifySendTeamMembersSwappedEvent(firstParticipant, secondParticipant, parentTeams, runningDinner);
      }
    });
  }

  /**
   * This method performs some intelligent tasks for assigning a (potential new) optimal hosting participant of the parent-team of a
   * swapped participant
   * 
   * @param team Parent team of newParticipant
   * @param newParticipant The new participant that shall now be in the team
   */
  protected void checkHostingForTeam(Team team, Participant newParticipant, RunningDinnerConfig configuration) {

    // 1) Check whether team has member that is already host and has enough seats for hosting (if so, we won't change anything inside this team):
    for (Participant remainingTeamMember : team.getTeamMembers()) {
      if (remainingTeamMember.isHost() && FuzzyBoolean.TRUE == configuration.canHost(remainingTeamMember)) {
        newParticipant.setHost(false);
        return;
      }
    }
    
    // 2) Check whether new participant was host in other team and has enough seats for hosting (if so, this participant will be the new host for the team):
    if (newParticipant.isHost() && FuzzyBoolean.TRUE == configuration.canHost(newParticipant)) {
      for (Participant p : team.getTeamMembers()) {
        p.setHost(false);
      }
      newParticipant.setHost(true);
      return;
    }
    
    // 3a) Determine best participant for being host:
    Set<Participant> participants = new HashSet<>(team.getTeamMembers());
    participants.add(newParticipant);

    Participant bestHostingCandidate = null;
    for (Participant participant : participants) {
      if (FuzzyBoolean.TRUE == configuration.canHost(participant)) {
        if (bestHostingCandidate == null || configuration.canHost(bestHostingCandidate) != FuzzyBoolean.TRUE) {
          bestHostingCandidate = participant;
        }
      } else if (FuzzyBoolean.UNKNOWN == configuration.canHost(participant) && bestHostingCandidate == null) {
        bestHostingCandidate = participant;
      }
    }
    
    // 3b) No best participant found, take just the new one:
    if (bestHostingCandidate == null) {
      bestHostingCandidate = newParticipant;
    }
    
    // 4) Apply best candidate:
    for (Participant p : participants) {
      boolean canHost = p.equals(bestHostingCandidate);
      p.setHost(canHost);
    }    
  }

  @Transactional
  public List<Team> updateTeamHostersByAdmin(@ValidateAdminId String adminId, final Map<UUID, UUID> teamHostMappings) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    List<Team> teams = updateTeamHosters(runningDinner, teamHostMappings);
    
    emitTeamsHostChangedByAdminEvent(teams, runningDinner);
    
    return teams;
  }
  
  @Transactional
  public List<Team> updateTeamHosters(RunningDinner runningDinner, final Map<UUID, UUID> teamHostMappings) {
   
    Set<UUID> teamIds = teamHostMappings.keySet();
    LOGGER.info("Call updateTeamHosters with {} teams", teamIds.size());

    Assert.notEmpty(teamHostMappings, "Expected at least one team to be updated");

    List<Team> teams = teamRepository.findWithTeamMembersAndMealClassDistinctByIdInAndAdminIdOrderByTeamNumber(teamIds, runningDinner.getAdminId());
    LOGGER.debug("Found {} teams for the passed teamKeys", teams.size());
    Assert.state(teams.size() == teamIds.size(), "There should be modified " + teamIds.size() + " teams, but found " + teams.size() + " teams in database");

    for (Team team : teams) {
      final UUID newHostingParticipantId = teamHostMappings.get(team.getId());
      Assert.notNull(newHostingParticipantId, "Expected a new hosting participant key to be found for team " + team);
      changeSingleTeamHost(team, newHostingParticipantId);
    }
    
    return teams;
  }

  protected void emitTeamsHostChangedByAdminEvent(List<Team> teams, RunningDinner runningDinner) {

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

      @Override
      public void afterCommit() {

        eventPublisher.notifyTeamsHostChangedByAdminEvent(teams, runningDinner);
      }
    });
  }

  private void changeSingleTeamHost(Team team, UUID newHostingParticipantId) {

    Set<Participant> teamMembers = team.getTeamMembers();
    LOGGER.debug("Try to assign new hoster to team {}", team.getTeamNumber());

    for (Participant teamMember : teamMembers) {
      if (teamMember.isSameId(newHostingParticipantId)) {
        if (!teamMember.isHost()) { // Prevent unnecessary SQL update if this participant was already the host
          teamMember.setHost(true);
        }
      } else {
        if (teamMember.isHost()) {
          teamMember.setHost(false);
        }
      }
    }

    LOGGER.debug("Changed hoster of team {}", team);
  }

  @Transactional
  public TeamCancellationResult cancelTeam(@ValidateAdminId String adminId, TeamCancellation teamCancellation) {
    
    return performCancelTeam(adminId, teamCancellation);
  }
  
  @Transactional(readOnly = true)
  public TeamCancellationResult cancelTeamDryRun(@ValidateAdminId String adminId, TeamCancellation teamCancellation) {
    
    return performCancelTeam(adminId, teamCancellation);
  }
  
  private TeamCancellationResult performCancelTeam(String adminId, TeamCancellation teamCancellation) {
    
    // Verify dinner exists and is valid:
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    UUID teamId = teamCancellation.getTeamId();
    Team team = findTeamById(adminId, teamId);
    TeamMeetingPlan teamMeetingPlan = findTeamMeetingPlan(adminId, team.getId());

    TeamCancellationResult result = new TeamCancellationResult();
    result.setAffectedGuestTeams(filterCancelledTeams(teamMeetingPlan.getGuestTeams()));
    result.setAffectedHostTeams(filterCancelledHostTeams(teamMeetingPlan.getHostTeams()));
    result.setDinnerRouteMessagesSent(isDinnerRouteMailsAlreadySent(adminId));
    result.setRemovedParticipants(team.getTeamMembers());

    if (teamCancellation.isReplaceTeam()) {
      Set<UUID> replacementParticipantIds = teamCancellation.getReplacementParticipantIds();
      checkSizeOfReplacementParticipantIds(replacementParticipantIds, team);

      List<Participant> replacementParticipants = participantService.findParticipantsByIds(adminId, replacementParticipantIds);

      team.setTeamMembers(new HashSet<>(replacementParticipants));
      runningDinnerCalculator.setHostingParticipant(team, runningDinner.getConfiguration());

      team.setStatus(TeamStatus.REPLACED);
    } else {
      team.setTeamMembers(new HashSet<>());
      team.setStatus(TeamStatus.CANCELLED);
    }

    if (teamCancellation.isDryRun()) {
      result.setTeam(team);
      return result;
    }
    
    Set<Participant> removedParticipants = result.getRemovedParticipants();
    participantRepository.deleteAll(removedParticipants);

    team = teamRepository.save(team);
    result.setTeam(team);

    emitTeamCancelledEvent(result, runningDinner);

    return result;
  }


  protected void emitTeamCancelledEvent(final TeamCancellationResult teamCancellationResult, final RunningDinner runningDinner) {

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

      @Override
      public void afterCommit() {

        eventPublisher.notifyTeamCancelledEvent(teamCancellationResult, runningDinner);
      }
    });
  }

  @Transactional
  public Team cancelTeamMember(@ValidateAdminId String adminId, UUID teamId, UUID participantId) {
    
    // Verify dinner exists and is valid:
    final RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    final Team team = findTeamById(adminId, teamId);
    
    Set<Participant> teamMembers = team.getTeamMembers();
    Participant teamMemberToCancel = teamMembers
                                      .stream()
                                      .filter(teamMember -> teamMember.isSameId(participantId))
                                      .findAny()
                                      .orElseThrow(() -> new IllegalStateException("Could not find participant " + participantId + " in " + team));

    final boolean needNewTeamHost = team.getHostTeamMember().isSameId(teamMemberToCancel.getId());
    
    participantRepository.delete(teamMemberToCancel);
    
    teamMembers.remove(teamMemberToCancel);
    team.setTeamMembers(teamMembers);
    
    if (CollectionUtils.isEmpty(team.getTeamMembers())) {
      throw new ValidationException(new IssueList(new Issue("teamMembers", IssueKeys.TEAM_NO_TEAM_MEMBERS_LEFT, IssueType.VALIDATION)));
    }
    
    Team resultingTeam = teamRepository.save(team);
    
    if (needNewTeamHost) {
      for (Participant teamMember : resultingTeam.getTeamMembers()) {
        checkHostingForTeam(resultingTeam, teamMember, runningDinner.getConfiguration());
        if (teamMember.isHost()) {
          participantRepository.save(teamMember);
        }
      }
    }
    
    return resultingTeam;
  }
  
  public int getNumberOfTeams(@ValidateAdminId String adminId) {

    Long result = teamRepository.countByAdminId(adminId);
    if (result != null && result.intValue() > 0) {
      return result.intValue();
    }
    return 0;
  }
  
  private static List<Team> filterCancelledTeams(List<Team> teams) {
    
    return teams
            .stream()
            .filter(t -> t.getStatus() != TeamStatus.CANCELLED)
            .collect(Collectors.toList());
  }
  

  private List<HostTeamInfo> filterCancelledHostTeams(List<HostTeamInfo> hostTeams) {

    return hostTeams
            .stream()
            .filter(ht -> ht.getTeam().getStatus() != TeamStatus.CANCELLED)
            .collect(Collectors.toList());
  }
  
  private boolean isDinnerRouteMailsAlreadySent(String adminId) {

    List<Activity> dinnerRouteMailSentActivites = activityService.findActivitiesByTypes(adminId, ActivityType.DINNERROUTE_MAIL_SENT);
    return CoreUtil.isNotEmpty(dinnerRouteMailSentActivites);
  }

  private void checkSizeOfReplacementParticipantIds(Set<UUID> replacementParticipantIds, Team team) {

    if (team.getTeamMembers().size() == replacementParticipantIds.size()) {
      return;
    }
    if (team.getTeamMembers().size() > replacementParticipantIds.size()) {
      throw new ValidationException(new IssueList(new Issue("replacementParticipantIds",
        IssueKeys.INVALID_SIZE_REPLACEMENT_PARTICIPANTS_TOO_LITTLE, IssueType.VALIDATION)));
    }
    throw new ValidationException(new IssueList(new Issue("replacementParticipantIds",
      IssueKeys.INVALID_SIZE_REPLACEMENT_PARTICIPANTS_TOO_MANY, IssueType.VALIDATION)));
  }

}

package org.runningdinner.selfservice;

import com.google.common.base.MoreObjects;
import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.rest.MealTO;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.publisher.EventPublisher;
import org.runningdinner.participant.*;
import org.runningdinner.participant.rest.ParticipantInputDataTO;
import org.runningdinner.participant.rest.dinnerroute.DinnerRouteTO;
import org.runningdinner.participant.rest.dinnerroute.DinnerRouteTeamTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

import java.util.*;

@Service
public class SelfAdminService {

  private static final Logger LOGGER = LoggerFactory.getLogger(SelfAdminService.class);
  
  @Autowired
  private TeamService teamService;
  
  @Autowired
  private ParticipantService participantService;

  @Autowired
  private DinnerRouteService dinnerRouteService;
  
  @Autowired
  private RunningDinnerService runningDinnerService;
  
  @Autowired
  private EventPublisher eventPublisher;
  
  @Transactional
  public Team changeTeamHost(UUID selfAdministrationId, ChangeTeamHost changeTeamHost) {
    
    SelfAdminContext selfAdminContext = buildSelfAdminContext(selfAdministrationId, changeTeamHost.getParticipantId(), changeTeamHost.getTeamId());
    final Team team = selfAdminContext.getTeam();
    final RunningDinner runningDinner = selfAdminContext.getRunningDinner();
    
    UUID newHostingTeamMemberId = changeTeamHost.getNewHostingTeamMemberId();
    
    if (team.getHostTeamMember().getId().equals(newHostingTeamMemberId)) {
      LOGGER.warn("No change between old hosting team member " + team.getHostTeamMember() + " and new one: " + newHostingTeamMemberId);
      return team;
    }
    
    // TODO: check whether dinner routes are already sent
    
    Map<UUID, UUID> teamHostMapping = Collections.singletonMap(team.getId(), newHostingTeamMemberId);
    
    List<Team> resultingTeams = teamService.updateTeamHosters(runningDinner, teamHostMapping);
    Assert.state(resultingTeams.size() == 1, "Expected exactly one team but found " + resultingTeams);

    emitTeamsHostChangedByParticipantEvent(resultingTeams, runningDinner, selfAdminContext.getExecutingParticipant(), changeTeamHost.getComment());
    return resultingTeams.get(0);
  }
  
  @Transactional
  public void updateTeamPartnerWish(UUID selfAdministrationId, UUID participantId, String email) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerBySelfAdministrationId(selfAdministrationId);
    
    Participant participant = participantService.findParticipantById(runningDinner.getAdminId(), participantId);
    
    List<Participant> teamPartnerWishList = participantService.findParticipantByEmail(runningDinner.getAdminId(), email);
    if (CollectionUtils.isEmpty(teamPartnerWishList) || teamPartnerWishList.size() != 1) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.TEAM_PARTNER_WISH_UPDATE_INVALID, IssueType.VALIDATION)));
    }
    
    if (participant.getTeamId() != null || teamPartnerWishList.get(0).getTeamId() != null) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.TEAM_PARTNER_WISH_UPDATE_INVALID, IssueType.VALIDATION)));
    }
    
    participant.setTeamPartnerWishEmail(email); // TODO: Whats with team partnerwish state handling?!
    
    participantService.updateParticipant(runningDinner.getAdminId(), participantId, new ParticipantInputDataTO(participant));
  }
  
  public DinnerRouteTO findDinnerRoute(UUID selfAdministrationId, UUID participantId, UUID teamId) {
    
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerBySelfAdministrationId(selfAdministrationId);
    
    DinnerRouteTO result = dinnerRouteService.findDinnerRoute(runningDinner.getAdminId(), teamId);
    
    Optional<Team> teamOfParticipant = result.getTeams()
                                        .stream()
                                        .map(DinnerRouteTeamTO::getRawTeam)
                                        .filter(t -> t.getTeamMemberByParticipantId(participantId) != null)
                                        .findAny();
    Assert.state(teamOfParticipant.isPresent(), "Expected that participant " + participantId + " is contained in teams of dinner-route " + result.getTeams());
    Assert.state(teamOfParticipant.get().getId().equals(teamId), 
                 "Expected that passed participantId " + participantId + " is contained in team of passed teamId " + teamId);
    
    return result;
  }
  
  public Team findTeam(UUID selfAdministrationId, UUID participantId, UUID teamId) {

    SelfAdminContext selfAdminContext = buildSelfAdminContext(selfAdministrationId, participantId, teamId);
    return selfAdminContext.getTeam();
  }
  
  public SelfAdminSessionDataTO findSelfAdminSessionData(UUID selfAdministrationId, UUID participantId) {
   
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerBySelfAdministrationId(selfAdministrationId);
    participantService.findParticipantById(runningDinner.getAdminId(), participantId); // Checks whether this ID really exists!
    return new SelfAdminSessionDataTO(selfAdministrationId, runningDinner.getLanguageCode(), MealTO.fromMeals(runningDinner.getConfiguration().getMealClasses()));
  }
  
  protected void emitTeamsHostChangedByParticipantEvent(List<Team> teams, RunningDinner runningDinner, Participant executingParticipant, String comment) {

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {

      @Override
      public void afterCommit() {

        eventPublisher.notifyTeamsHostChangedByParticipantEvent(teams, runningDinner, executingParticipant, comment);
      }
    });
  }

  protected SelfAdminContext buildSelfAdminContext(UUID selfAdministrationId, UUID participantId, UUID teamId) {
    
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerBySelfAdministrationId(selfAdministrationId);
    
    Team team = teamService.findTeamByIdWithTeamMembers(runningDinner.getAdminId(), teamId);
    Assert.notNull(team, "Could not find team for id " + teamId);
    Participant executingParticipant = team.getTeamMemberByParticipantId(participantId);
    Assert.notNull(executingParticipant, "Could not find participant for id " + participantId);
    
    return new SelfAdminContext(runningDinner, executingParticipant, team);
  }
  
  private static class SelfAdminContext {
    
    private final RunningDinner runningDinner;
    
    private final Participant executingParticipant;
    
    private final Team team;

    public SelfAdminContext(RunningDinner runningDinner, Participant executingParticipant, Team team) {
      this.runningDinner = runningDinner;
      this.executingParticipant = executingParticipant;
      this.team = team;
    }

    public RunningDinner getRunningDinner() {
    
      return runningDinner;
    }
    
    public Participant getExecutingParticipant() {
    
      return executingParticipant;
    }

    public Team getTeam() {
    
      return team;
    }

    @Override
    public String toString() {
      return MoreObjects
              .toStringHelper(this)
              .addValue(runningDinner)
              .addValue(executingParticipant)
              .addValue(team)
              .toString();
    }
    
  }

}

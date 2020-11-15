package org.runningdinner.selfservice;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.publisher.EventPublisher;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
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

import com.google.common.base.MoreObjects;

@Service
public class SelfAdminService {

  private static Logger LOGGER = LoggerFactory.getLogger(SelfAdminService.class);
  
  @Autowired
  private TeamService teamService;
  
  @Autowired
  private ParticipantService participantService;
  
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
    
    Optional<Participant> teamPartnerWish = participantService.findParticipantByEmail(runningDinner.getAdminId(), email);
    if (!teamPartnerWish.isPresent()) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.TEAM_PARTNER_WISH_UPDATE_INVALID, IssueType.VALIDATION)));
    }
    
    if (participant.getTeamId() != null || teamPartnerWish.get().getTeamId() != null) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.TEAM_PARTNER_WISH_UPDATE_INVALID, IssueType.VALIDATION)));
    }
    
    participant.setTeamPartnerWish(email); // TODO: Whats with team partnerwish state handling?!
    participantService.updateParticipant(runningDinner.getAdminId(), participantId, participant);
  }
  
  public DinnerRouteTO findDinnerRoute(UUID selfAdministrationId, UUID participantId, UUID teamId) {
    
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerBySelfAdministrationId(selfAdministrationId);
    
    DinnerRouteTO result = teamService.findDinnerRoute(runningDinner.getAdminId(), teamId);
    
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
    return new SelfAdminSessionDataTO(selfAdministrationId, runningDinner.getLanguageCode());
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
    
    private RunningDinner runningDinner;
    
    private Participant executingParticipant;
    
    private Team team;

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

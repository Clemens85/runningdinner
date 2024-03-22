package org.runningdinner.selfservice.rest;

import java.util.UUID;

import jakarta.validation.Valid;

import org.runningdinner.participant.Team;
import org.runningdinner.participant.rest.TeamTO;
import org.runningdinner.participant.rest.dinnerroute.DinnerRouteTO;
import org.runningdinner.selfservice.ChangeTeamHost;
import org.runningdinner.selfservice.SelfAdminService;
import org.runningdinner.selfservice.SelfAdminSessionDataTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/rest/self/v1/{selfAdministrationId}", produces = MediaType.APPLICATION_JSON_VALUE)
public class SelfAdminServiceRest {
  
  @Autowired
  private SelfAdminService selfAdminService;
  
  @GetMapping("/{participantId}/{teamId}/team")
  public TeamTO findTeam(@PathVariable UUID selfAdministrationId, 
                         @PathVariable UUID participantId,
                         @PathVariable UUID teamId) {
    
    Team team = selfAdminService.findTeam(selfAdministrationId, participantId, teamId);
    return new TeamTO(team);
  }
  
  @PutMapping(value = "/{participantId}/{teamId}/teamhost", consumes = MediaType.APPLICATION_JSON_VALUE)
  public TeamTO changeTeamHost(@PathVariable UUID selfAdministrationId,
                               @PathVariable UUID participantId,
                               @PathVariable UUID teamId,
                               @RequestBody @Valid ChangeTeamHost changeTeamHost) {

    Assert.state(participantId.equals(changeTeamHost.getParticipantId()),
                 "participantId in URL " + participantId + " didn't match participantId in changeTeamHost " + changeTeamHost.getParticipantId());
    Assert.state(teamId.equals(changeTeamHost.getTeamId()), 
                "TeamId in URL " + teamId + " didn't match team-id in changeTeamHost " + changeTeamHost.getTeamId());
    
    Team resultingTeam = selfAdminService.changeTeamHost(selfAdministrationId, changeTeamHost);
    return new TeamTO(resultingTeam);
  }
  
  @GetMapping("/{participantId}/{teamId}/dinnerroute")
  public DinnerRouteTO findDinnerRoute(@PathVariable UUID selfAdministrationId, 
                                       @PathVariable UUID participantId,
                                       @PathVariable UUID teamId) {
   
    return selfAdminService.findDinnerRoute(selfAdministrationId, participantId, teamId)
                              .withMealSpecificsInHtmlFormat();
  }
  
  @PutMapping("/{participantId}/teampartnerwish")
  public void updateTeamPartnerWish(@PathVariable UUID selfAdministrationId,
                                    @PathVariable UUID participantId,
                                    @RequestParam String email) {

    selfAdminService.updateTeamPartnerWish(selfAdministrationId, participantId, email);
  }
  
  @GetMapping(value = "/{participantId}/sessiondata")
  public SelfAdminSessionDataTO findSelfAdminSessionData(@PathVariable UUID selfAdministrationId,
                                                         @PathVariable UUID participantId) {

    return selfAdminService.findSelfAdminSessionData(selfAdministrationId, participantId);
  }
}

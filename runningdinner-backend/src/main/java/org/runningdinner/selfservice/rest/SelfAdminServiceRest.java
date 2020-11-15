package org.runningdinner.selfservice.rest;

import java.util.UUID;

import javax.validation.Valid;

import org.runningdinner.participant.Team;
import org.runningdinner.participant.rest.TeamTO;
import org.runningdinner.participant.rest.dinnerroute.DinnerRouteTO;
import org.runningdinner.selfservice.ChangeTeamHost;
import org.runningdinner.selfservice.SelfAdminService;
import org.runningdinner.selfservice.SelfAdminSessionDataTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/self/v1/{selfAdministrationId}", produces = MediaType.APPLICATION_JSON_VALUE)
public class SelfAdminServiceRest {
  
  @Autowired
  private SelfAdminService selfAdminService;
  
  @RequestMapping(value = "/{participantId}/{teamId}/team", method = RequestMethod.GET)
  public TeamTO findTeam(@PathVariable("selfAdministrationId") UUID selfAdministrationId, 
                         @PathVariable("participantId") UUID participantId,
                         @PathVariable("teamId") UUID teamId) {
    
    Team team = selfAdminService.findTeam(selfAdministrationId, participantId, teamId);
    return new TeamTO(team);
  }
  
  @RequestMapping(value = "/{participantId}/{teamId}/teamhost", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
  public TeamTO changeTeamHost(@PathVariable("selfAdministrationId") UUID selfAdministrationId,
                               @PathVariable("participantId") UUID participantId,
                               @PathVariable("teamId") UUID teamId,
                               @RequestBody @Valid ChangeTeamHost changeTeamHost) {

    Assert.state(participantId.equals(changeTeamHost.getParticipantId()),
                 "participantId in URL " + participantId + " didn't match participantId in changeTeamHost " + changeTeamHost.getParticipantId());
    Assert.state(teamId.equals(changeTeamHost.getTeamId()), 
                "TeamId in URL " + teamId + " didn't match team-id in changeTeamHost " + changeTeamHost.getTeamId());
    
    Team resultingTeam = selfAdminService.changeTeamHost(selfAdministrationId, changeTeamHost);
    return new TeamTO(resultingTeam);
  }
  
  @RequestMapping(value = "/{participantId}/{teamId}/dinnerroute", method = RequestMethod.GET)
  public DinnerRouteTO findDinnerRoute(@PathVariable("selfAdministrationId") UUID selfAdministrationId, 
                                       @PathVariable("participantId") UUID participantId,
                                       @PathVariable("teamId") UUID teamId) {
   
    return selfAdminService.findDinnerRoute(selfAdministrationId, participantId, teamId)
                              .withMealSpecificsInHtmlFormat();
  }
  
  @RequestMapping(value = "/{participantId}/teampartnerwish", method = RequestMethod.PUT)
  public void updateTeamPartnerWish(@PathVariable("selfAdministrationId") UUID selfAdministrationId,
                                    @PathVariable("participantId") UUID participantId,
                                    @RequestParam("email") String email) {

    selfAdminService.updateTeamPartnerWish(selfAdministrationId, participantId, email);
  }
  
  @GetMapping(value = "/{participantId}/sessiondata")
  public SelfAdminSessionDataTO findSelfAdminSessionData(@PathVariable("selfAdministrationId") UUID selfAdministrationId,
                                                         @PathVariable("participantId") UUID participantId) {

    return selfAdminService.findSelfAdminSessionData(selfAdministrationId, participantId);
  }
}

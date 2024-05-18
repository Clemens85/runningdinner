package org.runningdinner.participant.rest;

import jakarta.validation.Valid;
import org.runningdinner.participant.*;
import org.runningdinner.participant.rest.dinnerroute.DinnerRouteListTO;
import org.runningdinner.participant.rest.dinnerroute.DinnerRouteTO;
import org.runningdinner.routeoptimization.TeamLocationsEventData;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/rest/teamservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class TeamServiceRest {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(TeamServiceRest.class);

	@Autowired
	private TeamService teamService;

	@GetMapping("/runningdinner/{adminId}/team/{teamId}/meetingplan")
	public TeamMeetingPlanTO findTeamMeetingPlan(@PathVariable String adminId, @PathVariable UUID teamId) {

	  TeamMeetingPlan teamMeetingPlan = teamService.findTeamMeetingPlan(adminId, teamId);
		TeamMeetingPlanTO result = new TeamMeetingPlanTO(teamMeetingPlan);
		return result;
	}
	
  @GetMapping("/runningdinner/{adminId}")
  public TeamArrangementListTO findTeamArrangements(@PathVariable String adminId, 
                                                    @RequestParam(value = "filterCancelledTeams", defaultValue = "false", required = false) boolean excludeCancelledTeams) {

    List<Team> teams = teamService.findTeamArrangements(adminId, excludeCancelledTeams);

    TeamArrangementListTO result = mapToTeamArrangementList(adminId, teams);
    return result;
  }

	private TeamArrangementListTO mapToTeamArrangementList(String adminId, List<Team> teams) {
		
		TeamArrangementListTO result = new TeamArrangementListTO();
		for (Team team : teams) {
      result.addTeam(new TeamTO(team));
    }
    result.setDinnerAdminId(adminId);
    return result;
	} 
  
  @PostMapping(value = "/runningdinner/{adminId}")
  public TeamArrangementListTO generateTeamArrangements(@PathVariable final String adminId) {
    
    TeamArrangementListTO result = teamService.createTeamAndVisitationPlans(adminId);
    return result;
  }
  
  @PutMapping(value = "/runningdinner/{adminId}")
  public TeamArrangementListTO reGenerateTeamArrangements(@PathVariable final String adminId) {
    
    TeamArrangementListTO result = teamService.dropAndReCreateTeamAndVisitationPlans(adminId, Collections.emptyList());
    return result;
  }
  
  @DeleteMapping(value = "/runningdinner/{adminId}")
  public TeamArrangementListTO dropTeamArrangements(@PathVariable final String adminId) {
    
    List<TeamTO> teams = teamService.dropTeamAndAndVisitationPlans(adminId, false, true);
    return new TeamArrangementListTO(teams, adminId);
  }

  @PutMapping(value = "/runningdinner/{adminId}/teamhosts", consumes = MediaType.APPLICATION_JSON_VALUE)
  public TeamArrangementListTO updateTeamHosts(@PathVariable String adminId,
      @RequestBody TeamArrangementListTO teamHostList) {

    List<TeamTO> teams = teamHostList.getTeams();
    List<Team> updatedTeams = teamService.updateTeamHostersByAdmin(adminId, convertToTeamHostMap(teams));

    LOGGER.info("Updated teams after team host change: {}", Team.toStringDetailed(updatedTeams));

    return new TeamArrangementListTO(TeamTO.convertTeamList(updatedTeams), adminId);
  }

  @PutMapping("/runningdinner/{adminId}/teammembers/swap/{firstParticipantId}/{secondParticipantId}")
  public TeamArrangementListTO swapTeamMembers(@PathVariable String adminId,
      @PathVariable UUID firstParticipantId,
      @PathVariable UUID secondParticipantId) {

    List<Team> updatedTeams = teamService.swapTeamMembers(adminId, firstParticipantId, secondParticipantId);
    return newSwapResponse(updatedTeams, adminId);
  }

  @PutMapping(value = "/runningdinner/{adminId}/meals/swap/{firstTeamId}/{secondTeamId}")
  public TeamArrangementListTO swapMeals(@PathVariable String adminId,
                                         @PathVariable UUID firstTeamId,
                                         @PathVariable UUID secondTeamId) {

    List<Team> updatedTeams = teamService.swapMeals(adminId, firstTeamId, secondTeamId);
    return newSwapResponse(updatedTeams, adminId);
  }

  private TeamArrangementListTO newSwapResponse(Collection<Team> updatedTeams, String adminId) {
    List<TeamTO> result = updatedTeams.stream().map(ut -> new TeamTO(ut)).collect(Collectors.toList());
    LOGGER.info("Updated teams after swap: {}", Team.toStringDetailed(updatedTeams));
    return new TeamArrangementListTO(result, adminId);
  }

  @PutMapping("/runningdinner/{adminId}/team/{teamId}/cancel")
  public TeamCancellationResultTO cancelTeam(@PathVariable String adminId, @PathVariable UUID teamId,
  		@Valid @RequestBody TeamCancellation teamCancellation) {
  
  	Assert.state(Objects.equals(teamId, teamCancellation.getTeamId()), "Passed teamId does not match teamId in teamCancellation obj");
  
  	TeamCancellationResult result = teamCancellation.isDryRun() ? teamService.cancelTeamDryRun(adminId, teamCancellation) : teamService.cancelTeam(adminId, teamCancellation);
  	
  	LOGGER.info("Team state after cancellation (dryRun = {}): {}", teamCancellation.isDryRun(), result.getTeam().toStringDetailed());
  	
  	return new TeamCancellationResultTO(result);
  }
	
  @PutMapping("/runningdinner/{adminId}/team/{teamId}/{participantId}/cancel")
  public TeamTO cancelTeamMember(@PathVariable String adminId, @PathVariable UUID teamId, @PathVariable UUID participantId) {
  
    Team result = teamService.cancelTeamMember(adminId, teamId, participantId);
  	
    LOGGER.info("Team state after cancellation of teammember ({}): {}", participantId, result.toStringDetailed());
    
    return new TeamTO(result);
  }
	
  @GetMapping("/runningdinner/{adminId}/team/{teamId}/dinnerroute")
  public DinnerRouteTO findDinnerRoute(@PathVariable String adminId, @PathVariable UUID teamId) {

    return teamService.findDinnerRoute(adminId, teamId)
                        .withMealSpecificsInHtmlFormat();
  }

  @GetMapping("/runningdinner/{adminId}/dinnerroutes")
  public DinnerRouteListTO findAllDinnerRoutes(@PathVariable String adminId) {

    var result = teamService.findAllDinnerRoutes(adminId);
    return new DinnerRouteListTO(result);
  }


  @GetMapping("/runningdinner/{adminId}/team-locations-event-data")
  public TeamLocationsEventData findTeamLocationsEventData(@PathVariable String adminId) {
    
    return teamService.findTeamLocationsEventData(adminId);
  }

  protected Map<UUID, UUID> convertToTeamHostMap(final List<TeamTO> teams) {

    Map<UUID, UUID> result = new HashMap<>();
    for (TeamTO team : teams) {
      ParticipantTO hostTeamMember = team.getHostTeamMember();
      result.put(team.getId(), hostTeamMember.getId());
    }
    return result;
  }

}

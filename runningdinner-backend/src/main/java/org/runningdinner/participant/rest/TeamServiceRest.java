package org.runningdinner.participant.rest;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import javax.validation.Valid;

import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamCancellation;
import org.runningdinner.participant.TeamCancellationResult;
import org.runningdinner.participant.TeamLocationsEventData;
import org.runningdinner.participant.TeamMeetingPlan;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.rest.dinnerroute.DinnerRouteTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/teamservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class TeamServiceRest {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(TeamServiceRest.class);

	@Autowired
	private TeamService teamService;

	@RequestMapping(value = "/runningdinner/{adminId}/team/{teamId}/meetingplan", method = RequestMethod.GET)
	public TeamMeetingPlanTO findTeamMeetingPlan(@PathVariable("adminId") String adminId, @PathVariable("teamId") UUID teamId) {

	  TeamMeetingPlan teamMeetingPlan = teamService.findTeamMeetingPlan(adminId, teamId);
		TeamMeetingPlanTO result = new TeamMeetingPlanTO(teamMeetingPlan);
		return result;
	}
	
  @RequestMapping(value = "/runningdinner/{adminId}", method = RequestMethod.GET)
  public TeamArrangementListTO findTeamArrangements(@PathVariable("adminId") String adminId, 
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
  
  @RequestMapping(value = "/runningdinner/{adminId}", method = RequestMethod.POST)
  public TeamArrangementListTO generateTeamArrangements(@PathVariable("adminId") final String adminId) {
    
    TeamArrangementListTO result = teamService.createTeamAndVisitationPlans(adminId);
    return result;
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}", method = RequestMethod.PUT)
  public TeamArrangementListTO reGenerateTeamArrangements(@PathVariable("adminId") final String adminId) {
    
    TeamArrangementListTO result = teamService.dropAndReCreateTeamAndVisitationPlans(adminId, Collections.emptyList());
    return result;
  }

	@RequestMapping(value = "/runningdinner/{adminId}/teamhosts", method = RequestMethod.PUT, consumes = MediaType.APPLICATION_JSON_VALUE)
	public TeamArrangementListTO updateTeamHosts(@PathVariable("adminId") String adminId, @RequestBody TeamArrangementListTO teamHostList) {

		List<TeamTO> teams = teamHostList.getTeams();
		List<Team> updatedTeams = teamService.updateTeamHostersByAdmin(adminId, convertToTeamHostMap(teams));
		
  	LOGGER.info("Updated teams after team host change: {}", Team.toStringDetailed(updatedTeams));
		
		return new TeamArrangementListTO(TeamTO.convertTeamList(updatedTeams), adminId);
	}

	@RequestMapping(value = "/runningdinner/{adminId}/teammembers/swap/{firstParticipantId}/{secondParticipantId}", method = RequestMethod.PUT)
	public TeamArrangementListTO swapTeamMembers(@PathVariable("adminId") String adminId,
			@PathVariable("firstParticipantId") UUID firstParticipantId, @PathVariable("secondParticipantId") UUID secondParticipantId) {

		List<Team> updatedTeams = teamService.swapTeamMembers(adminId, firstParticipantId, secondParticipantId);
		
		List<TeamTO> result = new ArrayList<>();
		for (Team updatedTeam : updatedTeams) {
			TeamTO resultingTeam = new TeamTO(updatedTeam);
			result.add(resultingTeam);
		}
		
  	LOGGER.info("Updated teams after swap: {}", Team.toStringDetailed(updatedTeams));
		
		return new TeamArrangementListTO(result, adminId);
	}

  @RequestMapping(value = "/runningdinner/{adminId}/team/{teamId}/cancel", method = RequestMethod.PUT)
  public TeamCancellationResultTO cancelTeam(@PathVariable("adminId") String adminId, @PathVariable("teamId") UUID teamId,
  		@Valid @RequestBody TeamCancellation teamCancellation) {
  
  	Assert.state(Objects.equals(teamId, teamCancellation.getTeamId()), "Passed teamId does not match teamId in teamCancellation obj");
  
  	TeamCancellationResult result = teamCancellation.isDryRun() ? teamService.cancelTeamDryRun(adminId, teamCancellation) : teamService.cancelTeam(adminId, teamCancellation);
  	
  	LOGGER.info("Team state after cancellation (dryRun = {}): {}", teamCancellation.isDryRun(), result.getTeam().toStringDetailed());
  	
  	return new TeamCancellationResultTO(result);
  }
	
  @RequestMapping(value = "/runningdinner/{adminId}/team/{teamId}/{participantId}/cancel", method = RequestMethod.PUT)
  public TeamTO cancelTeamMember(@PathVariable("adminId") String adminId, @PathVariable("teamId") UUID teamId, @PathVariable("participantId") UUID participantId) {
  
    Team result = teamService.cancelTeamMember(adminId, teamId, participantId);
  	
    LOGGER.info("Team state after cancellation of teammember ({}): {}", participantId, result.toStringDetailed());
    
    return new TeamTO(result);
  }
	
  @RequestMapping(value = "/runningdinner/{adminId}/team/{teamId}/dinnerroute", method = RequestMethod.GET)
  public DinnerRouteTO findDinnerRoute(@PathVariable("adminId") String adminId, @PathVariable("teamId") UUID teamId) {

    return teamService.findDinnerRoute(adminId, teamId)
                        .withMealSpecificsInHtmlFormat();
  }
  
  @RequestMapping(value = "/runningdinner/{adminId}/team-locations-event-data", method = RequestMethod.GET)
  public TeamLocationsEventData findTeamLocationsEventData(@PathVariable("adminId") String adminId) {
    
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

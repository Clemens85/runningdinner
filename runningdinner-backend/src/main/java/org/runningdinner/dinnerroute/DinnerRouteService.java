package org.runningdinner.dinnerroute;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourCluster;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterCalculationService;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterListTO;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamMeetingPlan;
import org.runningdinner.participant.TeamService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

@Service
public class DinnerRouteService {
	
	private static final Logger LOGGER = LoggerFactory.getLogger(DinnerRouteService.class);

  private final RunningDinnerService runningDinnerService;

  private final TeamService teamService;

  private final DinnerRouteMessageFormatter dinnerRouteMessageFormatter;
  
  private final MissingGeocodeResultHandlerService missingGeocodeResultHandlerService;
  
  private final TeamNeighbourClusterCalculationService teamNeighbourClusterCalculationService;

  public DinnerRouteService(RunningDinnerService runningDinnerService, TeamService teamService, DinnerRouteMessageFormatter dinnerRouteMessageFormatter,
			MissingGeocodeResultHandlerService missingGeocodeResultHandlerService, TeamNeighbourClusterCalculationService teamNeighbourClusterCalculationService) {
		this.runningDinnerService = runningDinnerService;
		this.teamService = teamService;
		this.dinnerRouteMessageFormatter = dinnerRouteMessageFormatter;
		this.missingGeocodeResultHandlerService = missingGeocodeResultHandlerService;
		this.teamNeighbourClusterCalculationService = teamNeighbourClusterCalculationService;
	}

	@Transactional(readOnly = true)
  public DinnerRouteTO findDinnerRoute(@ValidateAdminId String adminId, UUID teamId) {
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    return findDinnerRoute(runningDinner, teamId);
  }

  private DinnerRouteTO findDinnerRoute(RunningDinner runningDinner, UUID teamId) {
    TeamMeetingPlan teamMeetingPlan = teamService.findTeamMeetingPlan(runningDinner.getAdminId(), teamId);
    Assert.notNull(teamMeetingPlan, "teamMeetingPlan");
    Assert.notNull(teamMeetingPlan.getTeam(), "teamMeetingPlan.getDestTeam()");
  	return new DinnerRouteCalculator(runningDinner, dinnerRouteMessageFormatter).buildDinnerRoute(teamMeetingPlan.getTeam());
  }

  @Transactional(readOnly = true)
  public DinnerRouteListTO findAllDinnerRoutes(@ValidateAdminId String adminId) {
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    List<DinnerRouteTO> dinnerRoutes = new ArrayList<>();
    List<Team> teams = teamService.findTeamArrangements(adminId, true);
    
    teams = handleMissingGeocodeResultsIfNeeded(adminId, teams);
    
    for (Team team : teams) {
      dinnerRoutes.add(findDinnerRoute(runningDinner, team.getId()));
    }
    
    Map<Integer, LinkedHashSet<Integer>> teamClusters = DinnerRouteCalculator.reverseCalculateClustersOfTeams(dinnerRoutes);
    
    List<TeamNeighbourCluster> teamNeighbourClusters = teamNeighbourClusterCalculationService.calculateTeamNeighbourClusters(adminId, teams, 0d);
    
    return new DinnerRouteListTO(dinnerRoutes, teamClusters, new TeamNeighbourClusterListTO(teamNeighbourClusters));
  }

  @Transactional(readOnly = true)
  public AllDinnerRoutesWithDistancesListTO calculateDinnerRouteDistances(String adminId) {
    List<DinnerRouteTO> allDinnerRoutes = findAllDinnerRoutes(adminId).getDinnerRoutes();
    return DinnerRouteCalculator.calculateDistancesForAllDinnerRoutes(allDinnerRoutes);
  }
  
	private List<Team> handleMissingGeocodeResultsIfNeeded(String adminId, List<Team> teams) {
		try {
			int numSyncedGeocodes = missingGeocodeResultHandlerService.fetchAndPersistMissingGeocodeResults(adminId, teams);
			if (numSyncedGeocodes > 0) {
				return teamService.findTeamArrangements(adminId, true);
			}
		} catch (Exception e) {
			LOGGER.error("Could not fetch missing geocodes for running dinner {}. Use teams as they are", adminId, e);
		}
		return teams;
	}
}



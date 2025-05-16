package org.runningdinner.dinnerroute;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.dinnerroute.distance.DistanceMatrix;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamMeetingPlan;
import org.runningdinner.participant.TeamService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

@Service
public class DinnerRouteService {

  private final RunningDinnerService runningDinnerService;

  private final TeamService teamService;

  private final DinnerRouteMessageFormatter dinnerRouteMessageFormatter;

  public DinnerRouteService(RunningDinnerService runningDinnerService, TeamService teamService, DinnerRouteMessageFormatter dinnerRouteMessageFormatter) {
    this.runningDinnerService = runningDinnerService;
    this.teamService = teamService;
    this.dinnerRouteMessageFormatter = dinnerRouteMessageFormatter;
  }

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
    for (Team team : teams) {
      dinnerRoutes.add(findDinnerRoute(runningDinner, team.getId()));
    }
    Map<Integer, LinkedHashSet<Integer>> teamClusters = DinnerRouteCalculator.reverseCalculateClustersOfTeams(dinnerRoutes);
    return new DinnerRouteListTO(dinnerRoutes, teamClusters);
  }


  public AllDinnerRoutesWithDistancesListTO calculateDinnerRouteDistances(String adminId, GeocodedAddressEntityListTO addressEntityList) {
    List<DinnerRouteTO> allDinnerRoutes = findAllDinnerRoutes(adminId).getDinnerRoutes();
    DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(addressEntityList.getAddressEntities());
    return DinnerRouteCalculator.calculateDistancesForAllDinnerRoutes(allDinnerRoutes, distanceMatrix);
  }

  
}



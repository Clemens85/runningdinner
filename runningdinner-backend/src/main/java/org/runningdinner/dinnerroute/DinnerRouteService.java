package org.runningdinner.dinnerroute;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.LogSanitizer;
import org.runningdinner.dinnerroute.distance.DistanceCalculator;
import org.runningdinner.dinnerroute.distance.DistanceEntry;
import org.runningdinner.dinnerroute.distance.DistanceMatrix;
import org.runningdinner.dinnerroute.distance.DistanceUtil;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntity;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityIdType;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamMeetingPlan;
import org.runningdinner.participant.TeamService;
import org.runningdinner.participant.rest.TeamTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

@Service
public class DinnerRouteService {

  private static  final Logger LOGGER = LoggerFactory.getLogger(DinnerRouteService.class);

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

  public List<TeamNeighbourCluster> calculateTeamNeighbourClusters(@ValidateAdminId String adminId, List<GeocodedAddressEntity> addressEntities, double rangeInMeters) {
    DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(addressEntities, rangeInMeters);
    List<Team> teams = findTeamsForEntries(adminId, distanceMatrix.getEntries().keySet(), addressEntities);
    return mapToTeamNeighbourClusters(distanceMatrix, teams);
  }

  public static List<TeamNeighbourCluster> mapToTeamNeighbourClusters(DistanceMatrix distanceMatrix, List<Team> teams) {
    List<TeamNeighbourCluster> result = new ArrayList<>();
    for (var entry : distanceMatrix.getEntries().entrySet()) {
      Team srcTeam = DinnerRouteCalculator.findTeamForTeamNumber(entry.getKey().srcId(), teams);
      Team destTeam = DinnerRouteCalculator.findTeamForTeamNumber(entry.getKey().destId(), teams);
      Double distance = DistanceUtil.metersToKilometers(entry.getValue());
      result.add(new TeamNeighbourCluster(List.of(new TeamTO(srcTeam), new TeamTO(destTeam)), distance));
    }
    return result;
  }

  private List<Team> findTeamsForEntries(String adminId, Set<DistanceEntry> distanceEntries, List<GeocodedAddressEntity> addressEntities) {

    if (CollectionUtils.isEmpty(distanceEntries) || CollectionUtils.isEmpty(addressEntities)) {
      return Collections.emptyList();
    }

    GeocodedAddressEntityIdType idType = addressEntities.get(0).getIdType();
    if (idType != GeocodedAddressEntityIdType.TEAM_NR) {
      LOGGER.error("Only TEAM_NR is supported as GeocodedAddressEntityIdType but got {}  in event {}",
                   idType, LogSanitizer.sanitize(adminId));
      return Collections.emptyList();
    }

    Set<Integer> teamNumbers = new HashSet<>();
    distanceEntries
      .forEach(entry -> {
        teamNumbers.add(DinnerRouteCalculator.parseIntSafe(entry.srcId()));
        teamNumbers.add(DinnerRouteCalculator.parseIntSafe(entry.destId()));
      });
    return teamService.findTeamsWithMembersOrderedByTeamNumbers(adminId, teamNumbers);
  }

  public AllDinnerRoutesWithDistancesListTO calculateDinnerRouteDistances(String adminId, GeocodedAddressEntityListTO addressEntityList) {
    List<DinnerRouteTO> allDinnerRoutes = findAllDinnerRoutes(adminId).getDinnerRoutes();
    DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(addressEntityList.getAddressEntities());
    return DinnerRouteCalculator.calculateDistancesForAllDinnerRoutes(allDinnerRoutes, distanceMatrix);
  }

  
}



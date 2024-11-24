package org.runningdinner.participant;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.core.util.LogSanitizer;
import org.runningdinner.geocoder.distance.DistanceCalculator;
import org.runningdinner.geocoder.distance.DistanceEntry;
import org.runningdinner.geocoder.distance.DistanceMatrix;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.rest.TeamTO;
import org.runningdinner.participant.rest.dinnerroute.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.*;

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

    List<Team> dinnerRoute = TeamRouteBuilder.generateDinnerRoute(teamMeetingPlan.getTeam());

    Team dinnerRouteTeam = IdentifierUtil.filterListForIdMandatory(dinnerRoute, teamId);

    String mealSpecificsOfGuestTeams = dinnerRouteMessageFormatter.getMealSpecificsOfGuestTeams(dinnerRouteTeam,
      runningDinner);

    return DinnerRouteTO.newInstance(teamId, dinnerRoute, mealSpecificsOfGuestTeams, runningDinner.getAfterPartyLocation());
  }

  public List<DinnerRouteTO> findAllDinnerRoutes(@ValidateAdminId String adminId) {
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    List<DinnerRouteTO> result = new ArrayList<>();
    List<Team> teams = teamService.findTeamArrangements(adminId, true);
    for (Team team : teams) {
      result.add(findDinnerRoute(runningDinner, team.getId()));
    }
    return result;
  }

  public List<TeamDistanceClusterTO> calculateTeamDistanceClusters(@ValidateAdminId String adminId, List<GeocodedAddressEntity> addressEntities, double rangeInMeters) {
    DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(addressEntities, rangeInMeters);
    List<Team> teams = findTeamsForEntries(adminId, distanceMatrix.getEntries().keySet(), addressEntities);
    return buildTeamClusters(distanceMatrix, teams);
  }

  private List<TeamDistanceClusterTO> buildTeamClusters(DistanceMatrix distanceMatrix, List<Team> teams) {
    List<TeamDistanceClusterTO> result = new ArrayList<>();
    for (var entry : distanceMatrix.getEntries().entrySet()) {
      Team srcTeam = findTeamForTeamNumber(entry.getKey().srcId(), teams);
      Team destTeam = findTeamForTeamNumber(entry.getKey().destId(), teams);
      result.add(new TeamDistanceClusterTO(List.of(new TeamTO(srcTeam), new TeamTO(destTeam)), entry.getValue()));
    }
    return result;
  }

    private static Team findTeamForTeamNumber(String teamNumberStr, List<Team> teams) {
      int teamNumber = parseIntSafe(teamNumberStr);
      return teams
              .stream()
              .filter(t -> t.getTeamNumber() == teamNumber)
              .findFirst()
              .orElseThrow(() -> new IllegalStateException("Could not find team with teamMember " + teamNumber + " within teams " + teams));
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
        teamNumbers.add(parseIntSafe(entry.srcId()));
        teamNumbers.add(parseIntSafe(entry.destId()));
      });
    return teamService.findTeamsWithMembersOrderedByTeamNumbers(adminId, teamNumbers);
  }

  public List<DinnerRouteWithDistancesTO> calculateDinnerRouteDistances(String adminId, GeocodedAddressEntityListTO addressEntityList) {

    List<DinnerRouteWithDistancesTO> result = new ArrayList<>();

    List<DinnerRouteTO> allDinnerRoutes = findAllDinnerRoutes(adminId);

    DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(addressEntityList.getAddressEntities());

    for (DinnerRouteTO dinnerRoute: allDinnerRoutes) {
      List<DinnerRouteTeamWithDistanceTO> dinnerRouteTeamsWithDistances = calculateDistancesBetweenTeamsOnRoute(dinnerRoute, distanceMatrix);
      result.add(new DinnerRouteWithDistancesTO(dinnerRouteTeamsWithDistances));
    }
    result.sort(DinnerRouteTeamWithDistanceComparator.INSTANCE);
    return result;
  }

  private List<DinnerRouteTeamWithDistanceTO> calculateDistancesBetweenTeamsOnRoute(DinnerRouteTO dinnerRoute, DistanceMatrix distanceMatrix) {

    List<DinnerRouteTeamTO> dinnerRouteTeams = dinnerRoute.getTeams();
    List<DinnerRouteTeamWithDistanceTO> result = new ArrayList<>(dinnerRouteTeams.size());

    Map<DistanceEntry, Double> distanceMatrixEntries = distanceMatrix.getEntries();

    DinnerRouteTeamWithDistanceTO teamWithLargestDistance = null;

    for (int i = 0; i < dinnerRouteTeams.size(); i++) {
      DinnerRouteTeamTO a = dinnerRouteTeams.get(i);
      boolean isCurrentTeam = a.getTeamNumber() == dinnerRoute.getCurrentTeam().getTeamNumber();
      if (i + 1 >= dinnerRouteTeams.size()) {
        result.add(new DinnerRouteTeamWithDistanceTO(a, null, isCurrentTeam));
        break;
      }
      DinnerRouteTeamTO b = dinnerRouteTeams.get(i + 1);
      DistanceEntry distanceEntry = new DistanceEntry(String.valueOf(a.getTeamNumber()), String.valueOf(b.getTeamNumber()));
      Double distance = distanceMatrixEntries.get(distanceEntry);
      DinnerRouteTeamWithDistanceTO dinnerRouteTeamWithDistanceTO = new DinnerRouteTeamWithDistanceTO(a, distance, isCurrentTeam);
      result.add(dinnerRouteTeamWithDistanceTO);
      if (teamWithLargestDistance == null || (distance != null && distance > teamWithLargestDistance.getDistanceToNextTeam())) {
        teamWithLargestDistance = dinnerRouteTeamWithDistanceTO;
      }
    }

    if (teamWithLargestDistance != null) {
      teamWithLargestDistance.setLargestDistanceInRoute(true);
    }

    return result;
  }

  static class DinnerRouteTeamWithDistanceComparator implements Comparator<DinnerRouteWithDistancesTO> {

    static final DinnerRouteTeamWithDistanceComparator INSTANCE = new DinnerRouteTeamWithDistanceComparator();

    @Override
    public int compare(DinnerRouteWithDistancesTO o1, DinnerRouteWithDistancesTO o2) {
      Double o1MaxDistance = getMaxDistanceInRoute(o1);
      Double o2MaxDistance = getMaxDistanceInRoute(o2);
      if (o1MaxDistance == null && o2MaxDistance == null) {
        return 0;
      }
      if (o2MaxDistance == null) {
        return 1;
      }
      if (o1MaxDistance == null) {
        return -1;
      }
      return o2MaxDistance.compareTo(o1MaxDistance);
    }

    private Double getMaxDistanceInRoute(DinnerRouteWithDistancesTO route) {
      return route.teams()
              .stream()
              .map(DinnerRouteTeamWithDistanceTO::getDistanceToNextTeam)
              .filter(Objects::nonNull)
              .max(Comparator.naturalOrder())
              .orElse(null);
    }
  }

  private static int parseIntSafe(String src) {
    try {
      return Integer.parseInt(src);
    } catch (NumberFormatException e) {
      throw new TechnicalException("could not parse " + LogSanitizer.sanitize(src) + " as integer", e);
    }
  }

}



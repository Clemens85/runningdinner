package org.runningdinner.participant;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.geocoder.distance.DistanceCalculator;
import org.runningdinner.geocoder.distance.DistanceEntry;
import org.runningdinner.geocoder.distance.DistanceMatrix;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.rest.TeamTO;
import org.runningdinner.participant.rest.dinnerroute.DinnerRouteTO;
import org.runningdinner.participant.rest.dinnerroute.GeocodedAddressEntity;
import org.runningdinner.participant.rest.dinnerroute.GeocodedAddressEntityIdType;
import org.runningdinner.participant.rest.dinnerroute.TeamDistanceClusterTO;
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

  private final ParticipantService participantService;

  private final DinnerRouteMessageFormatter dinnerRouteMessageFormatter;

  public DinnerRouteService(RunningDinnerService runningDinnerService, TeamService teamService, ParticipantService participantService, DinnerRouteMessageFormatter dinnerRouteMessageFormatter) {
    this.runningDinnerService = runningDinnerService;
    this.teamService = teamService;
    this.participantService = participantService;
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
    int teamNumber = Integer.parseInt(teamNumberStr);
    return teams
            .stream()
            .filter(t -> t.getTeamNumber() == teamNumber)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Could not find team with teamMember " + teamNumber + " within teams " + teams));
  }


//  private static Team findTeamForParticipantId(UUID participantId, List<Team> teams) {
//    return teams
//            .stream()
//            .filter(t -> t.isParticipantTeamMember(participantId))
//            .findFirst()
//            .orElseThrow(() -> new IllegalStateException("Could not find team with teamMember " + participantId + " within teams " + teams));
//  }

  private List<Team> findTeamsForEntries(String adminId, Set<DistanceEntry> distanceEntries, List<GeocodedAddressEntity> addressEntities) {

    if (CollectionUtils.isEmpty(distanceEntries) || CollectionUtils.isEmpty(addressEntities)) {
      return Collections.emptyList();
    }

    GeocodedAddressEntityIdType idType = addressEntities.get(0).getIdType();
    if (idType != GeocodedAddressEntityIdType.TEAM_NR) {
      LOGGER.error("Only TEAM_NR is supported as GeocodedAddressEntityIdType but got {}  in event {}", idType, adminId);
      return Collections.emptyList();
    }

    Set<Integer> teamNumbers = new HashSet<>();
    distanceEntries
      .forEach(entry -> {
        teamNumbers.add(Integer.parseInt(entry.srcId()));
        teamNumbers.add(Integer.parseInt(entry.destId()));
      });
    return teamService.findTeamsWithMembersOrderedByTeamNumbers(adminId, teamNumbers);
  }

//  public TeamLocationsEventData findTeamLocationsEventData(@ValidateAdminId String adminId) {
//
//    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
//
//    List<MealClass> mealClasses = runningDinner.getConfiguration().getMealClasses();
//    List<Team> teams = teamService.findTeamArrangements(adminId, false);
//
//    List<TeamLocation> teamLocations = new ArrayList<TeamLocation>();
//    for (Team t : teams) {
//      if (t.getStatus() == TeamStatus.CANCELLED) {
//        teamLocations.add(new TeamLocation(t.getId(), t.getMealClass().getId(), t.getStatus(), null, null));
//      } else {
//        teamLocations.add(new TeamLocation(t.getId(), t.getMealClass().getId(), t.getStatus(), t.getHostTeamMember().getAddress(), t.getHostTeamMember().getGeocodingResult()));
//      }
//    }
//
//    TeamLocationsEventData result = new TeamLocationsEventData(runningDinner.getAdminId(), MealTO.fromMeals(mealClasses), teamLocations);
//    result.setAfterPartyLocation(null);
//    return result;
//  }

}

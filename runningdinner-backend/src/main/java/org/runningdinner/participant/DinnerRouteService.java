package org.runningdinner.participant;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.rest.dinnerroute.DinnerRouteTO;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

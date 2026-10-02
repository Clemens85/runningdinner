package org.runningdinner.dinnerroute;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import org.junit.jupiter.api.Test;
import org.runningdinner.core.MealClass;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.test.helper.Configurations;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;

public class DinnerRouteTeamTOTest {

  @Test
  public void accessibilityFlagsUseCapacityAwareHostRuleAndGuestNeeds() {

    Participant host = ParticipantGenerator.generateParticipant(1);
    host.setNumSeats(6);
    host.setHomeAccessible(true);
    host.setHost(true);
    Team accessibleHostTeam = newTeam(1, host);

    Participant guest = ParticipantGenerator.generateParticipant(2);
    guest.setNumSeats(4);
    guest.setRequiresAccessibleHome(true);
    Team guestTeam = newTeam(2, guest);
    guestTeam.addHostTeam(accessibleHostTeam);

    DinnerRouteTeamTO routeTeam = new DinnerRouteTeamTO(accessibleHostTeam, Configurations.standardConfig);

    assertThat(routeTeam.isAccessibleHostLocation()).isTrue();
    assertThat(routeTeam.isVisitingTeamsNeedAccessibleAccess()).isTrue();

    host.setNumSeats(5);
    DinnerRouteTeamTO notEnoughSeatsRouteTeam = new DinnerRouteTeamTO(accessibleHostTeam, Configurations.standardConfig);

    assertThat(notEnoughSeatsRouteTeam.isAccessibleHostLocation()).isFalse();
    assertThat(notEnoughSeatsRouteTeam.isVisitingTeamsNeedAccessibleAccess()).isTrue();
  }

  private Team newTeam(int teamNumber, Participant participant) {

    Team team = new Team(teamNumber);
    team.setMealClass(MealClass.APPETIZER());
    team.setTeamMembers(Set.of(participant));
    return team;
  }
}
